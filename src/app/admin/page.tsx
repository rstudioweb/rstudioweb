"use client";

import { useEffect, useState } from "react";
import { ModelProfile } from "@/domain/model";
import { DPR } from "@/domain/dpr";
import { MPR } from "@/domain/mpr";

const numberOrZero = (value: string | number) => {
  const n = Number(value);
  return Number.isNaN(n) ? 0 : n;
};

const getDaysInMonth = (month: string, year: number) => {
  const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
  return new Date(year, monthIndex + 1, 0).getDate();
};

const getCurrentMonthName = () => {
  return new Date().toLocaleString('default', { month: 'long' });
};

export default function AdminPage() {
  const [tab, setTab] = useState<"models" | "dpr" | "mpr">("models");
  
  // Models state
  const [models, setModels] = useState<ModelProfile[]>([]);
  const [modelForm, setModelForm] = useState({ id: "", name: "", phone: "", location: "", profileImage: "", status: "", username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [modelCurrentPage, setModelCurrentPage] = useState(1);
  const modelRowsPerPage = 10;

  // DPR state
  const [dprs, setDprs] = useState<DPR[]>([]);
  const [dprForm, setDprForm] = useState({ 
    modelId: "", 
    date: new Date().toISOString().split('T')[0], 
    dtarget: "", 
    dachv: "" 
  });
  const [dprCurrentPage, setDprCurrentPage] = useState(1);
  const [isEditingDPR, setIsEditingDPR] = useState(false);
  const dprRowsPerPage = 10;

  // MPR state
  const [mprs, setMprs] = useState<MPR[]>([]);
  const [mprForm, setMprForm] = useState({
    modelId: "",
    month: getCurrentMonthName(),
    mtgt: "",
    machv: "",
    mdue: "",
    remaindays: "",
    wkof: ""
  });

  // Load models on mount
  useEffect(() => {
    if (tab === "models") loadModels();
  }, [tab]);

  // Load DPR and models on mount
  useEffect(() => {
    if (tab === "dpr") {
      loadDPR();
      loadModels(); // Load models for dropdown
      loadMPR(); // Load MPR to pick up wkof when calculating remaining days
    }
  }, [tab]);

  // Load MPR and models on mount
  useEffect(() => {
    if (tab === "mpr") {
      loadMPR();
      loadModels(); // Load models for dropdown
    }
  }, [tab]);

  const loadModels = async () => {
    try {
      const res = await fetch("/api/model/list");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setModels(data.data);
      }
    } catch (err) {
      console.error("Failed to load models", err);
    }
  };

  const loadDPR = async () => {
    try {
      const res = await fetch("/api/dpr");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setDprs(data.data);
      }
    } catch (err) {
      console.error("Failed to load DPR", err);
    }
  };

  const checkExistingDPR = (modelId: string, date: string) => {
    if (!modelId || !date) return null;
    return dprs.find((d) => d.modelId === modelId && d.date === date) || null;
  };

  const loadMPR = async () => {
    try {
      const res = await fetch("/api/mpr");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setMprs(data.data);
      }
    } catch (err) {
      console.error("Failed to load MPR", err);
    }
  };

  const handleAddModel = async () => {
    if (!modelForm.id.trim() || !modelForm.name.trim()) {
      setMessage("ID and Name are required");
      return;
    }

    if (!modelForm.status) {
      setMessage("Please select a status");
      return;
    }

    // Check if ID already exists
    if (models.some((m) => m.id === modelForm.id.trim())) {
      setMessage("Error: Model ID already exists. Please use a unique ID.");
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/model/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(modelForm),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Model added successfully");
        setModelForm({ id: "", name: "", phone: "", location: "", profileImage: "", status: "", username: "", password: "" });
        await loadModels();
      } else {
        setMessage(data.error || "Failed to add model");
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Add failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDPR = async () => {
    if (!dprForm.modelId || !dprForm.date || !dprForm.dtarget || dprForm.dachv === "") {
      setMessage("All DPR fields are required");
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const endpoint = isEditingDPR ? "/api/dpr" : "/api/dpr";
      const method = isEditingDPR ? "PUT" : "POST";
      
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelId: dprForm.modelId,
          date: dprForm.date,
          dtarget: numberOrZero(dprForm.dtarget),
          dachv: numberOrZero(dprForm.dachv),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(isEditingDPR ? "DPR updated successfully" : "DPR added successfully");
        const savedModelId = dprForm.modelId;
        setDprForm({ modelId: "", date: new Date().toISOString().split('T')[0], dtarget: "", dachv: "" });
        setMprForm({ modelId: "", month: getCurrentMonthName(), mtgt: "", machv: "", mdue: "", remaindays: "", wkof: "" });
        setIsEditingDPR(false);
        await loadDPR();
        
        // Auto-update MPR after DPR is added/updated
        await updateMPRAfterDPR(savedModelId);
      } else {
        setMessage(data.error || "Failed to save DPR");
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const updateMPRAfterDPR = async (modelId: string) => {
    try {
      // Fetch all DPR records
      const dprRes = await fetch("/api/dpr");
      const dprData = await dprRes.json();
      
      if (!dprData.success || !Array.isArray(dprData.data)) return;
      
      // Calculate total achievement for this model
      const modelDPRs = dprData.data.filter((d: DPR) => d.modelId === modelId);
      const totalAchievement = modelDPRs.reduce((sum: number, d: DPR) => sum + (d.dachv || 0), 0);
      
      // Update the monthly achievement display
      setMprForm({ ...mprForm, modelId: modelId, machv: String(totalAchievement) });
      
      // Get current month
      const currentMonth = getCurrentMonthName();
      
      // Fetch MPR records to find the matching one
      const mprRes = await fetch("/api/mpr");
      const mprData = await mprRes.json();
      
      if (mprData.success && Array.isArray(mprData.data)) {
        const matchingMPR = mprData.data.find((m: MPR) => 
          m.modelId === modelId && m.month === currentMonth
        );
        
        if (matchingMPR) {
          // Calculate new mdue
          const newMdue = matchingMPR.mtgt - totalAchievement;
          
          // Update MPR record
          await fetch("/api/mpr", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              modelId: modelId,
              month: currentMonth,
              machv: totalAchievement,
              mdue: newMdue,
            }),
          });
          
          // Reload MPR to show updated values
          await loadMPR();
        }
      }
    } catch (err) {
      console.error("Error updating MPR:", err);
      // Don't show error to user, just log it
    }
  };

  const getModelName = (modelId: string) => {
    const match = models.find((m) => m.id === modelId);
    return match?.name || "-";
  };

  const recalculateRemainingDays = (dateValue?: string, modelId?: string) => {
    // Only calculate if both date and model are provided
    if (!dateValue || !modelId) return;

    const baseDate = new Date(dateValue);
    if (Number.isNaN(baseDate.getTime())) return;

    const monthName = baseDate.toLocaleString("default", { month: "long" });
    const year = baseDate.getFullYear();
    const dayOfMonth = baseDate.getDate();
    const totalDays = getDaysInMonth(monthName, year);

    // Fetch wkof from MPR for this model and month
    const matchedMPR = mprs.find((m) => m.modelId === modelId && m.month === monthName);
    const wkof = matchedMPR ? numberOrZero(matchedMPR.wkof) : 0;

    // Calculate remaining = totalDays - wkof - dayOfMonth
    const remaining = Math.max(0, totalDays - wkof - dayOfMonth);

    setMprForm((prev) => ({
      ...prev,
      wkof: String(wkof),
      remaindays: String(remaining),
    }));
  };

  const calculateMonthlyTotal = async (modelId: string, additionalAchievement: number = 0) => {
    if (!modelId) return;
    
    try {
      // Fetch DPR data
      const dprRes = await fetch("/api/dpr");
      const dprData = await dprRes.json();
      
      let totalAchievement = additionalAchievement;
      if (dprData.success && Array.isArray(dprData.data)) {
        const modelDPRs = dprData.data.filter((d: DPR) => d.modelId === modelId);
        totalAchievement += modelDPRs.reduce((sum: number, d: DPR) => sum + (d.dachv || 0), 0);
      }
      
      // Fetch MPR data to get mtgt and wkof
      const mprRes = await fetch("/api/mpr");
      const mprData = await mprRes.json();
      
      let mtgt = 0;
      let wkof = 0;
      let selectedMonth = getCurrentMonthName();
      
      // Use selected date if available to get correct month
      if (dprForm.date) {
        const selectedDate = new Date(dprForm.date);
        selectedMonth = selectedDate.toLocaleString("default", { month: "long" });
      }
      
      if (mprData.success && Array.isArray(mprData.data)) {
        const matchingMPR = mprData.data.find((m: MPR) => 
          m.modelId === modelId && m.month === selectedMonth
        );
        if (matchingMPR) {
          mtgt = matchingMPR.mtgt || 0;
          wkof = matchingMPR.wkof || 0;
        }
      }
      
      // Calculate mdue
      const mdue = Math.max(0, mtgt - totalAchievement);
      
      // Calculate remaining days using selected date
      let remaindays = 0;
      if (dprForm.date) {
        const selectedDate = new Date(dprForm.date);
        const selectedYear = selectedDate.getFullYear();
        const selectedDay = selectedDate.getDate();
        const totalDaysInMonth = getDaysInMonth(selectedMonth, selectedYear);
        remaindays = Math.max(0, totalDaysInMonth - (wkof + selectedDay));
      } else {
        // Fallback to current date if no date selected
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentDay = currentDate.getDate();
        const totalDaysInMonth = getDaysInMonth(selectedMonth, currentYear);
        remaindays = Math.max(0, totalDaysInMonth - (wkof + currentDay));
      }
      
      // Calculate suggested daily target: mdue / remaindays
      const suggestedDailyTarget = remaindays > 0 ? Math.round(mdue / remaindays) : 0;
      
      setMprForm({ 
        ...mprForm, 
        modelId: modelId, 
        machv: String(totalAchievement),
        mdue: String(mdue),
        remaindays: String(remaindays),
        wkof: String(wkof)
      });
      
      // Set suggested daily target in dprForm
      setDprForm(prev => ({ ...prev, dtarget: String(suggestedDailyTarget) }));
      
      // Update MPR in the sheet if record exists
      if (mtgt > 0) {
        await fetch("/api/mpr", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            modelId: modelId,
            month: selectedMonth,
            machv: totalAchievement,
            mdue: mdue,
          }),
        });
      }
    } catch (err) {
      console.error("Failed to calculate monthly achievement", err);
    }
  };

  const handleAddMPR = async () => {
    if (!mprForm.modelId || !mprForm.month || !mprForm.mtgt || mprForm.wkof === "") {
      setMessage("Model, Month, Target, and Weekly Off are required");
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentDay = currentDate.getDate();
      const totalDaysInMonth = getDaysInMonth(mprForm.month, currentYear);
      const remaindays = totalDaysInMonth - currentDay + numberOrZero(mprForm.wkof);

      const res = await fetch("/api/mpr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelId: mprForm.modelId,
          month: mprForm.month,
          mtgt: numberOrZero(mprForm.mtgt),
          machv: numberOrZero(mprForm.machv),
          wkof: numberOrZero(mprForm.wkof),
          remaindays: remaindays,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("MPR added successfully");
        setMprForm({ modelId: "", month: getCurrentMonthName(), mtgt: "", machv: "", wkof: "" });
        await loadMPR();
      } else {
        setMessage(data.error || "Failed to add MPR");
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Add failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-white p-6">
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setTab("models")}
          className={`px-4 py-2 rounded-md ${tab === "models" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
        >
          Models
        </button>
        <button
          onClick={() => setTab("dpr")}
          className={`px-4 py-2 rounded-md ${tab === "dpr" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
        >
          Daily Performance Report
        </button>
        <button
          onClick={() => setTab("mpr")}
          className={`px-4 py-2 rounded-md ${tab === "mpr" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
        >
          Monthly Target
        </button>
      </div>

      {message && (
        <div className="mb-4 p-3 rounded-md bg-green-900 text-green-200">{message}</div>
      )}

      {/* MODELS TAB */}
      {tab === "models" && (
        <div className="flex flex-col gap-6">
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Add New Model</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm text-gray-300">ID</label>
                <input
                  type="text"
                  className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-white"
                  value={modelForm.id}
                  onChange={(e) => setModelForm({ ...modelForm, id: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-300">Name</label>
                <input
                  type="text"
                  className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-white"
                  value={modelForm.name}
                  onChange={(e) => setModelForm({ ...modelForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-300">Phone</label>
                <input
                  type="text"
                  className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-white"
                  value={modelForm.phone}
                  onChange={(e) => setModelForm({ ...modelForm, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-300">Location</label>
                <input
                  type="text"
                  className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-white"
                  value={modelForm.location}
                  onChange={(e) => setModelForm({ ...modelForm, location: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-300">Profile Image URL</label>
                <input
                  type="text"
                  className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-white"
                  value={modelForm.profileImage}
                  onChange={(e) => setModelForm({ ...modelForm, profileImage: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-300">Status</label>
                <select
                  className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-white"
                  value={modelForm.status}
                  onChange={(e) => setModelForm({ ...modelForm, status: e.target.value })}
                >
                  <option value="">Set Status</option>
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Blocked">Blocked</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-300">Username</label>
                <input
                  type="text"
                  className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-white"
                  value={modelForm.username}
                  onChange={(e) => setModelForm({ ...modelForm, username: e.target.value })}
                  placeholder="Enter username for login"
                />
              </div>
              <div>
                <label className="text-sm text-gray-300">Password</label>
                <input
                  type="password"
                  className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-white"
                  value={modelForm.password}
                  onChange={(e) => setModelForm({ ...modelForm, password: e.target.value })}
                  placeholder="Enter password for login"
                />
              </div>
            </div>
            <button
              onClick={handleAddModel}
              disabled={loading}
              className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 disabled:bg-gray-600"
            >
              {loading ? "Adding..." : "Add Model"}
            </button>
          </div>

          {/* Models Table */}
          <div className="bg-gray-900 p-6 rounded-lg overflow-x-auto">
            <h2 className="text-xl font-bold mb-4">All Models</h2>
            {models.length > 0 ? (
              <>
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-800 border-b border-gray-700">
                    <tr>
                      <th className="px-4 py-2">ID</th>
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Phone</th>
                      <th className="px-4 py-2">Location</th>
                      <th className="px-4 py-2">Username</th>
                      <th className="px-4 py-2">Password</th>
                      <th className="px-4 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {models
                      .slice((modelCurrentPage - 1) * modelRowsPerPage, modelCurrentPage * modelRowsPerPage)
                      .map((m, idx) => (
                        <tr key={m.id || `model-${idx}`} className="border-b border-gray-700 hover:bg-gray-800">
                          <td className="px-4 py-2">{m.id}</td>
                          <td className="px-4 py-2">{m.name}</td>
                          <td className="px-4 py-2">{m.phone}</td>
                          <td className="px-4 py-2">{m.location}</td>
                          <td className="px-4 py-2">{m.username || '-'}</td>
                          <td className="px-4 py-2">{m.password || '-'}</td>
                          <td className="px-4 py-2 capitalize">{String(m.status || '').toLowerCase()}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                <div className="flex items-center justify-between mt-4">
                  <button
                    onClick={() => setModelCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={modelCurrentPage === 1}
                    className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600"
                  >
                    Previous
                  </button>
                  <span className="text-gray-300">
                    Page {modelCurrentPage} of {Math.ceil(models.length / modelRowsPerPage)}
                  </span>
                  <button
                    onClick={() => setModelCurrentPage(prev => Math.min(Math.ceil(models.length / modelRowsPerPage), prev + 1))}
                    disabled={modelCurrentPage >= Math.ceil(models.length / modelRowsPerPage)}
                    className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600"
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <p className="text-gray-400">No models found</p>
            )}
          </div>
        </div>
      )}

      {/* DPR TAB */}
      {tab === "dpr" && (
        <div className="flex flex-col gap-6">
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Add Daily Performance Report</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm text-gray-300">Select Model</label>
                <select
                  className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-white"
                  value={dprForm.modelId}
                  onChange={(e) => {
                    const modelId = e.target.value;
                    setDprForm({ ...dprForm, modelId });
                    setMprForm({ ...mprForm, modelId: modelId, machv: "" });
                    recalculateRemainingDays(dprForm.date, modelId);
                    
                    // Check for existing DPR
                    const existing = checkExistingDPR(modelId, dprForm.date);
                    if (existing) {
                      setDprForm(prev => ({
                        ...prev,
                        modelId,
                        dtarget: String(existing.dtarget),
                        dachv: String(existing.dachv),
                      }));
                      setIsEditingDPR(true);
                    } else {
                      setIsEditingDPR(false);
                    }
                  }}
                >
                  <option value="">Choose a model</option>
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} (ID: {model.id})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-300">Date</label>
                <input
                  type="date"
                  className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-white"
                  value={dprForm.date}
                  onChange={(e) => {
                    const value = e.target.value;
                    setDprForm({ ...dprForm, date: value });
                    recalculateRemainingDays(value, dprForm.modelId);
                    
                    // Check for existing DPR
                    const existing = checkExistingDPR(dprForm.modelId, value);
                    if (existing) {
                      setDprForm(prev => ({
                        ...prev,
                        date: value,
                        dtarget: String(existing.dtarget),
                        dachv: String(existing.dachv),
                      }));
                      setIsEditingDPR(true);
                    } else {
                      setDprForm(prev => ({ ...prev, date: value, dtarget: "", dachv: "" }));
                      setIsEditingDPR(false);
                    }
                  }}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-300">Monthly Achievement (Auto-calculated sum)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    className="flex-1 rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-white bg-gray-700"
                    placeholder="Auto-calculated from DPR data"
                    value={mprForm.machv}
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={() => calculateMonthlyTotal(dprForm.modelId, numberOrZero(dprForm.dachv))}
                    disabled={loading || !dprForm.modelId}
                    className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 whitespace-nowrap"
                    title="Recalculate monthly total"
                  >
                    Calculate
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-300">Monthly Due (Auto)</label>
                <input
                  type="number"
                  className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-white bg-gray-700"
                  placeholder="Target - Achievement"
                  value={mprForm.mdue}
                  readOnly
                />
              </div>
              <div>
                <label className="text-sm text-gray-300">Remaining Days (Auto)</label>
                <input
                  type="number"
                  className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-white bg-gray-700"
                  placeholder="Days left in month"
                  value={mprForm.remaindays}
                  onChange={(e) => setMprForm({ ...mprForm, remaindays: e.target.value })}
                />
              </div>
            </div>

            {/* Daily Report Section */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3 text-blue-400">Daily Report</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-sm text-gray-300">Target</label>
                  <input
                    type="number"
                    className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-white"
                    placeholder="Enter target amount"
                    value={dprForm.dtarget}
                    onChange={(e) => setDprForm({ ...dprForm, dtarget: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300">Achievement</label>
                  <input
                    type="number"
                    className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-white"
                    placeholder="Enter achieved amount"
                    value={dprForm.dachv}
                    onChange={(e) => {
                      setDprForm({ ...dprForm, dachv: e.target.value });
                      // Trigger monthly calculation when achievement value is entered
                      if (dprForm.modelId && e.target.value !== "") {
                        calculateMonthlyTotal(dprForm.modelId, numberOrZero(e.target.value));
                      } else if (dprForm.modelId) {
                        calculateMonthlyTotal(dprForm.modelId, 0);
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300">Due (Auto)</label>
                  <input
                    type="number"
                    className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-white bg-gray-700"
                    disabled
                    value={Math.max(0, numberOrZero(dprForm.dtarget) - numberOrZero(dprForm.dachv))}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleAddDPR}
              disabled={loading}
              className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 disabled:bg-gray-600 mr-2"
            >
              {loading ? (isEditingDPR ? "Updating..." : "Adding...") : (isEditingDPR ? "Update DPR" : "Add DPR")}
            </button>
            {isEditingDPR && (
              <button
                onClick={() => {
                  setDprForm({ modelId: "", date: new Date().toISOString().split('T')[0], dtarget: "", dachv: "" });
                  setIsEditingDPR(false);
                }}
                disabled={loading}
                className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* DPR Table */}
          <div className="bg-gray-900 p-6 rounded-lg overflow-x-auto">
            <h2 className="text-xl font-bold mb-4">Daily Performance Report</h2>
            {dprs.length > 0 ? (
              <>
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-800 border-b border-gray-700">
                    <tr>
                      <th className="px-4 py-2">Model ID</th>
                      <th className="px-4 py-2">Model Name</th>
                      <th className="px-4 py-2">Date</th>
                      <th className="px-4 py-2">D Target</th>
                      <th className="px-4 py-2">D Achieved</th>
                      <th className="px-4 py-2">D Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dprs
                      .slice((dprCurrentPage - 1) * dprRowsPerPage, dprCurrentPage * dprRowsPerPage)
                      .map((d, i) => (
                        <tr key={i} className="border-b border-gray-700 hover:bg-gray-800">
                          <td className="px-4 py-2">{d.modelId}</td>
                          <td className="px-4 py-2">{getModelName(d.modelId)}</td>
                          <td className="px-4 py-2">{d.date}</td>
                          <td className="px-4 py-2">{d.dtarget}</td>
                          <td className="px-4 py-2">{d.dachv}</td>
                          <td className="px-4 py-2">{d.ddue || d.dtarget - d.dachv}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                <div className="flex items-center justify-between mt-4">
                  <button
                    onClick={() => setDprCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={dprCurrentPage === 1}
                    className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600"
                  >
                    Previous
                  </button>
                  <span className="text-gray-300">
                    Page {dprCurrentPage} of {Math.ceil(dprs.length / dprRowsPerPage)}
                  </span>
                  <button
                    onClick={() => setDprCurrentPage(prev => Math.min(Math.ceil(dprs.length / dprRowsPerPage), prev + 1))}
                    disabled={dprCurrentPage >= Math.ceil(dprs.length / dprRowsPerPage)}
                    className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600"
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <p className="text-gray-400">No DPR records found</p>
            )}
          </div>
        </div>
      )}

      {/* MPR TAB */}
      {tab === "mpr" && (
        <div className="flex flex-col gap-6">
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Add Monthly Target</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm text-gray-300">Select Model</label>
                <select
                  className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-white"
                  value={mprForm.modelId}
                  onChange={(e) => setMprForm({ ...mprForm, modelId: e.target.value })}
                >
                  <option value="">Choose a model</option>
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} (ID: {model.id})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-300">Month</label>
                <select
                  className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-white"
                  value={mprForm.month}
                  onChange={(e) => setMprForm({ ...mprForm, month: e.target.value })}
                >
                  <option>January</option>
                  <option>February</option>
                  <option>March</option>
                  <option>April</option>
                  <option>May</option>
                  <option>June</option>
                  <option>July</option>
                  <option>August</option>
                  <option>September</option>
                  <option>October</option>
                  <option>November</option>
                  <option>December</option>
                </select>
              </div>
            </div>

            {/* Monthly Target Section */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3 text-blue-400">Monthly Target</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-sm text-gray-300">Monthly Target (mtgt)</label>
                  <input
                    type="number"
                    className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-white"
                    placeholder="Enter monthly target"
                    value={mprForm.mtgt}
                    onChange={(e) => setMprForm({ ...mprForm, mtgt: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300">Monthly Achieved (machv)</label>
                  <input
                    type="number"
                    className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-white"
                    placeholder="Sum of daily achieved"
                    value={mprForm.machv}
                    onChange={(e) => setMprForm({ ...mprForm, machv: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300">Monthly Due (Auto)</label>
                  <input
                    type="number"
                    className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-white bg-gray-700"
                    disabled
                    value={Math.max(0, numberOrZero(mprForm.mtgt) - numberOrZero(mprForm.machv))}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300">Weekly Off Days (wkof)</label>
                  <input
                    type="number"
                    className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-white"
                    placeholder="5 or 6"
                    min="0"
                    max="7"
                    value={mprForm.wkof}
                    onChange={(e) => setMprForm({ ...mprForm, wkof: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300">Remaining Days (Auto)</label>
                  <input
                    type="number"
                    className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-white bg-gray-700"
                    disabled
                    value={
                      mprForm.month
                        ? Math.max(0, getDaysInMonth(mprForm.month, new Date().getFullYear()) - numberOrZero(mprForm.wkof))
                        : 0
                    }
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleAddMPR}
              disabled={loading}
              className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 disabled:bg-gray-600"
            >
              {loading ? "Adding..." : "Add Monthly Target"}
            </button>
          </div>

          {/* MPR Table */}
          <div className="bg-gray-900 p-6 rounded-lg overflow-x-auto">
            <h2 className="text-xl font-bold mb-4">Monthly Performance Reports</h2>
            {mprs.length > 0 ? (
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-800 border-b border-gray-700">
                  <tr>
                    <th className="px-4 py-2">Model ID</th>
                    <th className="px-4 py-2">Model Name</th>
                    <th className="px-4 py-2">Month</th>
                    <th className="px-4 py-2">Target</th>
                    <th className="px-4 py-2">Achieved</th>
                    <th className="px-4 py-2">Due</th>
                    <th className="px-4 py-2">Remaining Days</th>
                    <th className="px-4 py-2">Weekly Off</th>
                  </tr>
                </thead>
                <tbody>
                  {mprs.map((m, i) => (
                    <tr key={i} className="border-b border-gray-700 hover:bg-gray-800">
                      <td className="px-4 py-2">{m.modelId}</td>
                      <td className="px-4 py-2">{getModelName(m.modelId)}</td>
                      <td className="px-4 py-2">{m.month}</td>
                      <td className="px-4 py-2">{m.mtgt}</td>
                      <td className="px-4 py-2">{m.machv}</td>
                      <td className="px-4 py-2">{m.mdue}</td>
                      <td className="px-4 py-2">{m.remaindays}</td>
                      <td className="px-4 py-2">{m.wkof}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-400">No MPR records found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
