"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

const images = ["/slide1.png", "/slide2.png", "/slide3.png"];

const faq = [
  {
    q: "Who are R Studio?",
    a: "A smart, broadcasters platform.",
  },
  {
    q: "Is it free to apply?",
    a: "Yes, Its free for a time period until any changes.",
  },
  {
    q: "How do I apply?",
    a: "Click the 'Apply Now' button below to get started.",
  },
];

export default function MobileHomePage() {
  const [index, setIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-dvh bg-black text-white relative overflow-x-hidden">
      {/* Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-50 w-64 h-full bg-black p-4 transition-transform duration-300 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="text-lg font-bold text-white">Menu</div>
        <nav className="mt-6 space-y-4">
          <a
            href="#hero"
            onClick={closeSidebar}
            className="block hover:text-[#ff2a6d]"
          >
            Home
          </a>
          <a
            href="#cards"
            onClick={closeSidebar}
            className="block hover:text-[#ff2a6d]"
          >
            Features
          </a>
          <a
            href="#jobs"
            onClick={closeSidebar}
            className="block hover:text-[#ff2a6d]"
          >
            Jobs
          </a>
          <a
            href="#faq"
            onClick={closeSidebar}
            className="block hover:text-[#ff2a6d]"
          >
            FAQ
          </a>
        </nav>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-black/30 backdrop-blur-lg border-b border-white/10">
        <button onClick={toggleSidebar} className="text-white text-xl">
          ☰
        </button>
        <h1 className="text-lg font-semibold text-[#ff2a6d]">R Studio</h1>
      </header>
      <main className="pt-16 space-y-16 z-0">
        {/* Hero Slider */}
        <section id="hero" className="relative h-[20vh] w-full overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={images[index]}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${images[index]})` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-center px-6">
            <h2 className="text-3xl font-bold text-[#ffb3c6] drop-shadow-md">
              Experience the World in your Finger
            </h2>
          </div>
        </section>
        <section>
          <div className="justify-center items-center text-center">
            <p className="text-4xl text-center">
              Join R Studio
              <br />
              <span className="">&</span>
              <br />
              <span className="text-[#ff2a6d]">Make Money</span>
            </p>
            <Link href="/signup/form">
              <Button className="bg-[#ff2a6d] text-white px-8 py-4 rounded-full text-lg shadow-lg hover:bg-[#cc2358] transition mt-4">
                Apply Now
              </Button>
            </Link>
          </div>
        </section>
        <section className="text-center">
          <div>Special Offers</div>
          Benefit:
          <ul className="list-none md:list-disc text-left px-10">
            <li>Work flexibility anytime when free can join live,</li>
            <li>Use mask in the stream and hide face</li>
            <li>Hide any country</li>
            <li>Ban any fans/followers/viewers</li>
          </ul>
          <br />
          <ul className="list-none md:list-disc text-left px-10">
            <li> Salary As per your performance </li>
            <li>Approximately 15-45k in a month</li>
            <li>Dress free from company </li>
            <li>Make up free from company </li>
            <li>Weekly gifts and prizes</li>
          </ul>
          <p className="underline decoration-2">
            Apply Now before it get chargeable for id Creation
          </p>
        </section>
        {/* FAQ */}
        <section id="faq" className="px-4">
          <h2 className="text-2xl font-bold text-[#ff2a6d] mb-4">FAQ</h2>
          <div className="space-y-4">
            {faq.map((item, i) => (
              <details
                key={i}
                className="bg-black/30 rounded-lg p-4 border border-white/10"
              >
                <summary className="cursor-pointer font-medium text-white">
                  {item.q}
                </summary>
                <p className="text-sm text-gray-300 mt-2">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
