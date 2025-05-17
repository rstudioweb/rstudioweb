"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

// Your dark, seductive background images
const images = ["/slide1.png", "/slide2.png", "/slide3.png"];

export default function SplashPage() {
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Background slider
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle Start Button
  const handleStart = () => {
    setLoading(true);
    setTimeout(() => {
      router.push("/mhome");
    }, 2000);
  };

  return (
    <main className="relative h-dvh w-full overflow-hidden">
      {/* Background Image Slider */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={images[index]}
            className="absolute inset-0 bg-cover bg-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            style={{ backgroundImage: `url(${images[index]})` }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      </div>

      {/* Text + Button */}
      {!loading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6">
          <motion.h1
            className="text-4xl font-extrabold text-rose-700 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Welcome to R Studio
          </motion.h1>
          <motion.p
            className="text-lg font-italic mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            Your best Cam Sites are waiting to see you…
          </motion.p>
          <motion.p
            className="text-lg font-bold mb-10 mt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 2 }}
          >
            <Button
              onClick={handleStart}
              className="rounded-full px-8 py-4 text-lg bg-pink-700 hover:bg-[#cc2358] text-white shadow-xl"
            >
              Start
            </Button>
          </motion.p>
        </div>
      )}

      {/* Loader Animation */}
      <AnimatePresence>
        {loading && (
          <motion.div
            key="loader"
            className="absolute inset-0 z-20 flex items-center justify-center bg-black text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="text-2xl font-bold text-[#ff2a6d]"
              initial={{ scale: 0.8 }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
              transition={{
                repeat: Infinity,
                duration: 1.2,
                ease: "easeInOut",
              }}
            >
              Loading R Studio...
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
