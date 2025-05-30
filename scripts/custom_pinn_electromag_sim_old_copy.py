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
from OCC.Core.STEPControl import STEPControl_Reader
from OCC.Core.BRep import BRep_Tool
from OCC.Core.BRepMesh import BRepMesh_IncrementalMesh
from OCC.Core.TopExp import TopExp_Explorer
from OCC.Core.TopoDS import topods_Face, topods
from OCC.Core.TopAbs import TopAbs_FACE
from OCC.Core.BRepTools import breptools_Triangulation
from OCC.Core.Bnd import Bnd_Box
from OCC.Core.BRepBndLib import brepbndlib
from OCC.Core.gp import gp_Pnt
from OCC.Core.IFSelect import IFSelect_RetDone
from OCC.Core.TopoDS import TopoDS_Shape
from OCC.Core.TopLoc import TopLoc_Location

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

domain_size_input = float(input_data["domainSize"])
frequency = float(input_data["frequency"])
epochs = int(input_data["epochs"])

# Generate Training Data
num_points = int(input_data["numPoints"])  # Number of training / sampling points for PINN

# cad_file_content = input_data.get("cadFile")  # Optional CAD file content
# print(f"CAD file content: {cad_file_content}", file=sys.stderr)
cad_file_path = input_data.get("cadFilePath")  # Now a path, not content
print(f"Uploaded CAD file path: {cad_file_path}", file=sys.stderr)

# Read CAD file content if path is provided
cad_file_content = None
if cad_file_path:
    try:
        file_ext = cad_file_path.split('.')[-1].lower()
        if file_ext == 'stl':
            try:
                # Explicitly force mesh loading with better error handling
                mesh = trimesh.load_mesh(cad_file_path, file_type='stl', force='mesh', process=False)
                
                if mesh is None or not isinstance(mesh, trimesh.Trimesh):
                    print("Failed to load STL file, falling back to default geometry", file=sys.stderr)
                    cad_file_content = None
                else:
                    # Validate mesh integrity
                    if not mesh.is_watertight or len(mesh.faces) == 0:
                        print("STL mesh is not watertight or empty", file=sys.stderr)
                        cad_file_content = None
                    else:
                        cad_file_content = True  # Just use as a flag, we'll use path directly
            except Exception as e:
                print(f"Critical error processing STL file: {e}", file=sys.stderr)
                cad_file_content = None
        elif file_ext == 'step':
            # Load STEP file to verify it's valid
            step_reader = STEPControl_Reader()
            status = step_reader.ReadFile(cad_file_path)
            if status == IFSelect_RetDone:
                step_reader.TransferRoots()
                shape = step_reader.OneShape()
                if shape is not None:
                    # Try to mesh the shape to verify it's valid
                    mesh = BRepMesh_IncrementalMesh(shape, 0.1)
                    mesh.Perform()
                    if mesh.IsDone():
                        cad_file_content = True  # Valid STEP file
                    else:
                        print("Invalid STEP file geometry", file=sys.stderr)
                else:
                    print("No valid shape found in STEP file", file=sys.stderr)
            else:
                print("Invalid STEP file detected", file=sys.stderr)
        else:
            print(f"Unsupported file format: {file_ext}", file=sys.stderr)
    except Exception as e:
        print(f"Error loading CAD file: {e}", file=sys.stderr)

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

# Define the Physics-Informed Neural Network (PINN) for 2D scaler fields
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

