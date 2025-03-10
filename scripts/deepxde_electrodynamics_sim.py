import sys
import json
import numpy as np
import pandas as pd
from io import StringIO
import deepxde as dde
import tensorflow as tf

# Explicitly set the backend to tensorflow
dde.backend.load_backend("tensorflow")
# dde.backend.load_backend("tensorflow.compat.v1")
# tf.disable_v2_behavior()

# Parse input from Next.js
# Debug: Print raw argument
# print(f"Raw sys.argv[1]: {sys.argv[1]}", file=sys.stderr)

try:
    input_data = json.loads(sys.argv[1])
except json.JSONDecodeError as e:
    print(f"JSON parsing error: {e}", file=sys.stderr)
    sys.exit(1)

# Extract parameters from the nested structure
domain_size = float(input_data["domain"]["xRange"][1])  # Use xRange upper bound as domain_size
frequency = float(input_data["source"]["frequency"])
epochs = int(input_data["nnConfig"]["epochs"])

# Handle CSV file if provided
material_props = input_data.get("materialProps", {"epsilon": 1.0, "mu": 1.0, "sigma": 0.0})
if "csvFile" in input_data:
    csv_content = input_data["csvFile"]
    df = pd.read_csv(StringIO(csv_content))
    material_props["epsilon"] = df["epsilon"].mean() if "epsilon" in df else material_props["epsilon"]
    material_props["mu"] = df["mu"].mean() if "mu" in df else material_props["mu"]
    material_props["sigma"] = df["sigma"].mean() if "sigma" in df else material_props["sigma"]

# Step 1: Define the Problem Domain
geom = dde.geometry.Rectangle([0, 0], [domain_size, domain_size])
timedomain = dde.geometry.TimeDomain(0, 1.0)
geomtime = dde.geometry.GeometryXTime(geom, timedomain)

# Step 2: Set Material Properties
epsilon = material_props["epsilon"]
mu = material_props["mu"]

# Step 3: Define PDE (Simplified Maxwell’s equations in time domain)
def pde(x, u):
    E, H = u[:, 0:1], u[:, 1:2]  # E and H fields
    dE_dt = dde.grad.jacobian(u, x, i=0, j=2)  # ∂E/∂t
    dH_dt = dde.grad.jacobian(u, x, i=1, j=2)  # ∂H/∂t
    dE_dx = dde.grad.jacobian(u, x, i=0, j=0)  # ∂E/∂x
    dH_dx = dde.grad.jacobian(u, x, i=1, j=0)  # ∂H/∂x
    # Maxwell’s equations (1D approximation for simplicity)
    return [dE_dt + (1/mu) * dH_dx, dH_dt + (1/epsilon) * dE_dx]

# Step 4: Define Boundary and Initial Conditions
bc = dde.icbc.DirichletBC(geomtime, lambda x: 0, lambda _, on_boundary: on_boundary)
ic_E = dde.icbc.IC(geomtime, lambda x: 0, lambda _, on_initial: on_initial, component=0)
ic_H = dde.icbc.IC(geomtime, lambda x: 0, lambda _, on_initial: on_initial, component=1)

# Step 5: Define Source Term
def source(x):
    # return torch.sin(2 * np.pi * frequency * x[:, 2:3])  # Plane wave source
    return tf.sin(2 * np.pi * frequency * x[:, 2:3])

data = dde.data.TimePDE(
    geomtime,
    pde,
    [bc, ic_E, ic_H],
    num_domain=10000,
    num_boundary=1000,
    num_initial=1000,
    train_distribution="Hammersley"
)

# Step 6: Define Neural Network
net = dde.nn.FNN([3] + [64] * 3 + [2], "tanh", "Glorot normal")  # Input: (x, y, t), Output: (E, H)

# Apply source term
# net.apply_output_transform(lambda x, y: y + [source(x), 0])
# net.apply_output_transform(lambda x, y: y + torch.cat([source(x), torch.zeros_like(source(x))], dim=1))
net.apply_output_transform(lambda x, y: y + tf.concat([source(x), tf.zeros_like(source(x))], axis=1))

# Step 7: Train the Model
model = dde.Model(data, net)
model.compile("adam", lr=1e-3)
model.train(iterations=epochs)

# Step 8: Post-Process Results
x = np.linspace(0, domain_size, 100)
y = np.linspace(0, domain_size, 100)
t = np.linspace(0, 1.0, 10)
X, Y, T = np.meshgrid(x, y, t)
points = np.vstack((X.flatten(), Y.flatten(), T.flatten())).T
fields = model.predict(points)  # Predict E and H

# Output results as JSON
result = {
    "fields": {"E": fields[:, 0].tolist(), "H": fields[:, 1].tolist()},
    "computationTime": 123.45,  # Placeholder
}
print(json.dumps(result))