import { NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";

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
		// layers: number[];
		epochs: number;
	};
	csvFile?: string; // CSV content as string (optional)
	cadFile?: string; // CAD file content as string (optional)
}

interface SimulationResult {
    fields: { E: number[]; H: number[] };
    computationTime: number;
}

interface ResponseData {
    success: boolean;
    data?: {
        fields: { E: number[]; H: number[] };
        metadata: {
            domainSize: number;
            frequency: number;
            computationTime: number;
        };
    };
    error?: string;
}

const runPinnSimulation = (
  params: SimulationParams
): Promise<SimulationResult> => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(
      process.cwd(),
      "scripts",
      "custom_pinn_electrodyn_sim.py"
    );

    const jsonString = JSON.stringify(params);
    // Wrap the JSON string in single quotes and escape any existing single quotes
    const escapedJsonString = `'${jsonString.replace(/'/g, "'\\''")}'`;

    const command = `/opt/anaconda3/bin/python ${scriptPath} ${escapedJsonString}`;

    console.log(`Executing command: ${command}`);
    exec(command, (error, stdout, stderr) => {
      console.log(`Stdout: ${stdout}`);
      console.error(`Stderr: ${stderr}`);
      if (error) {
        reject(new Error(`Simulation failed: ${stderr}`));
      } else {
        resolve(JSON.parse(stdout) as SimulationResult);
      }
    });
  });
};

export async function POST(
    request: Request
): Promise<NextResponse<ResponseData>> {
    try {
      const formData = await request.formData();
      const domainSize = parseFloat(formData.get("domainSize") as string);
      const frequency = parseFloat(formData.get("frequency") as string);
      const epochs = parseInt(formData.get("epochs") as string);
      const csvFile = formData.get("csvFile") as File | null;
      const cadFile = formData.get("cadFile") as File | null;

      // Step 1: Define the Problem Domain
      const domain = {
        xRange: [0, domainSize || 1.0] as [number, number],
        yRange: [0, domainSize || 1.0] as [number, number],
        tRange: [0, 1.0] as [number, number],
      };

      // Step 2: Set Material Properties (default values, overridden by CSV if provided)
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
        // layers: [4, 64, 64, 2],
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
        // Include file contents if uploaded
        csvFile: csvFile ? await csvFile.text() : undefined,
        cadFile: cadFile ? await cadFile.text() : undefined,
      };

      // const simulationParams = {
      //     domainSize: domainSize || 1.0,
      //     frequency: frequency || 1.0,
      //     epochs: epochs || 5000,
      //     csvFile: csvFile ? await csvFile.text() : undefined,
      //     cadFile: cadFile ? await cadFile.text() : undefined,
      // };

      const result = await runPinnSimulation(simulationParams);

      const processedResult = {
        fields: result.fields,
        metadata: {
          domainSize: domainSize || 1.0,
          frequency: frequency || 1.0,
          computationTime: result.computationTime,
        },
      };

      return NextResponse.json({ success: true, data: processedResult });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export async function GET(): Promise<NextResponse<{ message: string }>> {
    return NextResponse.json({
        message: "Simulation API is running. Use POST to run a simulation.",
    });
}
