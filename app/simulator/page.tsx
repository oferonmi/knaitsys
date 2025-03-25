"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { PlotData, Layout } from "plotly.js";

// Import Plotly with proper SSR handling
const Plot = dynamic(() => import("react-plotly.js"), {
    ssr: false,
    loading: () => (
        <div className="flex h-[600px] items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-r-2 border-kaito-brand-ash-green"></div>
        </div>
    ),
});

// Types
interface SimulationResult {
	fields: {
		E: number[];
		H: number[];
	};
	points?: {
		x: number[];
		y: number[];
	};
	domainBoundary: {
		x: number[];
		y: number[];
	};
	metadata: {
		domainSize: number;
		frequency: number;
		computationTime: number;
		cadFilePresent: boolean;
		effectiveDomainSize: number;
	};
}

// Form component
function SimulationForm({
	onSubmit,
	loading,
	formData,
	setFormData,
}: {
	onSubmit: (e: React.FormEvent) => Promise<void>;
	loading: boolean;
	formData: {
		domainSize: number;
		frequency: number;
		epochs: number;
		csvFile: File | null;
		cadFile: File | null;
	};
	setFormData: {
		setDomainSize: (value: number) => void;
		setFrequency: (value: number) => void;
		setEpochs: (value: number) => void;
		setCsvFile: (file: File | null) => void;
		setCadFile: (file: File | null) => void;
	};
}) {
	return (
		<form
			onSubmit={onSubmit}
			className="sticky top-36 w-full bg-white p-6 rounded-lg shadow-md"
			encType="multipart/form-data"
		>
			<div className="mb-4">
				<label className="block text-sm font-medium text-gray-700">
					Domain Size (units, ignored if CAD file is provided)
				</label>
				<input
					type="number"
					value={formData.domainSize}
					onChange={(e) =>
						setFormData.setDomainSize(parseFloat(e.target.value))
					}
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
					value={formData.frequency}
					onChange={(e) => setFormData.setFrequency(parseFloat(e.target.value))}
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
					value={formData.epochs}
					onChange={(e) => setFormData.setEpochs(parseInt(e.target.value))}
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
					onChange={(e) => setFormData.setCsvFile(e.target.files?.[0] || null)}
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
					onChange={(e) => setFormData.setCadFile(e.target.files?.[0] || null)}
					className="mt-1 block w-full p-2 border rounded-md"
				/>
			</div>

			<button
				type="submit"
				disabled={loading}
				className="w-full bg-kaito-brand-ash-green text-white p-2 rounded-md hover:bg-kaito-brand-ash-green disabled:bg-gray-400"
			>
				{loading ? "Running Simulation..." : "Run Simulation"}
			</button>
		</form>
	);
}

