import sys
import json
import numpy as np
from modulus.sym.geometry.primitives_2d import Rectangle
from modulus.sym.domain import Domain
from modulus.sym.domain.constraint import PointwiseBoundaryConstraint, PointwiseInteriorConstraint
from modulus.sym.eq.pdes.electromagnetics import MaxwellEquations2D
from modulus.sym.models.fully_connected import FullyConnectedArch
from modulus.sym.solver import Solver
from modulus.sym.key import Key

# Parse input from Next.js
params = json.loads(sys.argv[1])

# Step 1: Define the Problem Domain
x_range = params["domain"]["xRange"]
y_range = params["domain"]["yRange"]
t_range = params["domain"]["tRange"]
domain_geom = Rectangle((x_range[0], y_range[0]), (x_range[1], y_range[1]))
domain = Domain()

# Step 2: Set Material Properties
epsilon = params["materialProps"]["epsilon"]
mu = params["materialProps"]["mu"]

# Step 3: Formulate Governing Equations
maxwell = MaxwellEquations2D(epsilon=epsilon, mu=mu)
network = FullyConnectedArch(
    input_keys=[Key("x"), Key("y"), Key("t")],
    output_keys=[Key("E"), Key("H")],
    layer_size=params["nnConfig"]["layers"]
)

# Step 4: Discretize (Sample points)
nr_points = params["numPoints"]
interior_points = domain_geom.sample_interior(nr_points)
boundary_points = domain_geom.sample_boundary(nr_points // 10)

# Step 5: Boundary and Initial Conditions
bc = PointwiseBoundaryConstraint(
    nodes=network.nodes,
    geometry=domain_geom,
    outvar={"E": 0, "H": 0},  # Simplified Dirichlet BC
    batch_size=1000,
)
domain.add_constraint(bc, "boundary")

ic = PointwiseInteriorConstraint(
    nodes=network.nodes,
    geometry=domain_geom,
    outvar={"E": 0, "H": 0},  # Initial condition
    batch_size=1000,
    parameterization={"t": t_range[0]},
)
domain.add_constraint(ic, "initial")

# Step 6: Specify Sources (Simplified plane wave)
source_freq = params["source"]["frequency"]
source_term = lambda x, y, t: np.sin(2 * np.pi * source_freq * t)
interior = PointwiseInteriorConstraint(
    nodes=network.nodes,
    geometry=domain_geom,
    outvar={"E": source_term},  # Source drives E-field
    batch_size=1000,
)
domain.add_constraint(interior, "interior")

# Step 9: Solve the System
slv = Solver(domain=domain, network_dir="output")
slv.solve()

# Step 10: Post-Process Results
x = np.linspace(x_range[0], x_range[1], 100)
y = np.linspace(y_range[0], y_range[1], 100)
t = np.linspace(t_range[0], t_range[1], 10)
X, Y, T = np.meshgrid(x, y, t)
inputs = np.stack([X.flatten(), Y.flatten(), T.flatten()], axis=-1)
fields = network.predict(inputs)  # Predict E and H fields

# Output results as JSON
result = {
    "fields": {"E": fields["E"].tolist(), "H": fields["H"].tolist()},
    "computationTime": 123.45,  # Placeholder
}
print(json.dumps(result))