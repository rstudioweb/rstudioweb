"use client";
import { useEffect } from "react";

const LoadingScreen = ({ setLoading }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // Hide loading screen after 2 seconds

    return () => clearTimeout(timer);
  }, [setLoading]);

  return (
    <div className="loading-screen">
      <div className="loading-container">
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
      </div>
    </div>
  );
};

export default LoadingScreen;
