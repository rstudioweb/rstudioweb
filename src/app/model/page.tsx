"use client";

import { useEffect, useState } from "react";
import { ModelProfile } from "@/domain/model";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import RefreshIcon from "@mui/icons-material/Refresh";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

export default function ModelPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [model, setModel] = useState<ModelProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [todayTarget, setTodayTarget] = useState<number>(0);
  const [todayAch, setTodayAch] = useState<number>(0);
  const [todayDue, setTodayDue] = useState<number>(0);
  const [monthlyTarget, setMonthlyTarget] = useState<number>(0);
  const [monthlyAch, setMonthlyAch] = useState<number>(0);
  const [monthlyDue, setMonthlyDue] = useState<number>(0);
  const [remainingDays, setRemainingDays] = useState<number>(0);
  const [totalWorkingDays, setTotalWorkingDays] = useState<number>(0);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setError("Please enter both Username and Password");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/model/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || "Invalid credentials");
        setModel(null);
      } else {
        setModel(data.data);
        setIsLoggedIn(true);
        setError(null);
        setPassword("");
        loadTodayTarget(data.data.id);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Login failed";
      setError(errorMsg);
      setModel(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setModel(null);
    setUsername("");
    setPassword("");
    setTodayTarget(0);
    setTodayAch(0);
    setTodayDue(0);
    setMonthlyTarget(0);
    setMonthlyAch(0);
    setMonthlyDue(0);
    setRemainingDays(0);
    setTotalWorkingDays(0);
    setError(null);
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const loadTodayTarget = async (modelId: string) => {
    try {
      const now = new Date();
      const currentMonthIndex = now.getMonth(); // 0-based
      const currentYear = now.getFullYear();
      const daysPast = now.getDate();
      const todayIso = now.toISOString().split("T")[0];
      const monthName = now.toLocaleString("default", { month: "long" });

      // Fetch only this model's MPR data
      const mprRes = await fetch(`/api/mpr?modelId=${modelId}`);
      const mprData = await mprRes.json();

      let mtgt = 0;
      let wkof = 0;
      let machv = 0;
      if (mprData.success && Array.isArray(mprData.data)) {
        const match = mprData.data.find((m: any) => m.month === monthName);
        if (match) {
          mtgt = Number(match.mtgt) || 0;
          wkof = Number(match.wkof) || 0;
          machv = Number(match.machv) || 0;
        }
      }

      // Fetch only this model's DPR data
      const dprRes = await fetch(`/api/dpr?modelId=${modelId}`);
      const dprData = await dprRes.json();
      let totalAch = 0;
      let todaysAch = 0;
      if (dprData.success && Array.isArray(dprData.data)) {
        totalAch = dprData.data
          .filter((d: any) => {
            if (!d.date) return false;
            const dDate = new Date(d.date);
            return (
              dDate.getMonth() === currentMonthIndex &&
              dDate.getFullYear() === currentYear
            );
          })
          .reduce((sum: number, d: any) => sum + (Number(d.dachv) || 0), 0);

        const todays = dprData.data.find((d: any) => d.date === todayIso);
        todaysAch = Number(todays?.dachv) || 0;
      }

      const daysInMonth = getDaysInMonth(currentMonthIndex + 1, currentYear);
      const remainingWorkingDays = Math.max(1, daysInMonth - (daysPast + wkof));
      const tgt = Math.max(0, Math.round((mtgt - totalAch) / remainingWorkingDays));
      const due = Math.max(0, tgt - todaysAch);

      setTodayTarget(tgt);
      setTodayAch(todaysAch);
      setTodayDue(due);

      // Set monthly data
      const totalWorkDays = daysInMonth - wkof;
      const remDays = Math.max(0, daysInMonth - (daysPast + wkof));
      setMonthlyTarget(mtgt);
      setMonthlyAch(machv);
      setMonthlyDue(Math.max(0, mtgt - machv));
      setRemainingDays(remDays);
      setTotalWorkingDays(totalWorkDays);
    } catch (err) {
      console.error("Failed to load today target", err);
      setTodayTarget(0);
      setTodayAch(0);
      setTodayDue(0);
      setMonthlyTarget(0);
      setMonthlyAch(0);
      setMonthlyDue(0);
      setRemainingDays(0);
      setTotalWorkingDays(0);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getFirstName = (fullName: string) => {
    const firstName = fullName?.split(' ')[0] || fullName || "Guest";
    // Convert to proper case: first letter uppercase, rest lowercase
    return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
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
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshDashboard = async () => {
    if (!model?.id || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await loadTodayTarget(model.id);
    } catch (err) {
      console.error("Failed to refresh dashboard", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const updateClock = () => {
      setCurrentDate(getCurrentDate());
      setCurrentTime(getCurrentTime());
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isLoggedIn && model?.id) {
      loadTodayTarget(model.id);
      
      // Auto-refresh dashboard every 15 minutes
      const autoRefreshInterval = setInterval(() => {
        loadTodayTarget(model.id);
      }, 15 * 60 * 1000); // 15 minutes

      return () => clearInterval(autoRefreshInterval);
    }
  }, [isLoggedIn, model?.id]);

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-lg p-8 w-full max-w-md shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Model Login</h1>
            <p className="text-gray-400">Enter your credentials to continue</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-4 py-3 rounded-md bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:border-blue-500 focus:outline-none transition"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-md bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:border-blue-500 focus:outline-none transition"
                required
              />
            </div>

            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-md transition"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white p-4 font-[family-name:var(--font-inter)] font-semibold">
      <div className="flex justify-between items-center mb-6">
        <button className="text-white text-2xl hover:opacity-80 transition">
          <MenuIcon sx={{ fontSize: 28 }} />
        </button>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">Last Online: {getCurrentDate()}</span>
          <button
            onClick={handleLogout}
            className="text-sm px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md transition flex items-center gap-2"
          >
            <LogoutIcon sx={{ fontSize: 18 }} />
            Logout
          </button>
        </div>
      </div>

      <div className="relative mb-8">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <p className="text-5xl text-gray-400 font-[family-name:var(--font-italianno)]">{getGreeting()} ...</p>
            <h1 className="text-5xl text-white font-[family-name:var(--font-italianno)]">
              {getFirstName(model?.name || "")}
            </h1>
          </div>

          {model?.profileImage ? (
            <img
              src={model.profileImage}
              alt={model.name}
              className="w-24 h-24 rounded-full object-cover border-2 border-gray-500"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-400 border-2 border-gray-500 flex items-center justify-center">
              <AccountCircleIcon sx={{ fontSize: 80, color: "#666" }} />
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-400 mb-8">
          <span>{currentDate || getCurrentDate()}</span>
          <AccessTimeIcon sx={{ fontSize: 20 }} />
          <span>{currentTime || getCurrentTime()}</span>
        </div>
      </div>

      <div className="bg-red-600 text-white font-bold py-3 px-4 rounded-md mb-8 text-center">
        <div className="overflow-hidden">
          <div
            className="whitespace-nowrap"
            style={{
              display: "inline-block",
              animation: "scroll-left 12s linear infinite",
            }}
          >
            YOU HAVE {todayDue} TOKEN DUE FOR TODAY
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">TODAY</h2>
          <button
            onClick={refreshDashboard}
            disabled={isRefreshing}
            className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
            title="Refresh dashboard"
          >
            <RefreshIcon 
              sx={{ 
                fontSize: 24,
                animation: isRefreshing ? "spin 1s linear infinite" : "none"
              }} 
            />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-3 text-center">
          <div className="text-xs text-gray-400 font-semibold">TGT</div>
          <div className="text-xs text-gray-400 font-semibold">ACH</div>
          <div className="text-xs text-gray-400 font-semibold">DUE</div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-red-600 text-white font-bold py-6 px-4 rounded-md text-center text-2xl">
            {todayTarget}
          </div>
          <div className="bg-green-500 text-white font-bold py-6 px-4 rounded-md text-center text-2xl">
            {todayAch}
          </div>
          <div className="bg-yellow-500 text-white font-bold py-6 px-4 rounded-md text-center text-2xl">
            {todayDue}
          </div>
        </div>
      </div>

      <div>
        <div className="mb-4">
          <h2 className="text-lg font-bold mb-2">MONTHLY</h2>
          <p className="text-sm text-gray-400">{remainingDays}/{totalWorkingDays} Days</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-3 text-center">
          <div className="text-xs text-gray-400 font-semibold">TGT</div>
          <div className="text-xs text-gray-400 font-semibold">ACH</div>
          <div className="text-xs text-gray-400 font-semibold">DUE</div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-gray-700 text-white font-bold py-6 px-4 rounded-md text-center text-2xl">
            {monthlyTarget}
          </div>
          <div className="bg-gray-700 text-white font-bold py-6 px-4 rounded-md text-center text-2xl">
            {monthlyAch}
          </div>
          <div className="bg-gray-700 text-white font-bold py-6 px-4 rounded-md text-center text-2xl">
            {monthlyDue}
          </div>
        </div>

        <div className="bg-gray-800 rounded-md p-8 min-h-[200px]"></div>
      </div>
    </div>
  );
}