# Physics Loss Function (2D Maxwell’s Equations)
def physics_loss(model, x, epsilon, mu, frequency, boundary_mask=None):
    x.requires_grad_(True)
    u = model(x)  # [E, H]
    E, H = u[:, 0:1], u[:, 1:2]

    # Check for NaN in model output
    if torch.isnan(u).any() or torch.isinf(u).any():
        print("NaN or Inf detected in model output", file=sys.stderr)
        return torch.tensor(float('nan'), device=device)

    # Compute derivatives
    grads_E = torch.autograd.grad(E, x, grad_outputs=torch.ones_like(E), create_graph=True)[0]
    dE_dx, dE_dy, dE_dt = grads_E[:, 0:1], grads_E[:, 1:2], grads_E[:, 2:3]
    grads_H = torch.autograd.grad(H, x, grad_outputs=torch.ones_like(H), create_graph=True)[0]
    dH_dx, dH_dy, dH_dt = grads_H[:, 0:1], grads_H[:, 1:2], grads_H[:, 2:3]

    # Check for NaN in gradients
    if torch.isnan(grads_E).any() or torch.isinf(grads_E).any() or torch.isnan(grads_H).any() or torch.isinf(grads_H).any():
        print("NaN or Inf detected in gradients", file=sys.stderr)
        return torch.tensor(float('nan'), device=device)

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
        if boundary_mask.sum() == 0 or (~boundary_mask).sum() == 0:
            print("Boundary or interior mask is empty", file=sys.stderr)
            return torch.tensor(float('nan'), device=device)
        
        loss_bc = torch.mean((E[boundary_mask] - 0)**2 + (H[boundary_mask] - 0)**2)

        ic_mask = ~boundary_mask & (x[:, 2] == 0)
        if ic_mask.sum() == 0:
            print("No points satisfy initial condition", file=sys.stderr)
            loss_ic = torch.tensor(0.0, device=device)  # Default to zero if no IC points
        else:
            loss_ic = torch.mean((E[ic_mask] - source[ic_mask])**2 + (H[ic_mask] - 0)**2)

    else:
        loss_bc = torch.mean((E - 0)**2 + (H - 0)**2) # Fallback for reectangular domain
        ic_mask = (x[:, 2] == 0)
        if ic_mask.sum() == 0:
            print("No points satisfy initial condition (no CAD)", file=sys.stderr)
            loss_ic = torch.tensor(0.0, device=device)
        else:
            loss_ic = torch.mean((E[ic_mask] - source[ic_mask])**2 + (H[ic_mask] - 0)**2)

    # Check for NaN in loss components
    if torch.isnan(loss_pde).any() or torch.isnan(loss_bc).any() or torch.isnan(loss_ic).any():
        print(f"NaN detected in loss: pde={loss_pde.item()}, bc={loss_bc.item()}, ic={loss_ic.item()}", file=sys.stderr)
        return torch.tensor(float('nan'), device=device)

    return loss_pde + loss_bc + loss_ic

