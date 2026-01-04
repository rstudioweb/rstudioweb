"use client";

import { useEffect, useState } from "react";
import { ModelProfile } from "@/domain/model";

export default function ModelPage() {
  const [model, setModel] = useState<ModelProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelId, setModelId] = useState<string>("");

  const fetchModel = async (id: string) => {
    if (!id.trim()) {
      setError("Please enter a model ID");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelId: id }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch model");
      }

      const data = await response.json();

      if (!data.success) {
        setError(data.error || "Failed to fetch model");
        setModel(null);
      } else {
        setModel(data.data);
        setError(null);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setError(errorMsg);
      setModel(null);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentDate = () =>
    new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const getCurrentTime = () =>
    new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

  const [currentDate, setCurrentDate] = useState<string>("");
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateClock = () => {
      setCurrentDate(getCurrentDate());
      setCurrentTime(getCurrentTime());
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white p-4">
      <div className="flex justify-between items-center mb-6">
        <button className="text-white text-2xl">☰</button>
        <span className="text-sm text-gray-400">Last Online: {getCurrentDate()}</span>
      </div>

      <div className="relative mb-8">
        <div className="flex justify-end mb-6">
          {model?.profileImage ? (
            <img
              src={model.profileImage}
              alt={model.name}
              className="w-24 h-24 rounded-full object-cover border-2 border-gray-500"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-400 border-2 border-gray-500 flex items-center justify-center">
              <span className="text-3xl">👤</span>
            </div>
          )}
        </div>

        <div className="mb-6">
          <p className="text-lg text-gray-400 italic">Good Morning ...</p>
          <h1 className="text-5xl text-white" style={{ fontStyle: "italic" }}>
            {model?.name || "Guest"}
          </h1>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-400 mb-8">
          <span>{currentDate || getCurrentDate()}</span>
          <span>🕐</span>
          <span>{currentTime || getCurrentTime()}</span>
        </div>
      </div>

      <div className="bg-red-600 text-white font-bold py-3 px-4 rounded-md mb-8 text-center">
        YOU HAVE {model?.stats?.earnings || 735} TOKEN DUE FOR TODAY
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">TODAY</h2>
          <button className="text-gray-400 hover:text-white transition">🔄</button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-3 text-center">
          <div className="text-xs text-gray-400 font-semibold">TGT</div>
          <div className="text-xs text-gray-400 font-semibold">ACH</div>
          <div className="text-xs text-gray-400 font-semibold">DUE</div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-red-600 text-white font-bold py-6 px-4 rounded-md text-center text-2xl">
            {model?.stats?.completedProjects || 1050}
          </div>
          <div className="bg-green-500 text-white font-bold py-6 px-4 rounded-md text-center text-2xl">
            {model?.stats?.activeProjects || 315}
          </div>
          <div className="bg-yellow-500 text-white font-bold py-6 px-4 rounded-md text-center text-2xl">
            {model?.stats?.earnings || 735}
          </div>
        </div>
      </div>

      <div>
        <div className="mb-4">
          <h2 className="text-lg font-bold mb-2">MONTHLY</h2>
          <p className="text-sm text-gray-400">{model?.stats?.reviews || 7}/24 Days</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-3 text-center">
          <div className="text-xs text-gray-400 font-semibold">TGT</div>
          <div className="text-xs text-gray-400 font-semibold">ACH</div>
          <div className="text-xs text-gray-400 font-semibold">DUE</div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-gray-700 text-white font-bold py-6 px-4 rounded-md text-center text-2xl">
            {model?.stats?.completedProjects || 1050}
          </div>
          <div className="bg-gray-700 text-white font-bold py-6 px-4 rounded-md text-center text-2xl">
            {model?.stats?.activeProjects || 315}
          </div>
          <div className="bg-gray-700 text-white font-bold py-6 px-4 rounded-md text-center text-2xl">
            {model?.stats?.earnings || 735}
          </div>
        </div>

        <div className="bg-gray-800 rounded-md p-8 min-h-[200px]"></div>
      </div>

      {!model && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4">Enter Model ID</h2>
            <input
              type="text"
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && fetchModel(modelId)}
              placeholder="e.g., Sunita"
              className="w-full px-4 py-2 rounded-md bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:border-blue-500 focus:outline-none mb-4"
            />
            <button
              onClick={() => fetchModel(modelId)}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-md transition"
            >
              {loading ? "Loading..." : "Load Profile"}
            </button>
            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

