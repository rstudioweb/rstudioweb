// src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useMediaQuery } from "@/lib/hooks/use-media-query"; // Adjust path if different

const HomeMobile = dynamic(() => import("./home/mpage"));
const HomeDesktop = dynamic(() => import("./home/page"));

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const isMobile = useMediaQuery("(max-width: 767px)");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keep first client render identical to SSR output to avoid hydration ID drift.
  if (!mounted) {
    return <HomeDesktop />;
  }

  return isMobile ? <HomeMobile /> : <HomeDesktop />;
}