// Results visualization component
function SimulationResults({
	result,
	loading,
	error,
}: {
	result: SimulationResult | null;
	loading: boolean;
	error: string | null;
}) {
	// Update return type to PlotData
	const prepareFieldPlotData = (field: "E" | "H"): Partial<PlotData> | null => {
		if (!result?.fields) return null;
		const { E, H } = result.fields;
		const fieldData = field === "E" ? E : H;

		if (result.points && result.metadata.cadFilePresent) {
			const { x, y } = result.points;
			return {
				type: "scatter",
				mode: "markers" as const, // Using as const to ensure correct type
				x,
				y,
				marker: {
					size: 5,
					color: fieldData,
					colorscale: field === "E" ? "Viridis" : "Plasma", // Different colorscales for E and H,
					opacity: 0.8,
					colorbar: { title: `${field} Field` },
				},
				name: `${field} Field`,
			};
		}

		const numPoints = fieldData.length;
		const step = result.metadata.effectiveDomainSize / (numPoints - 1);
		return {
			type: "scatter",
			mode: "lines" as const, // Using as const to ensure correct type
			x: Array.from({ length: numPoints }, (_, i) => i * step),
			y: fieldData,
			name: `${field} Field`,
			line: { color: field === "E" ? "#8884d8" : "#ff7300", width: 2 },
			hovertemplate: `X: %{x:.2f}<br>${field}: %{y:.2f}<extra></extra>`,
		};
	};

	const prepareDomainPlotData = (): Partial<PlotData> | null => {
		if (!result?.domainBoundary) return null;
		const { x, y } = result.domainBoundary;
		return {
			type: "scatter",
			mode: "lines" as const, // Using as const to ensure correct type
			x,
			y,
			line: { color: "red", width: 0 },
			name: "Domain Boundary",
			fill: result.metadata.cadFilePresent ? "none" : "toself",
			fillcolor: "rgba(255, 0, 0, 0.05)",
		};
	};

	if (loading) {
		return (
			<div className="flex h-[400px] items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-r-2 border-kaito-brand-ash-green"></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
				<p className="text-red-600">Error: {error}</p>
			</div>
		);
	}

	if (!result) return null;

	// const fieldPlotData = prepareFieldPlotData();
	const eFieldPlotData = prepareFieldPlotData("E");
  	const hFieldPlotData = prepareFieldPlotData("H");
	const domainPlotData = prepareDomainPlotData();

	const plotLayout: Partial<Layout> = {
		width: undefined, // Let it be responsive
		height: undefined, // Let it be responsive
		showlegend: true,
		margin: { l: 60, r: 30, t: 50, b: 50 },
		autosize: true,
	};

	return (
		<div className="mt-6 w-full min-h-screen  max-w-4xl bg-white p-6 rounded-lg shadow-md space-y-8 ">
		{/* Metadata display */}
		<div>
			<h2 className="text-xl font-semibold mb-4">Simulation Results</h2>
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
		</div>

		{/* Stacked Plots */}
		<div className="space-y-8 ">
			{/* E Field Plot */}
			{eFieldPlotData && domainPlotData && (
			<div className="size-full">
				<h3 className="font-medium mb-2">
				{result.metadata.cadFilePresent
					? "2D Electric Field (E) Distribution"
					: "Electric Field (E) X-slice"}
				</h3>
				<Plot
				data={[eFieldPlotData, domainPlotData]}
				layout={{
					...plotLayout,
					autosize: true,
					height: undefined,
					title: undefined,
					xaxis: {
					title: "X (units)",
					automargin: true,
					scaleanchor: "x",
					scaleratio: 1,
					},
					yaxis: {
					title: result?.metadata.cadFilePresent
						? "Y (units)"
						: "Field Amplitude",
					automargin: true,
					scaleanchor: "x",
					scaleratio: 1,
					},
				}}
				config={{
					responsive: true,
					displayModeBar: true,
					scrollZoom: true,
					displaylogo: false,
				}}
				style={{
					width: "100%",
					height: "100%",
				}}
				useResizeHandler={true}
				/>
			</div>
			)}

			{/* H Field Plot */}
			{hFieldPlotData && domainPlotData && (
			<div className="size-full">
				<h3 className="font-medium mb-2">
				{result.metadata.cadFilePresent
					? "2D Magnetic Field (H) Distribution"
					: "Magnetic Field (H) X-slice"}
				</h3>
				<Plot
				data={[hFieldPlotData, domainPlotData]}
				layout={{
					...plotLayout,
					autosize: true,
					height: undefined,
					title: undefined,
					xaxis: { title: "X (units)", automargin: true, scaleanchor: "x", scaleratio: 1 },
					yaxis: {
					title: result?.metadata.cadFilePresent
						? "Y (units)"
						: "Field Amplitude",
					automargin: true, 
					scaleanchor: "x", 
					scaleratio: 1,
					},
				}}
				config={{
					responsive: true,
					displayModeBar: true,
					scrollZoom: true,
					displaylogo: false,
				}}
				style={{
					width: "100%",
					height: "100%",
				}}
				useResizeHandler={true}
				/>
			</div>
			)}
		</div>
		</div>
	);
}

// Main page component
export default function SimulationPage() {
	// Form state
	const [domainSize, setDomainSize] = useState<number>(1.0);
	const [frequency, setFrequency] = useState<number>(1.0);
	const [epochs, setEpochs] = useState<number>(5000);
	const [csvFile, setCsvFile] = useState<File | null>(null);
	const [cadFile, setCadFile] = useState<File | null>(null);

	// Results state
	const [result, setResult] = useState<SimulationResult | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

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
				body: formData,
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

	return (
		<div className="min-h-screen p-4 bg-white pt-36">
			<h1 className="text-3xl font-bold mb-6 text-center">
				Electromagnetics Simulation
			</h1>

			<div className="flex flex-row gap-8 justify-between max-w-7xl mx-auto">
				<div className="w-1/3">
					<SimulationForm
						onSubmit={handleSubmit}
						loading={loading}
						formData={{ domainSize, frequency, epochs, csvFile, cadFile }}
						setFormData={{
							setDomainSize,
							setFrequency,
							setEpochs,
							setCsvFile,
							setCadFile,
						}}
					/>
				</div>
				<div className="w-2/3">
					<SimulationResults result={result} loading={loading} error={error} />
				</div>
			</div>
		</div>
	);
}
