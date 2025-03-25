"use client";

import { useState } from "react";
import Plot from "react-plotly.js";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	ScatterChart,
	Scatter,
} from "recharts";

export default function SimulationPage() {
	const [domainSize, setDomainSize] = useState<number>(1.0);
	const [frequency, setFrequency] = useState<number>(1.0);
	const [epochs, setEpochs] = useState<number>(5000);
	const [csvFile, setCsvFile] = useState<File | null>(null);
	const [cadFile, setCadFile] = useState<File | null>(null);

	const [result, setResult] = useState<any>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setResult(null);

		const formData = new FormData();
		formData.append("domainSize", domainSize.toString());
		formData.append("frequency", frequency.toString());
		formData.append("epochs", epochs.toString());
		if (csvFile) formData.append("csvFile", csvFile);
		if (cadFile) formData.append("cadFile", cadFile);

		try {
			const response = await fetch("/api/simulation/electromagnetics", {
				method: "POST",
				body: formData, // Send as FormData instead of JSON
			});

			const data = await response.json();

			if (!response.ok || !data.success) {
				throw new Error(data.error || "Simulation failed");
			}

			setResult(data.data);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const prepareFieldPlotData = () => {
		if (!result || !result.fields) return null;
		const { E, H } = result.fields;

		if (result.points && result.metadata.cadFilePresent) {
			const { x, y } = result.points;
			return {
				type: "scatter",
				mode: "markers",
				x,
				y,
				marker: {
					size: 5,
					color: E,
					colorscale: "Viridis",
					opacity: 0.8,
					colorbar: { title: "E Field" },
				},
				name: "E Field",
			};
		} else {
			const numPoints = E.length;
			const step = result.metadata.effectiveDomainSize / (numPoints - 1);

			// Create plot data directly without intermediate chartData array
			return {
				type: "scatter",
				mode: "lines",
				x: Array.from({ length: numPoints }, (_, i) => i * step),
				y: E,  // Use E array directly
				name: "Electric Field (E)",
				line: { 
					color: "#8884d8",
					width: 2 
				},
				hovertemplate: "X: %{x:.2f}<br>E: %{y:.2f}<extra></extra>"
			};
		}
	};
  
	const prepareDomainPlotData = () => {
		if (!result || !result.domainBoundary) return null;
		const { x, y } = result.domainBoundary;
		return {
			type: "scatter",
			mode: "lines",
			x,
			y,
			line: { color: "red", width: 2 },
			name: "Domain Boundary",
			fill: result.metadata.cadFilePresent ? "none" : "toself", // Fill square for no-CAD case
			fillcolor: "rgba(255, 0, 0, 0.1)",
		};
	};

	const fieldPlotData = prepareFieldPlotData();
	const domainPlotData = prepareDomainPlotData();

	return (
    <div className="min-h-screen p-4 bg-white pt-36">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Electromagnetics Simulation
      </h1>

      <div className="flex flex-row gap-8 justify-between max-w-7xl mx-auto">
        {/* Left Column - Form */}
        <div className="w-1/3">
          <form
            onSubmit={handleSubmit}
            className="sticky top-36 w-full bg-white p-6 rounded-lg shadow-md"
            encType="multipart/form-data"
          >
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Domain Size (units, ignored if CAD file is provided)
              </label>
              <input
                type="number"
                value={domainSize}
                onChange={(e) => setDomainSize(parseFloat(e.target.value))}
                step="0.1"
                min="0.1"
                className="mt-1 block w-full p-2 border rounded-md"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Frequency (Hz)
              </label>
              <input
                type="number"
                value={frequency}
                onChange={(e) => setFrequency(parseFloat(e.target.value))}
                step="0.1"
                min="0.1"
                className="mt-1 block w-full p-2 border rounded-md"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Training Epochs
              </label>
              <input
                type="number"
                value={epochs}
                onChange={(e) => setEpochs(parseInt(e.target.value))}
                min="100"
                step="100"
                className="mt-1 block w-full p-2 border rounded-md"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                CSV File (Material Properties, optional)
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                className="mt-1 block w-full p-2 border rounded-md"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                CAD File (Geometry, optional)
              </label>
              <input
                type="file"
                accept=".stl,.step"
                onChange={(e) => setCadFile(e.target.files?.[0] || null)}
                className="mt-1 block w-full p-2 border rounded-md"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-kaito-brand-ash-green  text-white p-2 rounded-md hover:bg-kaito-brand-ash-green  disabled:bg-gray-400"
            >
              {loading ? "Running Simulation..." : "Run Simulation"}
            </button>
          </form>
        </div>

        {/* Right Column - Results */}
        <div className="w-2/3">
          {/* Loading Animation */}
          {loading && (
            <div className="flex h-[400px] items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-r-2 border-kaito-brand-ash-green"></div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">Error: {error}</p>
            </div>
          )}

          {/* Results and Visualization */}
          {result && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Simulation Results</h2>

              {/* Metadata */}
              <div className="mb-4 grid grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 rounded-md">
                  <p>
                    <strong>Effective Domain Size:</strong>
                  </p>
                  <p>{result.metadata.effectiveDomainSize} units</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-md">
                  <p>
                    <strong>Frequency:</strong>
                  </p>
                  <p>{result.metadata.frequency} Hz</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-md">
                  <p>
                    <strong>Computation Time:</strong>
                  </p>
                  <p>{result.metadata.computationTime} s</p>
                </div>
              </div>

              {/* Chart */}
             
							{fieldPlotData && domainPlotData && (
								<div className="w-full h-[600px]">
									<h3 className="font-medium mb-2">
										{result.metadata.cadFilePresent
											? "2D Field Distribution (E) with Domain"
											: "Field Distribution (X-slice) with Domain"}
									</h3>
									<Plot
										data={[fieldPlotData, domainPlotData]}
										layout={{
											width: 800,
											height: 600,
											title: result.metadata.cadFilePresent
												? "E Field and Domain (STL Geometry)"
												: "E Field Slice and Square Domain",
											xaxis: { 
												title: "X (units)",
												automargin: true
											},
											yaxis: {
												title: result.metadata.cadFilePresent
													? "Y (units)"
													: "Field Amplitude",
												automargin: true
											},
											showlegend: true,
											margin: {
												l: 60,
												r: 30,
												t: 50,
												b: 50
											},
											autosize: true
										}}
										style={{ width: '100%', height: '100%' }}
										useResizeHandler={true}
									/>
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
