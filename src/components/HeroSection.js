"use client";
import { useEffect, useState } from "react";

const HeroSection = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768); // Mobile screen size
    };

    checkScreenSize(); // Initial check
    window.addEventListener("resize", checkScreenSize); // Listen for resize

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <header className="hero-section">
      <section className={`hero ${isMobile ? "hero-mobile" : ""}`}>
        <video autoPlay loop muted playsInline className="hero-video">
          <source src="/videos/360679253075771401.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <div className="hero-overlay">
          <div className="container text-center">
            <h1 className="display-3 fw-bold text-danger fade-in">
              Luxury & Elegance
            </h1>
            <p className="lead fade-in">
              Experience the finest with R Studio. Join today and redefine your
              journey.
            </p>
            <a href="/signup" className="btn btn-danger btn-lg fade-in">
              Get Started
            </a>
          </div>
        </div>
      </section>
    </header>
  );
};

export default HeroSection;
