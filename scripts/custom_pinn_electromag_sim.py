import sys
import json
import base64
from io import StringIO
import time
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import trimesh

# Parse base64 encoded input from Next.js
try:
    encoded_data = sys.argv[1]
    json_str = base64.b64decode(encoded_data).decode('utf-8')
    input_data = json.loads(json_str)
except IndexError:
    print("Error: No input data provided", file=sys.stderr)
    sys.exit(1)
except base64.binascii.Error:
    print("Error: Invalid base64 encoding", file=sys.stderr)
    sys.exit(1)
except json.JSONDecodeError as e:
    print(f"JSON parsing error: {e}", file=sys.stderr)
    sys.exit(1)

domain_size = float(input_data["domainSize"])
frequency = float(input_data["frequency"])
epochs = int(input_data["epochs"])
cad_file_content = input_data.get("cadFile")  # Optional CAD file content

# Handle CSV file if provided
material_props = {"epsilon": 1.0, "mu": 1.0, "sigma": 0.0}
if "csvFile" in input_data:
    csv_content = input_data["csvFile"]
    df = pd.read_csv(StringIO(csv_content))
    material_props["epsilon"] = df["epsilon"].mean() if "epsilon" in df else 1.0
    material_props["mu"] = df["mu"].mean() if "mu" in df else 1.0
    material_props["sigma"] = df["sigma"].mean() if "sigma" in df else 0.0

# Device setup (CPU/GPU fallback)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}", file=sys.stderr)

# Define the Neural Network
class PINN(nn.Module):
    def __init__(self):
        super(PINN, self).__init__()
        self.net = nn.Sequential(
            nn.Linear(3, 64),  # Input: x, y, t
            nn.Tanh(),
            nn.Linear(64, 64),
            nn.Tanh(),
            nn.Linear(64, 64),
            nn.Tanh(),
            nn.Linear(64, 2)   # Output: E, H
        )

    def forward(self, x):
        return self.net(x)

# Physics Loss Function
def physics_loss(model, x, epsilon, mu, frequency, boundary_mask=None):
    x.requires_grad_(True)
    u = model(x)  # [E, H]
    E, H = u[:, 0:1], u[:, 1:2]

    # Compute derivatives
    grads_E = torch.autograd.grad(E, x, grad_outputs=torch.ones_like(E), create_graph=True)[0]
    dE_dx, dE_dy, dE_dt = grads_E[:, 0:1], grads_E[:, 1:2], grads_E[:, 2:3]
    grads_H = torch.autograd.grad(H, x, grad_outputs=torch.ones_like(H), create_graph=True)[0]
    dH_dx, dH_dy, dH_dt = grads_H[:, 0:1], grads_H[:, 1:2], grads_H[:, 2:3]

    # Maxwell’s equations (simplified 1D wave propagation along x)
    pde_E = dE_dt + (1/mu) * dH_dx
    pde_H = dH_dt + (1/epsilon) * dE_dx

    # Source term (plane wave)
    source = torch.sin(2 * np.pi * frequency * x[:, 2:3])

    # Losses
    loss_pde = torch.mean(pde_E**2) + torch.mean(pde_H**2)

    # loss_bc = torch.mean((E - 0)**2 + (H - 0)**2)  # Dirichlet BCs
    # loss_ic = torch.mean((E - source)**2 + (H - 0)**2)  # Initial condition with source

    if boundary_mask is not None:
        loss_bc = torch.mean((E[boundary_mask] - 0)**2 + (H[boundary_mask] - 0)**2)
        loss_ic = torch.mean((E[~boundary_mask & (x[:, 2] == 0)] - source[~boundary_mask & (x[:, 2] == 0)])**2 + 
                             (H[~boundary_mask & (x[:, 2] == 0)] - 0)**2)
    else:
        loss_bc = torch.mean((E - 0)**2 + (H - 0)**2)  # Fallback for rectangular domain
        loss_ic = torch.mean((E[x[:, 2] == 0] - source[x[:, 2] == 0])**2 + (H[x[:, 2] == 0] - 0)**2)

    return loss_pde + loss_bc + loss_ic

