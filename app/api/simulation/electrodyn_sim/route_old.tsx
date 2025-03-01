import { NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";

// Define types for simulation parameters and results
interface SimulationParams {
  domain: {
    xRange: [number, number];
    yRange: [number, number];
    tRange: [number, number];
  };
  materialProps: {
    epsilon: number;
    mu: number;
    sigma: number;
  };
  numPoints: number;
  boundaryConditions: {
    type: string;
    value: number;
  };
  initialConditions: {
    E: number;
    H: number;
  };
  source: {
    type: string;
    frequency: number;
    amplitude: number;
  };
  nnConfig: {
    layers: number[];
    epochs: number;
  };
}

interface SimulationResult {
  fields: {
    E: number[];
    H: number[];
  };
  computationTime: number;
}

interface RequestBody {
  domainSize: number;
  frequency: number;
  epochs: number;
}

interface ResponseData {
  success: boolean;
  data?: {
    fields: {
      E: number[];
      H: number[];
    };
    metadata: {
      domainSize: number;
      frequency: number;
      computationTime: number;
    };
  };
  error?: string;
}

// Helper function to run Python script (Modulus simulation)
const runModulusSimulation = (
  params: SimulationParams
): Promise<SimulationResult> => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(
      process.cwd(),
      "scripts",
      "modulus_simulation.py"
    );
    const command = `python3 ${scriptPath} ${JSON.stringify(params)}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${stderr}`);
        reject(new Error("Simulation failed"));
      } else {
        resolve(JSON.parse(stdout) as SimulationResult);
      }
    });
  });
};

// POST handler for simulation requests
export async function POST(
  request: Request
): Promise<NextResponse<ResponseData>> {
  try {
    const { domainSize, frequency, epochs }: RequestBody = await request.json();

    // Step 1: Define the Problem Domain
    const domain = {
      xRange: [0, domainSize || 1.0] as [number, number],
      yRange: [0, domainSize || 1.0] as [number, number],
      tRange: [0, 1.0] as [number, number],
    };

    // Step 2: Set Material Properties
    const materialProps = {
      epsilon: 1.0,
      mu: 1.0,
      sigma: 0.0,
    };

    // Step 3: Formulate Governing Equations (handled in Python script)

    // Step 4: Discretize the Domain (Sampling points for PINN)
    const numPoints = 10000;

    // Step 5: Apply Initial and Boundary Conditions
    const boundaryConditions = {
      type: "Dirichlet",
      value: 0,
    };
    const initialConditions = {
      E: 0,
      H: 0,
    };

    // Step 6: Specify Sources
    const source = {
      type: "planeWave",
      frequency: frequency || 1.0,
      amplitude: 1.0,
    };

    // Step 7: Choose Numerical Method (PINN in Modulus)
    const nnConfig = {
      layers: [4, 64, 64, 2],
      epochs: epochs || 5000,
    };

    // Step 8: Time Stepping (Implicit in PINN, handled by time input)

    // Step 9: Solve the System (Run Modulus simulation)
    const simulationParams: SimulationParams = {
      domain,
      materialProps,
      numPoints,
      boundaryConditions,
      initialConditions,
      source,
      nnConfig,
    };

    const result = await runModulusSimulation(simulationParams);

    // Step 10: Post-Process Results
    const processedResult = {
      fields: result.fields,
      metadata: {
        domainSize: domainSize || 1.0,
        frequency: frequency || 1.0,
        computationTime: result.computationTime,
      },
    };

    // Step 11: Validate and Refine (Simplified here, assumed in Python script)

    return NextResponse.json({
      success: true,
      data: processedResult,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET handler (optional, for testing or retrieving simulation status)
export async function GET(): Promise<NextResponse<{ message: string }>> {
  return NextResponse.json({
    message: "Simulation API is running. Use POST to run a simulation.",
  });
}
