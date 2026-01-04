"use client";

import { useEffect, useState } from "react";
import { ModelProfile } from "@/domain/model";

export default function ModelPage() {
  const [model, setModel] = useState<ModelProfile | null>(null);
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Model Profile Dashboard
          </h1>
          <p className="text-slate-300 text-lg">
            View and manage your profile data from Google Sheets
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-slate-800 rounded-lg p-6 mb-8 shadow-lg">
          <label className="block text-white font-semibold mb-3">
            Enter Model ID
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && fetchModel(modelId)}
              placeholder="e.g., MODEL001"
              className="flex-1 px-4 py-3 rounded-lg bg-slate-700 text-white placeholder-slate-400 border border-slate-600 focus:border-blue-500 focus:outline-none transition"
            />
            <button
              onClick={() => fetchModel(modelId)}
              disabled={loading}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-semibold rounded-lg transition"
            >
              {loading ? "Loading..." : "Search"}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-6 py-4 rounded-lg mb-8">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Profile Card */}
        {model ? (
          <div className="bg-slate-800 rounded-lg shadow-2xl overflow-hidden">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
              <div className="flex items-start gap-6">
                {model.profileImage ? (
                  <img
                    src={model.profileImage}
                    alt={model.name}
                    className="w-32 h-32 rounded-lg object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-lg bg-slate-600 flex items-center justify-center border-4 border-white shadow-lg">
                    <span className="text-4xl">👤</span>
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-4xl font-bold mb-2">{model.name}</h2>
                  <p className="text-blue-100 mb-4">{model.bio}</p>
                  <div className="flex gap-4 flex-wrap">
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                      ⭐ {model.rating.toFixed(1)}/5
                    </span>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                      📊 {model.totalBookings} Bookings
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        model.status === "active"
                          ? "bg-green-500"
                          : model.status === "inactive"
                          ? "bg-red-500"
                          : "bg-yellow-500"
                      }`}
                    >
                      {model.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="p-8 space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-slate-400 text-sm font-semibold mb-2">
                    EMAIL
                  </h3>
                  <p className="text-white text-lg">{model.email}</p>
                </div>
                <div>
                  <h3 className="text-slate-400 text-sm font-semibold mb-2">
                    PHONE
                  </h3>
                  <p className="text-white text-lg">{model.phone}</p>
                </div>
                <div>
                  <h3 className="text-slate-400 text-sm font-semibold mb-2">
                    LOCATION
                  </h3>
                  <p className="text-white text-lg">{model.location}</p>
                </div>
                <div>
                  <h3 className="text-slate-400 text-sm font-semibold mb-2">
                    JOINED
                  </h3>
                  <p className="text-white text-lg">
                    {new Date(model.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Social Links */}
              {model.socialLinks && (
                <div>
                  <h3 className="text-slate-400 text-sm font-semibold mb-3">
                    SOCIAL LINKS
                  </h3>
                  <div className="flex gap-3">
                    {model.socialLinks.instagram && (
                      <a
                        href={model.socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition"
                      >
                        Instagram
                      </a>
                    )}
                    {model.socialLinks.twitter && (
                      <a
                        href={model.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
                      >
                        Twitter
                      </a>
                    )}
                    {model.socialLinks.portfolio && (
                      <a
                        href={model.socialLinks.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
                      >
                        Portfolio
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Stats */}
              {model.stats && (
                <div>
                  <h3 className="text-slate-400 text-sm font-semibold mb-4">
                    STATISTICS
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-700 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-400">
                        {model.stats.completedProjects}
                      </p>
                      <p className="text-slate-400 text-sm">Completed</p>
                    </div>
                    <div className="bg-slate-700 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-400">
                        {model.stats.activeProjects}
                      </p>
                      <p className="text-slate-400 text-sm">Active</p>
                    </div>
                    <div className="bg-slate-700 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-yellow-400">
                        {model.stats.reviews}
                      </p>
                      <p className="text-slate-400 text-sm">Reviews</p>
                    </div>
                    <div className="bg-slate-700 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-purple-400">
                        ${model.stats.earnings}
                      </p>
                      <p className="text-slate-400 text-sm">Earnings</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Last Updated */}
            <div className="bg-slate-700 px-8 py-4 text-slate-400 text-sm">
              Last updated: {new Date(model.updatedAt).toLocaleString()}
            </div>
          </div>
        ) : !loading && !error ? (
          <div className="bg-slate-800 rounded-lg p-12 text-center">
            <p className="text-slate-400 text-lg">
              Enter a model ID and click Search to view profile
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
