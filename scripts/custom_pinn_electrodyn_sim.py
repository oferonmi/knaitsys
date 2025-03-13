import sys
import json
import time
import numpy as np
import pandas as pd
from io import StringIO
import torch
import torch.nn as nn

# Parse input from Next.js page
try:
    input_data = json.loads(sys.argv[1])
except json.JSONDecodeError as e:
    print(f"JSON parsing error: {e}", file=sys.stderr)
    sys.exit(1)

# domain_size = float(input_data["domainSize"])
# frequency = float(input_data["frequency"])
# epochs = int(input_data["epochs"])

# # Handle CSV file if provided
# material_props = {"epsilon": 1.0, "mu": 1.0, "sigma": 0.0}

# Extract parameters from the nested structure
domain_size = float(input_data["domain"]["xRange"][1])  # Use xRange upper bound as domain_size
frequency = float(input_data["source"]["frequency"])
epochs = int(input_data["nnConfig"]["epochs"])

# Handle CSV file if provided
material_props = input_data.get("materialProps", {"epsilon": 1.0, "mu": 1.0, "sigma": 0.0})
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
def physics_loss(model, x, epsilon, mu, frequency):
    x.requires_grad_(True)
    u = model(x)  # [E, H]
    E, H = u[:, 0:1], u[:, 1:2]

    # Compute derivatives
    grads = torch.autograd.grad(E, x, grad_outputs=torch.ones_like(E), create_graph=True)[0]
    dE_dx, dE_dy, dE_dt = grads[:, 0:1], grads[:, 1:2], grads[:, 2:3]
    grads = torch.autograd.grad(H, x, grad_outputs=torch.ones_like(H), create_graph=True)[0]
    dH_dx, dH_dy, dH_dt = grads[:, 0:1], grads[:, 1:2], grads[:, 2:3]

    # Maxwell’s equations (simplified 1D wave propagation along x)
    pde_E = dE_dt + (1/mu) * dH_dx
    pde_H = dH_dt + (1/epsilon) * dE_dx

    # Source term (plane wave)
    source = torch.sin(2 * np.pi * frequency * x[:, 2:3])

    # Losses
    loss_pde = torch.mean(pde_E**2) + torch.mean(pde_H**2)
    loss_bc = torch.mean((E - 0)**2 + (H - 0)**2)  # Dirichlet BCs
    loss_ic = torch.mean((E - source)**2 + (H - 0)**2)  # Initial condition with source
    return loss_pde + loss_bc + loss_ic

# Generate Training Data
n_points = 10000
x = torch.rand(n_points, 1) * domain_size
y = torch.rand(n_points, 1) * domain_size
t = torch.rand(n_points, 1) * 1.0
X_train = torch.cat([x, y, t], dim=1).to(device)

# Boundary and Initial Points
x_bc = torch.cat([torch.zeros(n_points//10, 1), torch.ones(n_points//10, 1) * domain_size], dim=0)
y_bc = torch.rand(n_points//5, 1) * domain_size
t_bc = torch.rand(n_points//5, 1) * 1.0
X_bc = torch.cat([x_bc, y_bc, t_bc], dim=1).to(device)

x_ic = torch.rand(n_points//5, 1) * domain_size
y_ic = torch.rand(n_points//5, 1) * domain_size
t_ic = torch.zeros(n_points//5, 1)
X_ic = torch.cat([x_ic, y_ic, t_ic], dim=1).to(device)

X_all = torch.cat([X_train, X_bc, X_ic], dim=0)

# Training
model = PINN().to(device)
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)

start_time = time.time()
for epoch in range(epochs):
    optimizer.zero_grad()
    loss = physics_loss(model, X_all, material_props["epsilon"], material_props["mu"], frequency)
    loss.backward()
    optimizer.step()
    if epoch % 1000 == 0:
        print(f"Epoch {epoch}, Loss: {loss.item():.6f}", file=sys.stderr)

computation_time = time.time() - start_time

# Post-Process Results
x_eval = torch.linspace(0, domain_size, 100)  # Remove reshape
y_eval = torch.linspace(0, domain_size, 100)  # Remove reshape
t_eval = torch.linspace(0, 1.0, 10)          # Remove reshape

# Create meshgrid with proper tensor inputs
X, Y, T = torch.meshgrid(x_eval, y_eval, t_eval, indexing="ij")

# Prepare points for model evaluation
points = torch.stack([X.flatten(), Y.flatten(), T.flatten()], dim=1).to(device)
fields = model(points).detach().cpu().numpy()

# Output results as JSON
result = {
    "fields": {"E": fields[:, 0].tolist(), "H": fields[:, 1].tolist()},
    "computationTime": computation_time
}
print(json.dumps(result))