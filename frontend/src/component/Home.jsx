import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import "../css/home.css";
import ServicesSlider from "./ServiceSlider";

const slideImages = [
  {
    url: "https://www.fashionlady.in/wp-content/uploads/2015/08/designer-floral-lehenga.jpg",
    title: "Premium Coat Dry Cleaning",
  },
  {
    url: "https://tse3.mm.bing.net/th/id/OIP.kq5D7QYHqV6eRgphv50AAQHaEK?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
    title: "Professional Steam Pressing",
  },
  {
    url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80",
    title: "Lehenga & Ethnic Care",
  },
  {
    url: "https://tse4.mm.bing.net/th/id/OIP.mR7tsGYdc-EWbMmRuromHAHaE8?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
    title: "Blanket & Heavy Linen",
  },
  {
    url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
    title: "Curtain Cleaning",
  },
];

const areas = [
  "Rajapuri",
  "Uttam Nagar",
  "Dwarka",
  "Dwarka Mor",
  "Bindapur",
   "Madhu-Vihar",
];

function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // ==============================
  // AREA TYPEWRITER STATES
  // ==============================
  const [areaIndex, setAreaIndex] = useState(0);
  const [displayedArea, setDisplayedArea] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // ==============================
  // IMAGE SLIDER
  // ==============================
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slideImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // ==============================
  // AREA TYPEWRITER ANIMATION
  // ==============================
  useEffect(() => {
    const currentArea = areas[areaIndex];

    let typingSpeed = isDeleting ? 180 : 180;

    // Jab poora area type ho jaye
    if (!isDeleting && displayedArea === currentArea) {
      typingSpeed = 2200;
    }

    // Jab poora area delete ho jaye
    if (isDeleting && displayedArea === "") {
      setIsDeleting(false);
      setAreaIndex((prev) => (prev + 1) % areas.length);
      return;
    }

    const timer = setTimeout(() => {
      if (!isDeleting) {
        // TYPE
        setDisplayedArea(currentArea.substring(0, displayedArea.length + 1));

        // Agar complete ho gaya to deleting start karo
        if (displayedArea.length + 1 === currentArea.length) {
          setIsDeleting(true);
        }
      } else {
        // DELETE
        setDisplayedArea(currentArea.substring(0, displayedArea.length - 1));
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [displayedArea, isDeleting, areaIndex]);

  return (
    <main className="krishna-main">
     

      {/* =====================================
          NOW SERVING AREA
      ===================================== */}
      <section className="serving-area">
        <div className="serving-text">
          <span className="serving-static">Now Serving in </span>

          <span className="area-name">
            {displayedArea}
            <span className="typing-cursor">|</span>
          </span>
        </div>
      </section>

      {/* =====================================
          HERO SECTION
      ===================================== */}
      <section className="hero-section">
        <div className="hero-content">
          <p className="trusted-text">Krishna Dry Cleaning</p>

          <h1 className="hero-title">
            Premium Dry Cleaning <br /> &{" "}
            <span>Steam Press</span> Service
          </h1>

          <div className="india-badge">BEST SERVICE IN YOUR CITY</div>

          <p className="hero-desc">
            Expert care for your Lehengas, Coats, Blankets, and Curtains.
            We provide professional steam pressing for a crisp,
            wrinkle-free look.
          </p>

          <div className="hero-buttons">
            <Link to="/" className="pickup-btn">
              Schedule Free Pickup Now →
            </Link>

            <a
              href="https://wa.me/9910655308"
              className="whatsapp-btn"
              target="_blank"
              rel="noreferrer"
            >
              Chat On Whatsapp
            </a>
          </div>
        </div>

        {/* =====================================
            HERO IMAGE SLIDER
        ===================================== */}
        <div className="hero-visual">
          <div className="main-display-box">
            <img
              src={slideImages[currentIndex].url}
              alt={slideImages[currentIndex].title}
              className="main-active-img"
            />

            <div className="delivery-badge">
              <strong>FREE</strong>
              <span>HOME DELIVERY</span>
            </div>
          </div>

          {/* THUMBNAILS */}
          <div className="thumbnails-row">
            {slideImages.map((img, i) => (
              <div
                key={i}
                className={`thumb-box ${
                  i === currentIndex ? "active-thumb" : ""
                }`}
                onClick={() => setCurrentIndex(i)}
              >
                <img src={img.url} alt={img.title} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================
          SERVICES SLIDER
      ===================================== */}
      <ServicesSlider />
    </main>
  );
}

export default Home;