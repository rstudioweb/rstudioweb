// src/app/page.tsx
"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useMediaQuery } from "@/lib/hooks/use-media-query"; // Adjust path if different

const HomeMobile = dynamic(() => import("./home/mpage"));
const HomeDesktop = dynamic(() => import("./home/page"));

export default function Page() {
  const isMobile = useMediaQuery("(max-width: 767px)");

  return isMobile ? <HomeMobile /> : <HomeDesktop />;
}
