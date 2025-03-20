import { NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";

interface SimulationParams {
  domainSize: number;
  frequency: number;
  numPoints: number;
  epochs: number;
  csvFile?: string; // CSV content as string (optional)
  cadFile?: string; // CAD file content as string (optional)
};

// interface SimulationParams {
// 	domain: {
// 		xRange: [number, number];
// 		yRange: [number, number];
// 		tRange: [number, number];
// 	};
// 	materialProps: {
// 		epsilon: number;
// 		mu: number;
// 		sigma: number;
// 	};
// 	numPoints: number;
// 	boundaryConditions: {
// 		type: string;
// 		value: number;
// 	};
// 	initialConditions: {
// 		E: number;
// 		H: number;
// 	};
// 	source: {
// 		type: string;
// 		frequency: number;
// 		amplitude: number;
// 	};
// 	nnConfig: {
// 		// layers: number[];
// 		epochs: number;
// 	};
// 	csvFile?: string; // CSV content as string (optional)
// 	cadFile?: string; // CAD file content as string (optional)
// }

interface SimulationResult {
  fields: { E: number[]; H: number[] };
  points?: { x: number[]; y: number[] };
  computationTime: number;
  cadFilePresent?: boolean;
  effectiveDomainSize: number;
}

interface ResponseData {
  success: boolean;
  data?: {
    fields: { E: number[]; H: number[] };
    points?: { x: number[]; y: number[] };
    metadata: {
      domainSize: number;
      frequency: number;
      computationTime: number;
      cadFilePresent?: boolean;
      effectiveDomainSize: number;
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
      "custom_pinn_electromag_sim.py"
    );

    const jsonString = JSON.stringify(params);
    // Base64 encode and decode test to verify encoding
    const encodedJson = Buffer.from(jsonString).toString('base64');
    console.log('Encoded params:', encodedJson);
    
    const command = `/opt/anaconda3/bin/python "${scriptPath}" "${encodedJson}"`; // TODO: Update to automatically find local Python path
    console.log('Executing command:', command);

    exec(command, { maxBuffer: 1024 * 1024 * 100 }, (error, stdout, stderr) => {
      if (stderr) {
        console.error('Python stderr:', stderr);
      }

      if (error) {
        console.error('Execution error:', error);
        reject(new Error(`Simulation failed: ${stderr || error.message}`));
        return;
      }

      try {
        const result = JSON.parse(stdout);
        console.log('Simulation completed successfully');
        resolve(result);
      } catch (parseError) {
        console.error('Failed to parse simulation output:', parseError);
        console.error('Raw output:', stdout);
        reject(new Error('Failed to parse simulation results'));
      }
    });
  });
};

export async function POST(
    request: Request
): Promise<NextResponse<ResponseData>> {
    try {
      const formData = await request.formData();
      // Validate and extract form data
      const domainSize = parseFloat(formData.get("domainSize") as string);
      const frequency = parseFloat(formData.get("frequency") as string);
      const epochs = parseInt(formData.get("epochs") as string);
      const csvFile = formData.get("csvFile") as File | null;
      const cadFile = formData.get("cadFile") as File | null;

      if (isNaN(domainSize) || isNaN(frequency) || isNaN(epochs)) {
        throw new Error("Invalid input parameters");
      }

      // Step 1: Define the Problem Domain
      // const domain = {
      //   xRange: [0, domainSize || 1.0] as [number, number],
      //   yRange: [0, domainSize || 1.0] as [number, number],
      //   tRange: [0, 1.0] as [number, number],
      // };

      // Step 2: Set Material Properties (default values, overridden by CSV if provided)
      // const materialProps = {
      //   epsilon: 1.0,
      //   mu: 1.0,
      //   sigma: 0.0,
      // };

      // Step 3: Formulate Governing Equations (handled in Python script)

      // Step 4: Discretize the Domain (Sampling points for PINN)
      const numPoints = 10000;

      // Step 5: Apply Initial and Boundary Conditions
      // const boundaryConditions = {
      //   type: "Dirichlet",
      //   value: 0,
      // };
      // const initialConditions = {
      //   E: 0,
      //   H: 0,
      // };

      // Step 6: Specify Sources
      // const source = {
      //   type: "planeWave",
      //   frequency: frequency || 1.0,
      //   amplitude: 1.0,
      // };

      // Step 7: Choose Numerical Method (PINN in Modulus)
      // const nnConfig = {
      //   // layers: [4, 64, 64, 2],
      //   epochs: epochs || 5000,
      // };

      // Step 8: Time Stepping (Implicit in PINN, handled by time input)

      // Step 9: Solve the System (Run Modulus simulation)
      // const simulationParams: SimulationParams = {
      //   domain,
      //   materialProps,
      //   numPoints,
      //   boundaryConditions,
      //   initialConditions,
      //   source,
      //   nnConfig,
      //   // Include file contents if uploaded
      //   csvFile: csvFile ? await csvFile.text() : undefined,
      //   cadFile: cadFile ? await cadFile.text() : undefined,
      // };

      const simulationParams = {
        domainSize: domainSize || 1.0,
        frequency: frequency || 1.0,
        numPoints: numPoints || 10000,
        epochs: epochs || 5000,
        csvFile: csvFile ? await csvFile.text() : undefined,
        cadFile: cadFile ? await cadFile.text() : undefined,
      };

      console.log("Starting simulation with params:", simulationParams);
      const result = await runPinnSimulation(simulationParams);

      // Validate result
      if (!result?.fields?.E || !result?.fields?.H) {
        throw new Error("Invalid simulation results");
      }

      const processedResult = {
        fields: result.fields,
        points: result.points,
        metadata: {
          domainSize: domainSize || 1.0,
          frequency: frequency || 1.0,
          computationTime: result.computationTime,
          cadFilePresent: result.cadFilePresent || !!cadFile,
          effectiveDomainSize: result.effectiveDomainSize,
        },
      };

      return NextResponse.json({ success: true, data: processedResult });
    } catch (error: any) {
        return NextResponse.json(
          { success: false, error: error.message || "Unknown error occurred" },
          { status: 500 }
        );
    }
}

export async function GET(): Promise<NextResponse<{ message: string }>> {
    return NextResponse.json({
        message: "Simulation API is running. Use POST to run a simulation.",
    });
}
