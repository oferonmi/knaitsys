import sys
import json
import numpy as np
import pandas as pd
from io import StringIO
from modulus.sym.geometry.primitives_2d import Rectangle
from modulus.sym.domain import Domain
from modulus.sym.domain.constraint import PointwiseBoundaryConstraint, PointwiseInteriorConstraint
from modulus.sym.eq.pdes.electromagnetics import MaxwellEquations2D
from modulus.sym.models.fully_connected import FullyConnectedArch
from modulus.sym.solver import Solver
from modulus.sym.key import Key

# Parse input from Next.js (now a JSON string from FormData)
input_data = json.loads(sys.argv[1])
domain_size = float(input_data["domainSize"])
frequency = float(input_data["frequency"])
epochs = int(input_data["epochs"])

# Handle CSV file if provided (assumes CSV has columns: x, y, epsilon, mu, sigma)
material_props = {"epsilon": 1.0, "mu": 1.0, "sigma": 0.0}
if "csvFile" in input_data:
    csv_content = input_data["csvFile"]  # Assuming API sends CSV content as string
    df = pd.read_csv(StringIO(csv_content))
    # Use average material properties for simplicity
    material_props["epsilon"] = df["epsilon"].mean() if "epsilon" in df else 1.0
    material_props["mu"] = df["mu"].mean() if "mu" in df else 1.0
    material_props["sigma"] = df["sigma"].mean() if "sigma" in df else 0.0

# Handle CAD file if provided (placeholder for geometry parsing)
if "cadFile" in input_data:
    # For simplicity, assume CAD defines a rectangular domain; real parsing requires a library like trimesh or pygmsh
    cad_content = input_data["cadFile"]  # Raw file content (needs server-side handling)
    # Placeholder: Assume domain_size is overridden by CAD bounds
    print("CAD file detected; using domain_size from form input as fallback.")

# Step 1: Define the Problem Domain
x_range = [0, domain_size]
y_range = [0, domain_size]
t_range = [0, 1.0]
domain_geom = Rectangle((x_range[0], y_range[0]), (x_range[1], y_range[1]))
domain = Domain()

# Step 2: Set Material Properties
epsilon = material_props["epsilon"]
mu = material_props["mu"]

# Step 3: Formulate Governing Equations
maxwell = MaxwellEquations2D(epsilon=epsilon, mu=mu)
network = FullyConnectedArch(
    input_keys=[Key("x"), Key("y"), Key("t")],
    output_keys=[Key("E"), Key("H")],
    layer_size=[4, 64, 64, 2]
)

# Step 4: Discretize (Sample points)
nr_points = 10000
interior_points = domain_geom.sample_interior(nr_points)
boundary_points = domain_geom.sample_boundary(nr_points // 10)

# Step 5: Boundary and Initial Conditions
bc = PointwiseBoundaryConstraint(
    nodes=network.nodes,
    geometry=domain_geom,
    outvar={"E": 0, "H": 0},
    batch_size=1000,
)
domain.add_constraint(bc, "boundary")

ic = PointwiseInteriorConstraint(
    nodes=network.nodes,
    geometry=domain_geom,
    outvar={"E": 0, "H": 0},
    batch_size=1000,
    parameterization={"t": t_range[0]},
)
domain.add_constraint(ic, "initial")

# Step 6: Specify Sources
source_term = lambda x, y, t: np.sin(2 * np.pi * frequency * t)
interior = PointwiseInteriorConstraint(
    nodes=network.nodes,
    geometry=domain_geom,
    outvar={"E": source_term},
    batch_size=1000,
)
domain.add_constraint(interior, "interior")

# Step 9: Solve the System
slv = Solver(domain=domain, network_dir="output")
slv.solve(max_steps=epochs)

# Step 10: Post-Process Results
x = np.linspace(x_range[0], x_range[1], 100)
y = np.linspace(y_range[0], y_range[1], 100)
t = np.linspace(t_range[0], t_range[1], 10)
X, Y, T = np.meshgrid(x, y, t)
inputs = np.stack([X.flatten(), Y.flatten(), T.flatten()], axis=-1)
fields = network.predict(inputs)

# Output results as JSON
result = {
    "fields": {"E": fields["E"].tolist(), "H": fields["H"].tolist()},
    "computationTime": 123.45,  # Placeholder
}
print(json.dumps(result))