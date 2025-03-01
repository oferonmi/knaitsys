"use client"; // This is a client-side component

import { useState } from "react";

export default function SimulationPage() {
  // State for form inputs
  const [domainSize, setDomainSize] = useState<number>(1.0);
  const [frequency, setFrequency] = useState<number>(1.0);
  const [epochs, setEpochs] = useState<number>(5000);

  // State for simulation results and status
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
          className="w-full bg-kaito-brand-ash-green  text-white p-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Running Simulation..." : "Run Simulation"}
        </button>
      </form>

      {/* Results Display */}
      {error && (
        <div className="mt-4 text-red-600">
          <p>Error: {error}</p>
        </div>
      )}

      {result && (
        <div className="mt-6 w-full max-w-md bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Simulation Results</h2>
          <p>
            <strong>Domain Size:</strong> {result.metadata.domainSize} units
          </p>
          <p>
            <strong>Frequency:</strong> {result.metadata.frequency} Hz
          </p>
          <p>
            <strong>Computation Time:</strong> {result.metadata.computationTime}{" "}
            s
          </p>
          <div className="mt-4">
            <h3 className="font-medium">Field Data</h3>
            <p>
              <strong>E-Field Sample:</strong>{" "}
              {result.fields.E.slice(0, 5).join(", ")}...
            </p>
            <p>
              <strong>H-Field Sample:</strong>{" "}
              {result.fields.H.slice(0, 5).join(", ")}...
            </p>
            <p className="text-sm text-gray-500">
              (Showing first 5 values; full data available in response)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
