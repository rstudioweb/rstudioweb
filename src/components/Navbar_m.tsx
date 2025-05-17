"use client";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-black/60 backdrop-blur-md p-4 flex justify-between items-center">
      {" "}
      <h1 className="text-xl font-bold">🔥 R STUDIO</h1>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" className="text-white p-0">
            <Menu className="w-6 h-6" />
          </Button>
        </SheetTrigger>

        <SheetContent
          side="right"
          className="bg-red-900 top-0 left-0 text-white w-80 z-1 h-screen overflow-y-auto z-50 "
        >
          {/* ✅ Screen-reader title */}
          <SheetTitle className="sr-only ">Main Navigation</SheetTitle>

          <nav className="flex flex-col  space-y-4 mt-10 p-4">
            <Link href="#" onClick={() => setOpen(false)}>
              Home
            </Link>
            <Link href="#" onClick={() => setOpen(false)}>
              Models
            </Link>
            <Link href="#" onClick={() => setOpen(false)}>
              Bookings
            </Link>
            <Link href="#" onClick={() => setOpen(false)}>
              Contact
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
