"use client";
import { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Home() {
  useEffect(() => {
    // Hide navbar on this page
    document.body.classList.add("hide-navbar");
    return () => {
      document.body.classList.remove("hide-navbar");
    };
  }, []);

  return (
    <div className="splash-container">
      {/* Background Video */}
      <video autoPlay loop muted playsInline className="splash-video">
        <source src="/videos/360679253075771401.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Centered Content */}
      <div className="splash-overlay">
        <div className="text-box text-center">
          {/* Logo */}
          <h1 className="display-4 text-white">
            <span className="text-danger fw-bold">R</span> Studio Live
          </h1>
          <p className="lead text-white">
            Discover the best 18+ LIVE entertainment experience.
          </p>

          {/* Interest Selection */}
          <p className="text-white fw-bold">I’m interested in:</p>
          <div className="d-flex justify-content-center gap-3">
            <button className="interest-btn girls">
              <i className="fas fa-venus"></i> GIRLS
            </button>
            <button className="interest-btn guys">
              <i className="fas fa-mars"></i> GUYS
            </button>
            <button className="interest-btn trans">
              <i className="fas fa-transgender"></i> TRANS
            </button>
          </div>

          {/* Confirmation Button */}
          <a href="/landing" className="btn btn-success btn-lg mt-3">
            I'm Over 18
          </a>

          {/* Terms & Privacy */}
          <p className="small text-white mt-3">
            By entering, you confirm you're 18+ and agree to our{" "}
            <a href="#" className="text-white">
              Terms of Use
            </a>{" "}
            &{" "}
            <a href="#" className="text-white">
              Privacy Policy
            </a>
            .
          </p>
          <a
            href="#"
            className="text-white small"
            onClick={() => window.history.back()}
          >
            Exit Here
          </a>
        </div>
      </div>
    </div>
  );
}
