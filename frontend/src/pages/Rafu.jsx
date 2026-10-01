import "../css/Rafu.css";

function Rafu() {
  const phoneNumber = "919876543210";

  return (
    <div className="rafu-page">

      {/* ================= HERO ================= */}

      <section className="rafu-hero">

        {/* BACKGROUND IMAGE */}
        <img
          className="rafu-bg-image"
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=2000&q=90"
          alt="Professional Rafu and clothing repair"
        />

        {/* DARK OVERLAY */}
        <div className="rafu-overlay"></div>

        {/* CONTENT */}
        <div className="rafu-container">

          <div className="rafu-content">

            {/* BADGE */}
            <div className="rafu-badge">
              <span>✦</span>
              EXPERT CLOTHING REPAIR
            </div>

            {/* TITLE */}
            <h1>
              Expert Rafu
              <br />
              <span>Care For Your Clothes</span>
            </h1>

            {/* DECORATIVE LINE */}
            <div className="rafu-line">
              <span>✦</span>
            </div>

            {/* DESCRIPTION */}
            <p className="rafu-description">
              Restore your favourite clothes with
              precise Rafu stitching, careful repair
              and a clean professional finish.
            </p>

            {/* BUTTONS */}
            <div className="rafu-buttons">

              {/* CALL */}
              <a
                href={`tel:+${phoneNumber}`}
                className="rafu-call-btn"
              >
                <span className="rafu-phone-icon">
                  ☎
                </span>

                <span>Call Now</span>

                <span className="rafu-arrow">
                  →
                </span>
              </a>

              {/* WHATSAPP */}
              <a
                href={`https://wa.me/${phoneNumber}`}
                target="_blank"
                rel="noreferrer"
                className="rafu-whatsapp-btn"
              >
                <span className="rafu-whatsapp-icon">
                  ◉
                </span>

                <span>WhatsApp Us</span>
              </a>

            </div>

            {/* TRUST */}
            <div className="rafu-trust">

              <div className="rafu-trust-item">
                <strong>01</strong>
                <span>Fine Stitching</span>
              </div>

              <div className="rafu-trust-divider"></div>

              <div className="rafu-trust-item">
                <strong>02</strong>
                <span>Expert Repair</span>
              </div>

              <div className="rafu-trust-divider"></div>

              <div className="rafu-trust-item">
                <strong>03</strong>
                <span>Clean Finish</span>
              </div>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Rafu;