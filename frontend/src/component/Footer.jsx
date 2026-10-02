import React from "react";
import { Link } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaClock,
  FaWhatsapp,
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaArrowRight,
  FaTshirt,
  FaChevronRight,
} from "react-icons/fa";

import "../css/Footer.css";

export default function Footer() {
  return (
    <footer className="kd-footer">

      {/* ================= TOP CTA ================= */}
      <div className="kd-footer-cta">
        <div className="kd-footer-cta-content">
          <div>
            <span className="kd-cta-small">PREMIUM CLOTHING CARE</span>
            <h2>Give Your Clothes the Care They Deserve.</h2>
            <p>
              Professional dry cleaning, steam press, charak and rafu
              services with trusted local care.
            </p>
          </div>

          <Link to="/services/dry-cleaning" className="kd-cta-btn">
            Explore Services
            <FaArrowRight />
          </Link>
        </div>
      </div>

      {/* ================= MAIN FOOTER ================= */}
      <div className="kd-footer-main">

        <div className="kd-footer-grid">

          {/* ================= BRAND ================= */}
          <div className="kd-footer-brand">

            <div className="kd-brand-logo">
              <div className="kd-logo-icon">
                <FaTshirt />
              </div>

              <div>
                <h3>KRISHNA</h3>
                <span>DRY CLEANING</span>
              </div>
            </div>

            <p className="kd-brand-description">
              Premium care for your clothes. We provide professional
              garment cleaning and clothing care services with attention
              to quality and detail.
            </p>

            <div className="kd-trust-box">
              <div className="kd-trust-icon">
                ✓
              </div>

              <div>
                <strong>Professional Garment Care</strong>
                <span>Clean • Fresh • Carefully Handled</span>
              </div>
            </div>

            {/* SOCIAL ICONS */}
            <div className="kd-socials">
              <a href="#" aria-label="Facebook">
                <FaFacebookF />
              </a>

              <a href="#" aria-label="Instagram">
                <FaInstagram />
              </a>

              <a href="#" aria-label="Twitter">
                <FaTwitter />
              </a>

              <a
                href="https://wa.me/919910655308"
                target="_blank"
                rel="noreferrer"
                className="kd-whatsapp-social"
                aria-label="WhatsApp"
              >
                <FaWhatsapp />
              </a>
            </div>

          </div>

          {/* ================= QUICK LINKS ================= */}
          <div className="kd-footer-column">

            <h4>Quick Links</h4>

            <div className="kd-footer-line"></div>

            <ul>
              <li>
                <Link to="/">
                  <FaChevronRight />
                  Home
                </Link>
              </li>

              <li>
                <Link to="/admin">
                  <FaChevronRight />
                  ADMIN
                </Link>
              </li>

              <li>
                <Link to="/services/dry-cleaning">
                  <FaChevronRight />
                  Services
                </Link>
              </li>

              <li>
                <Link to="/rates">
                  <FaChevronRight />
                  Rate List
                </Link>
              </li>

              <li>
                <Link to="/">
                  <FaChevronRight />
                  Contact Us
                </Link>
              </li>
            </ul>

          </div>

          {/* ================= SERVICES ================= */}
          <div className="kd-footer-column">

            <h4>Our Services</h4>

            <div className="kd-footer-line"></div>

            <ul>
              <li>
                <Link to="/services/dry-cleaning">
                  <FaChevronRight />
                  Dry Cleaning
                </Link>
              </li>

              <li>
                <Link to="/services/steam-press">
                  <FaChevronRight />
                  Steam Press
                </Link>
              </li>

              <li>
                <Link to="/services/charak">
                  <FaChevronRight />
                  Charak
                </Link>
              </li>

              <li>
                <Link to="/services/rafu">
                  <FaChevronRight />
                  Rafu
                </Link>
              </li>
            </ul>

            {/* TIMING */}
            <div className="kd-opening">

              <div className="kd-opening-icon">
                <FaClock />
              </div>

              <div>
                <strong>Opening Hours</strong>
                <span>Mon - Sun</span>
                <b>9:00 AM - 9:00 PM</b>
              </div>

            </div>

          </div>

          {/* ================= CONTACT + MAP ================= */}
          <div className="kd-footer-contact">

            <h4>Visit Our Shop</h4>

            <div className="kd-footer-line"></div>

            <div className="kd-contact-item">

              <div className="kd-contact-icon">
                <FaMapMarkerAlt />
              </div>

              <div>
                <strong>Our Address</strong>

                <p>
                  Gali No 19, Rajapuri,
                  <br />
                  Uttam Nagar, Delhi
                </p>
              </div>

            </div>

            <div className="kd-contact-item">

              <div className="kd-contact-icon">
                <FaPhoneAlt />
              </div>

              <div>
                <strong>Call Us</strong>

                <a href="tel:+9910655308">
                  +91 9910655308
                </a>
              </div>

            </div>

            <div className="kd-contact-item">

              <div className="kd-contact-icon">
                <FaEnvelope />
              </div>

              <div>
                <strong>Email Us</strong>

                <a href="">
                  info@krishnadrycleaning.com
                </a>
              </div>

            </div>

            {/* MAP */}
            <div className="kd-map-wrapper">

              <iframe
                title="Krishna Dry Cleaning Location"
                src="https://www.google.com/maps/place/Krishna+dry+cleaners/@28.6057631,77.0500334,15z/data=!4m6!3m5!1s0x390d1b2b20005683:0x75df0584b0000000!8m2!3d28.6063112!4d77.0589786!16s%2Fg%2F11rdx37xvt?hl=en-US&entry=ttu&g_ep=EgoyMDI2MDkyMy4wIKXMDSoASAFQAw%3D%3D"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>

              <a
                href="https://www.google.com/maps/place/Krishna+dry+cleaners/@28.6057631,77.0500334,15z/data=!4m6!3m5!1s0x390d1b2b20005683:0x75df0584b0000000!8m2!3d28.6063112!4d77.0589786!16s%2Fg%2F11rdx37xvt?hl=en-US&entry=ttu&g_ep=EgoyMDI2MDkyMy4wIKXMDSoASAFQAw%3D%3D"
                target="kridshna drycleaner"
                rel="noreferrer"
                className="kd-map-btn"
              >
                <FaMapMarkerAlt />
                Get Directions
              </a>

            </div>

          </div>

        </div>

      </div>

      {/* ================= BOTTOM BAR ================= */}
      <div className="kd-footer-bottom">

        <div className="kd-footer-bottom-inner">

          <p>
            © {new Date().getFullYear()}{" "}
            <strong>Krishna Dry Cleaning</strong>.
            All Rights Reserved.
          </p>

          <div className="kd-bottom-links">

            <Link to="/privacy-policy">
              Privacy Policy
            </Link>

            <span>|</span>

            <Link to="/terms">
              Terms & Conditions
            </Link>

          </div>

        </div>

      </div>

    </footer>
  );
}