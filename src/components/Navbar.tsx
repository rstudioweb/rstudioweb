"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Menu, X } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile"; // 👈 import the hook

export function NavigationMenuDemo() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile(); // 👈 use the hook

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navBgClass =
    isMobile || isMobileMenuOpen
      ? "bg-red-900"
      : isScrolled
      ? "bg-red-900/30 backdrop-blur shadow-md"
      : "bg-red-900";

  return (
    <div
      className={`w-full fixed top-0 left-0 z-50 transition-all duration-300 ${navBgClass}`}
    >
      <NavigationMenu className="max-w-9xl mx-auto w-full px-4 sm:px-10 py-4">
        <NavigationMenuList className="flex items-center justify-between w-full">
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link
                href="/"
                className="text-2xl font-extrabold tracking-wide text-white hover:text-yellow-100 transition-colors"
              >
                R STUDIO
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>

          {/* Desktop Menu */}
          <NavigationMenuItem className="hidden sm:flex items-center gap-4">
            <NavigationMenuLink asChild>
              <Link
                href="/signup"
                className="text-sm font-medium text-white hover:text-yellow-300 transition-colors"
              >
                Apply
              </Link>
            </NavigationMenuLink>
            <Button
              variant="outline"
              className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black px-6 py-2 rounded-full transition text-sm shadow"
            >
              Join Us
            </Button>
            <Button
              variant="default"
              className="bg-red-600 hover:bg-red-700 text-white transition rounded-full px-6 py-2 text-sm shadow"
            >
              Login
            </Button>
          </NavigationMenuItem>

          {/* Mobile Toggle */}
          <div className="sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </NavigationMenuList>
      </NavigationMenu>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed top-0 left-0 w-64 h-full bg-red-900 text-white z-50 shadow-lg transition-transform sm:hidden">
          <div className="flex justify-between items-center px-4 py-4 border-b border-red-700">
            <span className="text-xl font-bold">R STUDIO</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-white"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="flex flex-col gap-4 p-4 text-sm">
            <Link
              href="/signup"
              className="hover:text-yellow-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Apply
            </Link>
            <Button
              variant="outline"
              className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black w-full rounded-full"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Join Us
            </Button>
            <Button
              variant="default"
              className="bg-red-600 hover:bg-red-700 text-white w-full rounded-full"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Login
            </Button>
          </nav>
        </div>
      )}
    </div>
  );
}
