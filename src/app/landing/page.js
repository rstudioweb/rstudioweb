"use client";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

import LoadingScreen from "../../components/LoadingScreen";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function Home() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    /*  setTimeout(() => {
      setLoading(false); // Hide loading animation after 2 seconds
    }, 2000); */
  }, []);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: "5px",
    autoplay: true, // Enable auto-scroll
    autoplaySpeed: 3000, // Time in milliseconds (3 seconds per slide)
    pauseOnHover: true, // Pause when hovered
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };
  const othModelssliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: "5px",
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const cards = [
    { id: 1, image: "/images/0.png", title: "💎 High Earnings" },
    { id: 2, image: "/images/0.png", title: "🔒 Privacy & Security" },
    { id: 3, image: "/images/0.png", title: "📢 Flexible Schedule" },
  ];

  const models = [
    {
      image: "/images/1.png",
      name: "Model Name",
      price: "120",
      locked: true,
    },
    {
      image: "/images/2.png",
      name: "Model Name",
      price: "120",
      locked: true,
    },
    {
      image: "/images/3.png",
      name: "Model Name",
      price: "120",
      locked: true,
    }, // Locked Model
    {
      image: "/images/0.png",
      name: "Model Name",
      price: "120",
      locked: false,
    },
  ];

  return (
    <>
      {loading ? (
        <LoadingScreen setLoading={setLoading} />
      ) : (
        <div>
          {/* Hero Section */}
          {/* <header className="hero-section">
        <div className="container">
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
      </header> */}
          {/* Hero Section with Video */}
          <header className="hero-section">
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
                  Experience the finest with R Studio. Join today and redefine
                  your journey.
                </p>
                <a href="/signup" className="btn btn-danger btn-lg fade-in">
                  Get Started
                </a>
              </div>
            </div>
          </header>

          {/* Main Content Section */}
          <section className="main-content py-5">
            <div className="container-fluid">
              <div className="row align-items-center">
                {/* Left Column - Info Box */}
                <div className="col-md-4 px-5">
                  <div className="info-box p-4 bg-danger text-white text-center shadow-lg">
                    <h3>Why Choose R Studio?</h3>
                    <p>
                      We provide a safe, flexible, and lucrative environment for
                      models to showcase their talent.
                    </p>
                  </div>
                </div>
                {/* Right Column - Card Slider */}
                <div className="col-md-8 card-slider px-5">
                  <Slider {...sliderSettings} className="card-slider">
                    {cards.map((card) => (
                      <div
                        key={card.id}
                        className="card card-slider-item"
                        onClick={() => {
                          setSelectedImage(card.image);
                          setLightboxOpen(true);
                        }}
                      >
                        <img src={card.image} alt={card.title} />
                        <div className="zoom-icon">🔍</div>
                        <div className="card-title-overlay">{card.title}</div>
                      </div>
                    ))}
                  </Slider>
                </div>
              </div>
            </div>
          </section>
          {/* Lightbox for Image Preview */}
          <Lightbox
            open={lightboxOpen}
            close={() => setLightboxOpen(false)}
            slides={[{ src: selectedImage }]}
          />

          {/* Other Models Section */}
          <section className="other-models-section">
            <div className="container-fluid px-0">
              <div className="row mx-0">
                <h2 className="text-white text-center">Other Models</h2>
                <p className="text-white text-center">
                  Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry.
                </p>
                <div className="col-12 px-5">
                  {/* Slick Slider */}
                  <Slider
                    {...othModelssliderSettings}
                    className="models-slider"
                  >
                    {models.map((model, index) => (
                      <div
                        key={index}
                        className={`model-card ${model.locked ? "locked" : ""}`}
                      >
                        <div className="model-image-container">
                          <img
                            src={model.image}
                            alt={model.name}
                            className="model-image"
                          />
                          {model.locked && (
                            <div className="locked-overlay">
                              <i className="fa fa-lock lock-icon"></i>
                            </div>
                          )}
                        </div>
                        <div className="model-info">
                          <h5>{model.name}</h5>
                          <p>
                            Price for 1 hour: <strong>${model.price}</strong>
                          </p>
                          <button className="btn btn-outline-light">
                            {model.locked ? "Unlock" : "View"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </Slider>
                </div>{" "}
              </div>
            </div>
          </section>
          <section className="why-choose-us py-5">
            <div className="container text-center">
              <h2 className="text-white fw-bold">
                Why Choose Our Escort Agency?
              </h2>
              <p className="text-white">
                There Are a Lot of Reasons to Choose Us. Here Are a Few.
              </p>

              <div className="row justify-content-center">
                {/* Card 1 */}
                <div className="col-md-3">
                  <div className="why-card">
                    <i className="fas fa-cogs why-icon"></i>
                    <h3>5+</h3>
                    <p>Years in Operation</p>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="col-md-3">
                  <div className="why-card">
                    <i className="fas fa-gem why-icon"></i>
                    <h3>12</h3>
                    <p>High-End Escorts</p>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="col-md-3">
                  <div className="why-card">
                    <i className="fas fa-female why-icon"></i>
                    <h3>10/10</h3>
                    <p>Genuinely Beautiful Escorts</p>
                  </div>
                </div>

                {/* Card 4 */}
                <div className="col-md-3">
                  <div className="why-card">
                    <i className="fas fa-star why-icon"></i>
                    <h3>100%</h3>
                    <p>Client-Focused</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <elevenlabs-convai agent-id="r5F8WgbihJqXb66WIAR3"></elevenlabs-convai>
          <script
            src="https://elevenlabs.io/convai-widget/index.js"
            async
            type="text/javascript"
          ></script>
          {/* Footer */}
          <footer className="footer py-4">
            <div className="container">
              <div className="row">
                {/* Luxury Escort Info */}
                <div className="col-md-3">
                  <h4 className="text-white">Luxury Escort</h4>
                  <p className="text-white-50">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut
                    elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus
                    leo.
                  </p>
                </div>

                {/* Payment Options */}
                <div className="col-md-3">
                  <h5 className="text-white">Payment Options</h5>
                  <p className="text-white-50">
                    For your convenience, my agency accepts cash and the
                    following payment methods:
                  </p>
                  <div className="payment-icons">
                    <img src="/images/visa.png" alt="Visa" />
                    <img src="/images/mastercard.png" alt="Mastercard" />
                    <img src="/images/paypal.png" alt="PayPal" />
                  </div>
                </div>

                {/* Social Media */}
                <div className="col-md-3">
                  <h5 className="text-white">Social Media</h5>
                  <p className="text-white-50">
                    Stay connected. Follow my agency on social media:
                  </p>
                  <div className="social-icons">
                    <i className="fab fa-facebook-f"></i>
                    <i className="fab fa-instagram"></i>
                    <i className="fab fa-twitter"></i>
                  </div>
                </div>

                {/* Newsletter Signup */}
                <div className="col-md-3">
                  <h5 className="text-white">Newsletter Sign Up</h5>
                  <p className="text-white-50">
                    I'll send you an email from time to time. Don't worry, I
                    don't spam.
                  </p>
                  <div className="newsletter">
                    <input type="email" placeholder="Email" />
                    <button type="submit">
                      <i className="fas fa-check"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      )}
    </>
  );
}
