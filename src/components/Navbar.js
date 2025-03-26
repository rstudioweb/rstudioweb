"use client";
import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useTheme } from "./ThemeProvider"; // ✅ Import useTheme from ThemeProvider

export default function Navbar() {
  const { theme, toggleTheme } = useTheme(); // ✅ Get theme and toggleTheme from ThemeProvider
  const [menuOpen, setMenuOpen] = useState(false);
  const [navbarSolid, setNavbarSolid] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setNavbarSolid(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`navbar navbar-expand-lg navbar-dark fixed-top ${
        navbarSolid ? "solid-navbar" : "transparent-navbar"
      }`}
    >
      <div className="container">
        <a className="navbar-brand text-danger fw-bold" href="#">
          R Studio
        </a>
        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`collapse navbar-collapse ${menuOpen ? "show" : ""}`}>
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <a className="nav-link text-white" href="#about">
                About
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-white" href="#services">
                Services
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-white" href="#contact">
                Contact
              </a>
            </li>
          </ul>
        </div>

        {/* ✅ Theme Toggle Button (Icon Only) */}
        <button className="btn btn-outline-light ms-3" onClick={toggleTheme}>
          {theme === "dark" ? "🌙" : "☀️"}
        </button>
      </div>
    </nav>
  );
}
