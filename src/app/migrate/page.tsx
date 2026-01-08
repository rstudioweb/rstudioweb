"use client";

import { useState } from "react";

export default function MigrationPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runMigration = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || "Migration failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Data Migration Tool</h1>
        <p className="text-gray-400 mb-8">
          Migrate data from Google Sheets to Firebase Firestore
        </p>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">⚠️ Important Notes:</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>This will copy all data from Google Sheets to Firestore</li>
            <li>Existing Firestore data will be overwritten</li>
            <li>Run this only ONCE</li>
            <li>Make sure Firebase credentials are configured in .env.local</li>
          </ul>
        </div>

        <button
          onClick={runMigration}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md font-semibold transition"
        >
          {loading ? "Migrating..." : "Start Migration"}
        </button>

        {error && (
          <div className="mt-6 bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-md">
            <h3 className="font-bold mb-2">❌ Error:</h3>
            <pre className="whitespace-pre-wrap text-sm">{error}</pre>
          </div>
        )}

        {result && (
          <div className="mt-6 bg-green-900/50 border border-green-700 text-green-200 p-4 rounded-md">
            <h3 className="font-bold mb-2">✅ Migration Complete:</h3>
            <div className="space-y-2 text-sm">
              <p>Models: {result.details?.models?.success ? `✅ ${result.details.models.count} records` : '❌ Failed'}</p>
              <p>DPR: {result.details?.dpr?.success ? `✅ ${result.details.dpr.count} records` : '❌ Failed'}</p>
              <p>MPR: {result.details?.mpr?.success ? `✅ ${result.details.mpr.count} records` : '❌ Failed'}</p>
            </div>
            <pre className="mt-4 text-xs bg-gray-800 p-3 rounded overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
