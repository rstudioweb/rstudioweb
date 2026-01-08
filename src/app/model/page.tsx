"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { ModelProfile } from "@/domain/model";
import { generateDeviceFingerprint } from "@/lib/device-helper";
import { getISTDate, getISTTimestamp, toISTDateString, formatSeconds } from "@/lib/timezone-helper";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import RefreshIcon from "@mui/icons-material/Refresh";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import styles from "./model.module.css";

export default function ModelPage() {
  const [showSplash, setShowSplash] = useState(true);
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
  const [deviceInfo] = useState(() => generateDeviceFingerprint());
  const [todayTotalSeconds, setTodayTotalSeconds] = useState<number>(0);
  const [dayWiseSessions, setDayWiseSessions] = useState<Array<{ date: string; totalSeconds: number; sessions: any[] }>>([]);
  const [splashImage] = useState(() => {
    const imageNumber = Math.floor(Math.random() * 4) + 1; // Random 1-4
    return `/wlp/${imageNumber}.png`;
  });

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
        // Log login session with device info
        try {
          const date = getISTDate();
          const loginAt = getISTTimestamp();
          await fetch('/api/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'login',
              modelId: data.data.id,
              date,
              loginAt,
              deviceId: deviceInfo.deviceId,
              deviceName: deviceInfo.deviceName,
            }),
          });
        } catch (e) {
          console.warn('Failed to log login session');
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Login failed";
      setError(errorMsg);
      setModel(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    // Log logout session with device info
    try {
      const date = getISTDate();
      const logoutAt = getISTTimestamp();
      await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'logout',
          modelId: model?.id,
          date,
          logoutAt,
          deviceId: deviceInfo.deviceId,
        }),
      });
    } catch (e) {
      console.warn('Failed to log logout session');
    }

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

  const loadTodaySessions = async (modelId: string) => {
    try {
      const date = getISTDate();
      const res = await fetch(`/api/session?modelId=${modelId}&date=${date}`);
      const data = await res.json();
      if (data.success && data.data) {
        setTodayTotalSeconds(data.data.totalSeconds || 0);
      }
    } catch (err) {
      console.error('Failed to load today sessions', err);
    }
  };

  const loadDayWiseSessions = async (modelId: string) => {
    try {
      const sessions = [];
      // Load last 7 days in IST
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = toISTDateString(date);
        const res = await fetch(`/api/session?modelId=${modelId}&date=${dateStr}`);
        const data = await res.json();
        if (data.success && data.data) {
          sessions.push(data.data);
        }
      }
      setDayWiseSessions(sessions.filter(s => s));
    } catch (err) {
      console.error('Failed to load day wise sessions', err);
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
      await loadTodaySessions(model.id);
    } catch (err) {
      console.error("Failed to refresh dashboard", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // App/tab close: send logout via Beacon when logged-in
  useEffect(() => {
    if (!isLoggedIn || !model?.id) return;

    const sendLogoutBeacon = () => {
      try {
        const date = getISTDate();
        const logoutAt = getISTTimestamp();
        const payload = JSON.stringify({
          type: 'logout',
          modelId: model.id,
          date,
          logoutAt,
        });
        if (navigator.sendBeacon) {
          const blob = new Blob([payload], { type: 'application/json' });
          navigator.sendBeacon('/api/session', blob);
        } else {
          fetch('/api/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload });
        }
      } catch {}
    };

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') sendLogoutBeacon();
    };
    const onBeforeUnload = () => {
      sendLogoutBeacon();
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [isLoggedIn, model?.id]);

  // Refresh session data every minute when logged in
  useEffect(() => {
    if (!isLoggedIn || !model?.id) return;
    loadTodaySessions(model.id);
    loadDayWiseSessions(model.id);
    const interval = setInterval(() => {
      loadTodaySessions(model.id);
      loadDayWiseSessions(model.id);
    }, 60000); // Every minute
    return () => clearInterval(interval);
  }, [isLoggedIn, model?.id]);

  useEffect(() => {
    const updateClock = () => {
      setCurrentDate(getCurrentDate());
      setCurrentTime(getCurrentTime());
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);

    return () => clearInterval(timer);
  }, []);

  // Splash screen timer
  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 3500); // Show splash for 3.5 seconds

    return () => clearTimeout(splashTimer);
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

  // Splash Screen
  if (showSplash) {
    return (
      <div className={styles.splash}>
        <Image
          src={splashImage}
          alt="Splash background"
          fill
          priority
          quality={75}
          className={styles.splashBackground}
          style={{ objectFit: 'cover' }}
        />
        <div className={styles.splashText}>R Studio</div>
      </div>
    );
  }

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
            <p className={`text-5xl text-gray-400 font-[family-name:var(--font-italianno)] ${styles.wave}`}>
              {getGreeting()} ...
            </p>
            <h1
              className={`text-5xl text-white font-[family-name:var(--font-italianno)] ${styles.shimmer}`}
              data-text={getFirstName(model?.name || "")}
            >
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

        <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
          <span>{currentDate || getCurrentDate()}</span>
          <AccessTimeIcon sx={{ fontSize: 20 }} />
          <span>{currentTime || getCurrentTime()}</span>
        </div>
      </div>

      <div className="bg-red-600 text-white font-bold py-3 px-4 rounded-md mb-8 text-center">
        <div className={styles.marquee}>
          <div className={styles.marqueeContent}>
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

      <div className="mb-4">
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

      {/* Today's Online Time Widget */}
      <div className="mb-4">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-2 px-2 rounded-md text-center">
          <div className="text-sm text-purple-100 mb-2">Today's Online Time</div>
          <div className="text-4xl font-mono">{formatSeconds(todayTotalSeconds)}</div>
          <div className="text-xs text-purple-100 mt-2">{deviceInfo.deviceName}</div>
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

        {/* Day-wise Login History - Hidden for now */}
        {/* 
        <div className="bg-gray-800 rounded-md p-6">
          <h3 className="text-lg font-bold mb-4 text-white">Login History (Last 7 Days)</h3>
          {dayWiseSessions.length > 0 ? (
            <div className="space-y-4">
              {dayWiseSessions.map((day, idx) => (
                <div key={idx} className="bg-gray-900 p-4 rounded-md">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-white font-semibold">{new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    <span className="text-purple-400 font-bold text-lg">{formatSeconds(day.totalSeconds)}</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    {day.sessions && day.sessions.map((session: any, sIdx: number) => (
                      <div key={sIdx} className="flex justify-between items-center text-gray-300">
                        <div>
                          <span className="text-gray-400">#{sIdx + 1}</span>
                          {session.deviceName && <span className="text-xs ml-2 text-gray-500">({session.deviceName})</span>}
                        </div>
                        <div className="text-right">
                          <div>{new Date(session.loginAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                          {session.logoutAt && (
                            <div className="text-gray-400">→ {new Date(session.logoutAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">No login history available</div>
          )}
        </div>
        */}
      </div>
    </div>
  );
}

