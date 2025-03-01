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

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/simulation/electrodyn_sim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          domainSize,
          frequency,
          epochs,
        }),
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white pt-36">
      <h1 className="text-3xl font-bold mb-6">Electrodynamics Simulation</h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-6 rounded-lg shadow-md"
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

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-kaito-brand-ash-green  text-white p-2 rounded-md hover:bg-kaito-brand-ash-green  disabled:bg-gray-400"
        >
          {loading ? "Running Simulation..." : "Run Simulation"}
        </button>
      </form>

      {/* Error Display */}
      {error && (
        <div className="mt-4 text-red-600">
          <p>Error: {error}</p>
        </div>
      )}

      {/* Results and Visualization */}
      {result && (
        <div className="mt-6 w-full max-w-4xl bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Simulation Results</h2>

          {/* Metadata */}
          <div className="mb-4">
            <p>
              <strong>Domain Size:</strong> {result.metadata.domainSize} units
            </p>
            <p>
              <strong>Frequency:</strong> {result.metadata.frequency} Hz
            </p>
            <p>
              <strong>Computation Time:</strong>{" "}
              {result.metadata.computationTime} s
            </p>
          </div>

          {/* Chart */}
          {chartData.length > 0 && (
            <div className="w-full h-[400px]">
              <h3 className="font-medium mb-2">Field Distribution</h3>
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
          )}
        </div>
      )}
    </div>
  );
}
