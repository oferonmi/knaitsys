import { NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";
import fs from "fs/promises"; // Use Node.js fs for file operations

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

const TEMP_DIR = path.resolve("./tmp");

// interface SimulationParams {
//   domainSize: number;
//   frequency: number;
//   numPoints: number;
//   epochs: number;
//   csvFile?: string; // CSV content as string (optional)
//   // cadFile?: string; // Pass the file path instead of content if present
//   cadFilePath? : string; // Pass the file path instead of content
// };


interface SimulationResult {
  fields: { E: number[]; H: number[] };
  points?: { x: number[]; y: number[] };
  computationTime: number;
  cadFilePresent?: boolean;
  effectiveDomainSize: number;
  domainBoundary: { x: number[]; y: number[] }; // Added
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
    domainBoundary: { x: number[]; y: number[] }; 
  };
  error?: string;
}

const runPinnSimulation = async (params: any, cadFilePath?: string): Promise<SimulationResult> => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(
      process.cwd(),
      "scripts",
      "custom_pinn_electromag_sim.py"
    );

    // Only include parameters that fit comfortably in ARG_MAX
    const simParams = {
      domainSize: params.domainSize,
      frequency: params.frequency,
      numPoints: params.numPoints,
      epochs: params.epochs,
      csvFile: params.csvFile, // Still passed as text (small size)
      cadFilePath: cadFilePath, // Pass the file path instead of content
    };

    const jsonString = JSON.stringify(simParams);
    // Base64 encode and decode test to verify encoding
    const encodedJson = Buffer.from(jsonString).toString("base64");
    console.log("Encoded params:", encodedJson);

    const command = `/opt/anaconda3/bin/python "${scriptPath}" "${encodedJson}"`; // TODO: Update to automatically find local Python path
    console.log("Executing command:", command);

    exec(command, { maxBuffer: 1024 * 1024 * 100 }, (error, stdout, stderr) => {
      if (stderr) {
        console.error("Python stderr:", stderr);
      }

      if (error) {
        console.error("Execution error:", error);
        reject(new Error(`Simulation failed: ${stderr || error.message}`));
        return;
      }

      try {
        const result = JSON.parse(stdout);
        console.log("Simulation completed successfully");
        resolve(result);
      } catch (parseError) {
        console.error("Failed to parse simulation output:", parseError);
        console.error("Raw output:", stdout);
        reject(new Error("Failed to parse simulation results"));
      }
    });
  });
};

export async function POST(request: Request): Promise<NextResponse<ResponseData>> {
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

      let cadFilePath: string | undefined;
      // Ensure temporary directory exists
      await fs.mkdir(TEMP_DIR, { recursive: true });

      if (cadFile) {
        // Save CAD file to temporary location with explicit binary handling
        cadFilePath = path.join(TEMP_DIR, `cad-${Date.now()}.stl`);
        const arrayBuffer = await cadFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await fs.writeFile(cadFilePath, buffer, { encoding: null }); // Force binary write
        console.log(`CAD file saved to: ${cadFilePath}`);
      }

      // Discretize the Domain (Sampling points for PINN)
      const numPoints = 10000;

      const simParams = {
        domainSize: domainSize || 1.0,
        frequency: frequency || 1.0,
        numPoints: numPoints || 10000,
        epochs: epochs || 5000,
        csvFile: csvFile ? await csvFile.text() : undefined,
        cadFilePath: cadFilePath, // Pass the file path instead of content
        // cadFile: cadFile ? await cadFile.text() : undefined,
      };

      console.log("Starting simulation with params:", simParams);
      const result = await runPinnSimulation(simParams, cadFilePath);

      // Clean up temporary file
      if (cadFilePath) await fs.unlink(cadFilePath);

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
        domainBoundary: result.domainBoundary,
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
