import "../css/charak.css";

function Charak() {
  const phoneNumber = "9910655308";

  return (
    <div className="charak-page">

      {/* ================= HERO ================= */}

      <section className="charak-hero">

        {/* BACKGROUND IMAGE */}
        <img
          className="charak-bg-image"
          src="https://images.unsplash.com/photo-1609748513078-9ff6232781c5?auto=format&fit=crop&w=2000&q=90"
          alt="Premium Saree"
        />

        {/* DARK OVERLAY */}
        <div className="charak-overlay"></div>

        {/* CONTENT */}
        <div className="charak-container">

          <div className="charak-content">

            {/* BADGE */}
            <div className="charak-badge">
              <span>✿</span>
              PREMIUM SAREE CARE
            </div>

            {/* TITLE */}
            <h1>
              Perfect Charak
              <br />
              <span>For Your Saree</span>
            </h1>

            {/* LINE */}
            <div className="charak-line">
              <span>✦</span>
            </div>

            {/* DESCRIPTION */}
            <p className="charak-description">
              Professional saree charak service designed
              to give your saree a beautiful fit,
              elegant fall and perfect finish.
            </p>

            {/* BUTTONS */}
            <div className="charak-buttons">

              {/* CALL */}
              <a
                href={`tel:+${phoneNumber}`}
                className="charak-call-btn"
              >
                <span className="btn-icon">☎</span>

                <span>Call Now</span>

                <span className="btn-arrow">
                  →
                </span>
              </a>

              {/* WHATSAPP */}
              <a
                href={`https://wa.me/${phoneNumber}`}
                target="_blank"
                rel="noreferrer"
                className="charak-whatsapp-btn"
              >
                <span className="whatsapp-icon">
                  ◉
                </span>

                <span>WhatsApp Us</span>
              </a>

            </div>

            {/* TRUST ITEMS */}
            <div className="charak-trust">

              <div className="trust-item">
                <strong>01</strong>
                <span>Expert Tailoring</span>
              </div>

              <div className="trust-divider"></div>

              <div className="trust-item">
                <strong>02</strong>
                <span>Perfect Finish</span>
              </div>

              <div className="trust-divider"></div>

              <div className="trust-item">
                <strong>03</strong>
                <span>Premium Care</span>
              </div>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Charak;