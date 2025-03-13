"use client";

import { useState } from "react";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
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
			const response = await fetch("/api/simulation/electrodyn_sim", {
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

	// Prepare chart data from result
	const prepareChartData = () => {
		if (!result || !result.fields || !result.fields.E || !result.fields.H)
			return [];

		const numPoints = result.fields.E.length;
		const step = result.metadata.domainSize / (numPoints - 1);
		return result.fields.E.map((eValue: number, index: number) => ({
			x: index * step,
			E: eValue,
			H: result.fields.H[index],
		}));
	};

	const chartData = prepareChartData();

	return (
		<div className="min-h-screen p-4 bg-white pt-36">
			<h1 className="text-3xl font-bold mb-6 text-center">Electrodynamics Simulation</h1>

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
								Domain Size (units)
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
									<p><strong>Domain Size:</strong></p>
									<p>{result.metadata.domainSize} units</p>
								</div>
								<div className="p-3 bg-gray-50 rounded-md">
									<p><strong>Frequency:</strong></p>
									<p>{result.metadata.frequency} Hz</p>
								</div>
								<div className="p-3 bg-gray-50 rounded-md">
									<p><strong>Computation Time:</strong></p>
									<p>{result.metadata.computationTime} s</p>
								</div>
							</div>

							{/* Chart */}
							{chartData.length > 0 && (
								<div className="mt-6">
									<h3 className="font-medium mb-4">Field Distribution</h3>
									<div className="h-[400px]">
										<ResponsiveContainer width="100%" height="100%">
											<LineChart
												data={chartData}
												margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
											>
												<CartesianGrid strokeDasharray="3 3" />
												<XAxis
													dataKey="x"
													label={{
														value: "Position (units)",
														position: "insideBottom",
														offset: -5,
													}}
												/>
												<YAxis
													label={{
														value: "Field Amplitude",
														angle: -90,
														position: "insideLeft",
													}}
												/>
												<Tooltip />
												<Legend />
												<Line
													type="monotone"
													dataKey="E"
													stroke="#8884d8"
													name="Electric Field (E)"
													dot={false}
												/>
												<Line
													type="monotone"
													dataKey="H"
													stroke="#82ca9d"
													name="Magnetic Field (H)"
													dot={false}
												/>
											</LineChart>
										</ResponsiveContainer>
									</div>
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