# Geometry Handling
def sample_points_from_geometry(cad_file_content, domain_size, n_points):
    if cad_file_content:
        # Save CAD file content to a temporary file
        with open("temp.stl", "w") as f:
            f.write(cad_file_content)
        mesh = trimesh.load("temp.stl")
        # Sample interior and boundary points
        interior_points = trimesh.sample.volume_mesh(mesh, count=n_points//2)
        boundary_points = mesh.sample(n_points//2)
        # Add time dimension
        t_interior = torch.rand(n_points//2, 1, device=device) * 1.0
        t_boundary = torch.rand(n_points//2, 1, device=device) * 1.0
        X_interior = torch.tensor(interior_points[:, :2], dtype=torch.float32, device=device)
        X_boundary = torch.tensor(boundary_points[:, :2], dtype=torch.float32, device=device)
        X_train = torch.cat([torch.cat([X_interior, t_interior], dim=1), 
                             torch.cat([X_boundary, t_boundary], dim=1)], dim=0)
        boundary_mask = torch.cat([torch.zeros(n_points//2, dtype=torch.bool, device=device), 
                                   torch.ones(n_points//2, dtype=torch.bool, device=device)])
        return X_train, boundary_mask
    else:
        # Default rectangular domain
        n_points_total = n_points * 3 // 5  # Interior points
        n_bc_points = n_points // 5        # Boundary points per edge
        n_ic_points = n_points // 5        # Initial points
        x = torch.rand(n_points_total, 1, device=device) * domain_size
        y = torch.rand(n_points_total, 1, device=device) * domain_size
        t = torch.rand(n_points_total, 1, device=device) * 1.0
        X_train = torch.cat([x, y, t], dim=1)
        x_bc = torch.cat([torch.zeros(n_bc_points, 1, device=device), 
                          torch.ones(n_bc_points, 1, device=device) * domain_size], dim=0)
        y_bc = torch.rand(n_bc_points * 2, 1, device=device) * domain_size
        t_bc = torch.rand(n_bc_points * 2, 1, device=device) * 1.0
        X_bc = torch.cat([x_bc, y_bc, t_bc], dim=1)
        x_ic = torch.rand(n_ic_points, 1, device=device) * domain_size
        y_ic = torch.rand(n_ic_points, 1, device=device) * domain_size
        t_ic = torch.zeros(n_ic_points, 1, device=device)
        X_ic = torch.cat([x_ic, y_ic, t_ic], dim=1)
        X_all = torch.cat([X_train, X_bc, X_ic], dim=0)
        return X_all, None

# Generate Training Data
n_points = int(input_data["numPoints"])  # Number of training / sampling points for PINN

# x = torch.rand(n_points, 1, device=device) * domain_size
# y = torch.rand(n_points, 1, device=device) * domain_size
# t = torch.rand(n_points, 1, device=device) * 1.0
# X_train = torch.cat([x, y, t], dim=1)

# # Boundary and Initial Points
# x_bc = torch.cat([torch.zeros(n_points//10, 1, device=device), 
#                   torch.ones(n_points//10, 1, device=device) * domain_size], dim=0)
# y_bc = torch.rand(n_points//5, 1, device=device) * domain_size
# t_bc = torch.rand(n_points//5, 1, device=device) * 1.0
# X_bc = torch.cat([x_bc, y_bc, t_bc], dim=1)

# x_ic = torch.rand(n_points//5, 1, device=device) * domain_size
# y_ic = torch.rand(n_points//5, 1, device=device) * domain_size
# t_ic = torch.zeros(n_points//5, 1, device=device)
# X_ic = torch.cat([x_ic, y_ic, t_ic], dim=1)

# X_all = torch.cat([X_train, X_bc, X_ic], dim=0)

X_all, boundary_mask = sample_points_from_geometry(cad_file_content, domain_size, n_points)

# Training
model = PINN().to(device)
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)

# Enable CUDA optimizations if on GPU
if torch.cuda.is_available():
    torch.cuda.empty_cache()  # Clear GPU memory
    torch.backends.cudnn.benchmark = True  # Optimize for GPU

start_time = time.time()
for epoch in range(epochs):
    optimizer.zero_grad()
    loss = physics_loss(model, X_all, material_props["epsilon"], material_props["mu"], frequency, boundary_mask)
    loss.backward()
    optimizer.step()
    if epoch % 1000 == 0:
        print(f"Epoch {epoch}, Loss: {loss.item():.6f}", file=sys.stderr)

computation_time = time.time() - start_time

# Post-Process Results
# x_eval = torch.linspace(0, domain_size, 100, device=device).reshape(-1, 1)
# y_eval = torch.linspace(0, domain_size, 100, device=device).reshape(-1, 1)
# t_eval = torch.linspace(0, 1.0, 10, device=device).reshape(-1, 1)

# x_eval = torch.linspace(0, domain_size, 100, device=device)  # Remove reshape
# y_eval = torch.linspace(0, domain_size, 100, device=device)  # Remove reshape
# t_eval = torch.linspace(0, 1.0, 10, device=device) 

# # Generate meshgrid  with proper tensor input for evaluation
# X, Y, T = torch.meshgrid(x_eval, y_eval, t_eval, indexing="ij")
# points = torch.stack([X.flatten(), Y.flatten(), T.flatten()], dim=1)
# fields = model(points).detach().cpu().numpy()  # Move to CPU for serialization

def evaluate_fields(model, domain_size, cad_file_content):
    if cad_file_content:
        mesh = trimesh.load("temp.stl")
        bounds = mesh.bounds
        x_min, y_min = bounds[0][:2]
        x_max, y_max = bounds[1][:2]
        x_eval = torch.linspace(x_min, x_max, 100, device=device)
        y_eval = torch.linspace(y_min, y_max, 100, device=device)
    else:
        x_eval = torch.linspace(0, domain_size, 100, device=device)
        y_eval = torch.linspace(0, domain_size, 100, device=device)
    t_eval = torch.linspace(0, 1.0, 10, device=device)
    # Generate meshgrid  with proper tensor input for evaluation
    X, Y, T = torch.meshgrid(x_eval, y_eval, t_eval, indexing="ij")
    points = torch.stack([X.flatten(), Y.flatten(), T.flatten()], dim=1)
    fields = model(points).detach().cpu().numpy()
    return fields

fields = evaluate_fields(model, domain_size, cad_file_content)

# Output results as JSON
result = {
    "fields": {"E": fields[:, 0].tolist(), "H": fields[:, 1].tolist()},
    "computationTime": computation_time
}
print(json.dumps(result))

# Clean up temporary file
if cad_file_content:
    import os
    os.remove("temp.stl")