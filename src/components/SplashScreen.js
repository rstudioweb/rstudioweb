"use client"; // Add this at the top

import { motion } from "framer-motion";

const SplashScreen = ({ onComplete }) => {
  return (
    <div className="splash-container">
      {/* First Silhouette - Walking Animation */}
      <motion.div
        className="silhouette silhouette-1"
        initial={{ x: "-100%", opacity: 0 }}
        animate={{ x: "0%", opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />

      {/* Second Silhouette - Turning Animation */}
      <motion.div
        className="silhouette silhouette-2"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.8, ease: "easeOut", delay: 0.5 }}
      />

      {/* Fade Out & Reveal Main Site */}
      <motion.div
        className="overlay"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.5, delay: 3 }}
        onAnimationComplete={onComplete}
      />
    </div>
  );
};

export default SplashScreen;