# Geometry Handling
def sample_points_from_geometry(cad_file_content, domain_size_input, n_points):
    domain_boundary = {"x": [], "y": []}  # To store boundary points for visualization
    if cad_file_content:
        try:
            # Check file extension to determine processing method
            file_ext = cad_file_path.split('.')[-1].lower()
            
            if file_ext == 'stl':
                try:
                    # Explicitly force mesh loading with better error handling
                    mesh = trimesh.load_mesh(cad_file_path, file_type='stl', force='mesh', process=False)
                    
                    if mesh is None or not isinstance(mesh, trimesh.Trimesh):
                        print("Failed to load STL file, falling back to default geometry", file=sys.stderr)
                        return sample_points_from_geometry(None, domain_size_input, n_points)
                    
                    # Validate mesh integrity
                    if not mesh.is_watertight or len(mesh.faces) == 0:
                        print("STL mesh is not watertight or empty", file=sys.stderr)
                        return sample_points_from_geometry(None, domain_size_input, n_points)
                    
                    bounds = mesh.bounds[:, :2]  # Get 2D bounds
                    domain_size = float(np.max(bounds[1] - bounds[0]))
                    
                    # Ensure equal number of points by sampling in batches
                    n_each = n_points // 2
                    max_attempts = 7
                    
                    for attempt in range(max_attempts):
                        try:
                            # Oversample with error checking
                            try:
                                interior_points = trimesh.sample.volume_mesh(mesh, count=n_each * 2)
                                if interior_points is None or len(interior_points) == 0:
                                    raise ValueError("Failed to sample interior points")
                                interior_points = interior_points[:, :2]  # Get 2D projection
                            except Exception as e:
                                print(f"Error sampling interior points: {e}", file=sys.stderr)
                                continue

                            try:
                                boundary_points = mesh.sample(n_each * 2)
                                if boundary_points is None or len(boundary_points) == 0:
                                    raise ValueError("Failed to sample boundary points")
                                boundary_points = boundary_points[:, :2]  # Get 2D projection
                            except Exception as e:
                                print(f"Error sampling boundary points: {e}", file=sys.stderr)
                                continue
                            
                            # Trim to exact size with validation
                            if len(interior_points) >= n_each and len(boundary_points) >= n_each:
                                interior_points = interior_points[:n_each]
                                boundary_points = boundary_points[:n_each]
                                
                                # Convert to tensors with error checking
                                try:
                                    X_interior = torch.tensor(interior_points, dtype=torch.float32, device=device)
                                    X_boundary = torch.tensor(boundary_points, dtype=torch.float32, device=device)
                                    
                                    # Add time dimension
                                    t_interior = torch.rand(n_each, 1, device=device) * 1.0
                                    t_boundary = torch.rand(n_each, 1, device=device) * 1.0
                                    
                                    # Combine points
                                    X_train = torch.cat([
                                        torch.cat([X_interior, t_interior], dim=1),
                                        torch.cat([X_boundary, t_boundary], dim=1)
                                    ], dim=0)
                                    
                                    boundary_mask = torch.cat([
                                        torch.zeros(n_each, dtype=torch.bool, device=device),
                                        torch.ones(n_each, dtype=torch.bool, device=device)
                                    ])

                                    # Validate final tensors
                                    if torch.isnan(X_train).any() or torch.isnan(boundary_mask).any():
                                        raise ValueError("NaN values detected in tensors")

                                    # Store boundary points for visualization
                                    domain_boundary["x"] = boundary_points[:, 0].tolist()
                                    domain_boundary["y"] = boundary_points[:, 1].tolist()
                                    
                                    return X_train, boundary_mask, bounds, domain_size, domain_boundary
                                    
                                except Exception as e:
                                    print(f"Error creating tensors: {e}", file=sys.stderr)
                                    continue
                            
                            print(f"Attempt {attempt + 1}: Resampling due to incorrect point count", file=sys.stderr)
                            
                        except Exception as e:
                            print(f"Attempt {attempt + 1} failed: {e}", file=sys.stderr)
                            continue
                    
                    print("Failed to sample correct number of points after all attempts", file=sys.stderr)
                    return sample_points_from_geometry(None, domain_size_input, n_points)
                    
                except Exception as e:
                    print(f"Critical error processing STL file: {e}", file=sys.stderr)
                    return sample_points_from_geometry(None, domain_size_input, n_points)
                
            elif file_ext == 'step':
                try:
                    step_reader = STEPControl_Reader()
                    status = step_reader.ReadFile(str(cad_file_path))  # Ensure path is string
                    
                    if status != IFSelect_RetDone:
                        print(f"Failed to read STEP file with status: {status}", file=sys.stderr)
                        return sample_points_from_geometry(None, domain_size_input, n_points)
                    
                    # Transfer shapes and get number of roots
                    status = step_reader.TransferRoots()
                    num_roots = step_reader.NbRootsForTransfer()
                    
                    if num_roots < 1:
                        print("No valid shapes found in STEP file", file=sys.stderr)
                        return sample_points_from_geometry(None, domain_size_input, n_points)
                    
                    shape = step_reader.OneShape()
                    
                    # Create mesh with higher precision
                    mesh = BRepMesh_IncrementalMesh(shape, 0.01)  # Reduced tolerance for better precision
                    mesh.Perform()
                    if not mesh.IsDone():
                        print("Failed to mesh STEP geometry", file=sys.stderr)
                        return sample_points_from_geometry(None, domain_size_input, n_points)

                    # Sample points from the shape
                    explorer = TopExp_Explorer(shape, TopAbs_FACE)
                    boundary_points = []
                    
                    while explorer.More():
                        face = topods.Face(explorer.Current())  # Updated to use topods.Face
                        loc = TopLoc_Location()
                        poly = BRep_Tool.Triangulation(face, loc)
                        
                        if poly is not None:
                            if not loc.IsIdentity():
                                trsf = loc.Transformation()
                            
                            # Get nodes from triangulation
                            nodes = poly.Node  # Use Node instead of Nodes
                            for i in range(1, poly.NbNodes() + 1):
                                pnt = nodes(i)  # Use () instead of .Value()
                                if not loc.IsIdentity():
                                    pnt.Transform(trsf)
                                boundary_points.append([pnt.X(), pnt.Y()])
                        explorer.Next()

                    if not boundary_points:
                        print("No valid points found in STEP geometry", file=sys.stderr)
                        return sample_points_from_geometry(None, domain_size_input, n_points)

                    # Convert to numpy array and process points
                    boundary_points = np.array(boundary_points)
                    
                    # Get bounding box
                    bbox = Bnd_Box()
                    brepbndlib.Add(shape, bbox)
                    x_min, y_min, z_min, x_max, y_max, z_max = bbox.Get()
                    bounds = np.array([[x_min, y_min], [x_max, y_max]])
                    domain_size = float(max(x_max - x_min, y_max - y_min))

                    # Sample interior points
                    n_interior = n_points // 2
                    interior_points = np.random.uniform(
                        [x_min, y_min],
                        [x_max, y_max],
                        (n_interior, 2)
                    )

                    # Ensure correct number of boundary points
                    if len(boundary_points) > n_points // 2:
                        indices = np.random.choice(len(boundary_points), n_points // 2, replace=False)
                        boundary_points = boundary_points[indices]
                    elif len(boundary_points) < n_points // 2:
                        boundary_points = np.pad(
                            boundary_points,
                            ((0, n_points // 2 - len(boundary_points)), (0, 0)),
                            mode='edge'
                        )

                    # Create tensors and time dimension
                    t_interior = torch.rand(n_interior, 1, device=device)
                    t_boundary = torch.rand(len(boundary_points), 1, device=device)
                    
                    X_interior = torch.tensor(interior_points, dtype=torch.float32, device=device)
                    X_boundary = torch.tensor(boundary_points, dtype=torch.float32, device=device)
                    
                    X_train = torch.cat([
                        torch.cat([X_interior, t_interior], dim=1),
                        torch.cat([X_boundary, t_boundary], dim=1)
                    ], dim=0)

                    boundary_mask = torch.cat([
                        torch.zeros(n_interior, dtype=torch.bool, device=device),
                        torch.ones(len(boundary_points), dtype=torch.bool, device=device)
                    ])

                    # Store boundary points for visualization
                    domain_boundary["x"] = boundary_points[:, 0].tolist()
                    domain_boundary["y"] = boundary_points[:, 1].tolist()

                    return X_train, boundary_mask, bounds, domain_size, domain_boundary

                except Exception as e:
                    print(f"Error processing STEP file: {str(e)}", file=sys.stderr)
                    return sample_points_from_geometry(None, domain_size_input, n_points)

            else:
                print(f"Unsupported file format: {file_ext}", file=sys.stderr)
                return sample_points_from_geometry(None, domain_size_input, n_points)

        except Exception as e:
            print(f"Error processing CAD file: {e}", file=sys.stderr)
            return sample_points_from_geometry(None, domain_size_input, n_points)
    else:
        domain_size = float(domain_size_input)
        n_points_total = n_points * 3 // 5
        n_bc_points = n_points // 5
        n_ic_points = n_points // 5
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
        bounds = np.array([[0, 0], [domain_size, domain_size]])
        domain_boundary["x"] = [0, domain_size, domain_size, 0, 0]
        domain_boundary["y"] = [0, 0, domain_size, domain_size, 0]
        return X_all, None, bounds, domain_size, domain_boundary

X_all, boundary_mask, bounds, effective_domain_size, domain_boundary = sample_points_from_geometry(cad_file_content, domain_size_input, num_points)

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
    if torch.isnan(loss):
        print(f"Epoch {epoch}: Loss is NaN, stopping training", file=sys.stderr)
        break
    loss.backward()
    optimizer.step()
    if epoch % 1000 == 0:
        print(f"Epoch {epoch}, Loss: {loss.item():.6f}", file=sys.stderr)

computation_time = time.time() - start_time

def evaluate_fields(model, cad_file_content, bounds):
    if cad_file_content:
        try:
            # Check file extension to determine processing method
            file_ext = cad_file_path.split('.')[-1].lower()
            eval_points = []

            if file_ext == 'stl':
                # Handle STL file
                mesh = trimesh.load_mesh(cad_file_path, file_type='stl', force='mesh')
                
                if mesh is None or not isinstance(mesh, trimesh.Trimesh):
                    print("Failed to load STL for evaluation, using default grid", file=sys.stderr)
                    return evaluate_fields(None, bounds)
                
                # Sample points from the mesh
                eval_points = mesh.sample(1000)[:, :2]  # 2D projection
                
            elif file_ext == 'step':
                # Handle STEP file
                step_reader = STEPControl_Reader()
                status = step_reader.ReadFile(cad_file_path)
                if status != IFSelect_RetDone:  # Check proper status
                    print("Failed to read STEP file for evaluation", file=sys.stderr)
                    return evaluate_fields(model, None, bounds)  # Pass model parameter

                step_reader.TransferRoots()
                shape = step_reader.OneShape()

                # Create mesh for sampling
                mesh = BRepMesh_IncrementalMesh(shape, 0.01)  # Higher precision
                mesh.Perform()

                # Sample points from the shape
                explorer = TopExp_Explorer(shape, TopAbs_FACE)
                boundary_points = []
                
                while explorer.More():
                    face = topods.Face(explorer.Current())  # Updated to use topods.Face
                    loc = TopLoc_Location()
                    poly = BRep_Tool.Triangulation(face, loc)
                    
                    if poly is not None:
                        if not loc.IsIdentity():
                            trsf = loc.Transformation()
                        
                        # Get nodes from triangulation
                        nodes = poly.Node  # Use Node instead of Nodes
                        for i in range(1, poly.NbNodes() + 1):
                            pnt = nodes(i)  # Use () instead of .Value()
                            if not loc.IsIdentity():
                                pnt.Transform(trsf)
                            boundary_points.append([pnt.X(), pnt.Y()])
                    explorer.Next()

                if not boundary_points:
                    print("No valid points found in STEP geometry", file=sys.stderr)
                    return evaluate_fields(model, None, bounds)

                # Convert to numpy array and process points
                boundary_points = np.array(boundary_points)
                
                # Get bounding box for uniform sampling
                bbox = Bnd_Box()
                brepbndlib.Add(shape, bbox)
                x_min, y_min, _, x_max, y_max, _ = bbox.Get()
                
                # Generate uniform grid of points
                x_points = np.linspace(x_min, x_max, 32)
                y_points = np.linspace(y_min, y_max, 32)
                X, Y = np.meshgrid(x_points, y_points)
                eval_points = np.column_stack((X.flatten(), Y.flatten()))

                # Ensure we have exactly 1000 points
                if len(eval_points) > 1000:
                    indices = np.random.choice(len(eval_points), 1000, replace=False)
                    eval_points = eval_points[indices]
                elif len(eval_points) < 1000:
                    additional_points = np.random.uniform(
                        [x_min, y_min],
                        [x_max, y_max],
                        (1000 - len(eval_points), 2)
                    )
                    eval_points = np.vstack([eval_points, additional_points])

            else:
                print(f"Unsupported file format: {file_ext}", file=sys.stderr)
                return evaluate_fields(model, None, bounds)  # Pass model parameter

            # Create time points for evaluation
            eval_points = torch.tensor(eval_points, dtype=torch.float32, device=device)
            t_eval = torch.linspace(0, 1.0, 10, device=device)
            points = []
            for t in t_eval:
                points.append(torch.cat([
                    eval_points,
                    t.repeat(eval_points.size(0), 1)
                ], dim=1))
            points = torch.cat(points, dim=0)

        except Exception as e:
            print(f"Error evaluating fields with CAD file: {e}", file=sys.stderr)
            return evaluate_fields(model, None, bounds)  # Pass model parameter
    else:
        x_min, y_min = bounds[0]
        x_max, y_max = bounds[1]
        x_eval = torch.linspace(x_min, x_max, 100, device=device)
        y_eval = torch.linspace(y_min, y_max, 100, device=device)
        t_eval = torch.linspace(0, 1.0, 5, device=device)
        X, Y, T = torch.meshgrid(x_eval, y_eval, t_eval, indexing="ij")
        points = torch.stack([X.flatten(), Y.flatten(), T.flatten()], dim=1)

    fields = model(points).detach().cpu().numpy()
    points_np = points[:, :2].detach().cpu().numpy()  # x, y only
    return fields, points_np

fields, eval_points = evaluate_fields(model, cad_file_content, bounds)

# Output results as JSON
result = {
    "fields": {
        "E": fields[:, 0].tolist(), 
        "H": fields[:, 1].tolist()
    },
    "points": {
        "x": eval_points[:, 0].tolist(),
        "y": eval_points[:, 1].tolist()
    },
    "computationTime": computation_time,
    "cadFilePresent": bool(cad_file_content),
    "effectiveDomainSize": float(effective_domain_size),
    "domainBoundary": domain_boundary
}
print(json.dumps(result))