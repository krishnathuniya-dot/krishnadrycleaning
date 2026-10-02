import "../css/Steam.css";

function Steampress() {
  const phoneNumber = "919910655308";

  const callNow = () => {
    window.location.href = `tel:+${phoneNumber}`;
  };

  return (
    <div className="steam-page">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="steam-hero">

        <img
          className="steam-hero-image"
          src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=2200&q=90"
          alt="Professional garment care"
        />

        <div className="steam-hero-dark"></div>

        <div className="steam-container">

          <div className="steam-hero-content">

            <div className="steam-eyebrow">
              <span></span>
              PREMIUM GARMENT CARE
            </div>

            <h1>
              Perfectly Pressed.
              <br />
              <em>Professionally Finished.</em>
            </h1>

            <p>
              Give your clothes the premium finish they deserve.
              Our professional steam press service delivers
              smooth fabrics, sharp creases and a fresh
              ready-to-wear look.
            </p>

            <div className="steam-hero-actions">

              <button
                className="steam-call-btn"
                onClick={callNow}
              >
                <span className="action-icon">☎</span>
                <span>
                  <small>Speak with us</small>
                  Call Now
                </span>
                <b>→</b>
              </button>

              <a
                href={`https://wa.me/${phoneNumber}`}
                target="_blank"
                rel="noreferrer"
                className="steam-whatsapp-btn"
              >
                <span className="action-icon">◉</span>
                <span>
                  <small>Quick response</small>
                  WhatsApp Us
                </span>
                <b>→</b>
              </a>

            </div>

            <div className="steam-hero-info">

              <div>
                <strong>01</strong>
                <span>Fabric Care</span>
              </div>

              <div>
                <strong>02</strong>
                <span>Steam Finish</span>
              </div>

              <div>
                <strong>03</strong>
                <span>Quality Checked</span>
              </div>

            </div>

          </div>

        </div>

        <div className="steam-scroll">
          <span>SCROLL TO EXPLORE</span>
          <i>↓</i>
        </div>

      </section>


      {/* =====================================================
          INTRO
      ===================================================== */}

      <section className="steam-intro">

        <div className="steam-container">

          <div className="steam-intro-grid">

            <div className="steam-intro-images">

              <div className="steam-image-main">
                <img
                  src="https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=1000&q=90"
                  alt="Freshly pressed clothes"
                />
              </div>

              <div className="steam-image-small">
                <img
                  src="https://images.unsplash.com/photo-1583845112203-454c9e7e7f0f?auto=format&fit=crop&w=700&q=90"
                  alt="Professional clothing care"
                />
              </div>

              <div className="steam-image-badge">
                <strong>10+</strong>
                <span>Years of<br />Care</span>
              </div>

            </div>


            <div className="steam-intro-content">

              <span className="steam-section-label">
                THE ART OF A PERFECT FINISH
              </span>

              <h2>
                Your clothes deserve
                <br />
                <span>better care.</span>
              </h2>

              <p>
                A professionally pressed outfit does more than
                remove wrinkles. It brings out the shape,
                structure and character of every garment.
              </p>

              <p>
                From formal shirts and trousers to dresses,
                uniforms and occasion wear, we carefully handle
                each garment for a refined and polished result.
              </p>

              <div className="steam-check-list">

                <div>
                  <span>✓</span>
                  <p>
                    <strong>Fabric-conscious pressing</strong>
                    Careful treatment according to garment type.
                  </p>
                </div>

                <div>
                  <span>✓</span>
                  <p>
                    <strong>Professional steam treatment</strong>
                    Helps relax wrinkles and refresh fabrics.
                  </p>
                </div>

                <div>
                  <span>✓</span>
                  <p>
                    <strong>Quality checked finish</strong>
                    Every garment receives a final inspection.
                  </p>
                </div>

              </div>

              <a
                href={`https://wa.me/${phoneNumber}?text=Hello%2C%20I%20want%20to%20know%20about%20your%20Steam%20Press%20service.`}
                target="_blank"
                rel="noreferrer"
                className="steam-text-link"
              >
                Talk to our team
                <span>→</span>
              </a>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          STATS
      ===================================================== */}

      <section className="steam-stats">

        <div className="steam-container">

          <div className="steam-stats-grid">

            <div className="steam-stat">
              <strong>100%</strong>
              <span>Attention to Detail</span>
            </div>

            <div className="steam-stat">
              <strong>04</strong>
              <span>Quality Steps</span>
            </div>

            <div className="steam-stat">
              <strong>01</strong>
              <span>Professional Finish</span>
            </div>

            <div className="steam-stat">
              <strong>∞</strong>
              <span>Care for Your Wardrobe</span>
            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          BENEFITS
      ===================================================== */}

      <section className="steam-benefits">

        <div className="steam-container">

          <div className="steam-heading">

            <span className="steam-section-label">
              WHY STEAM PRESS
            </span>

            <h2>
              The difference is
              <br />
              <span>in the finish.</span>
            </h2>

            <p>
              Professional pressing gives your everyday wardrobe
              a cleaner, sharper and more sophisticated appearance.
            </p>

          </div>


          <div className="steam-benefit-grid">

            <div className="steam-benefit-card">

              <div className="benefit-top">
                <span>01</span>
                <b>💨</b>
              </div>

              <h3>Gentle Steam</h3>

              <p>
                Carefully applied steam helps relax fabric fibres
                and reduce unwanted wrinkles.
              </p>

              <div className="benefit-line"></div>

            </div>


            <div className="steam-benefit-card">

              <div className="benefit-top">
                <span>02</span>
                <b>✦</b>
              </div>

              <h3>Crisp Finish</h3>

              <p>
                Sharp, neat and professionally pressed garments
                that look ready for any occasion.
              </p>

              <div className="benefit-line"></div>

            </div>


            <div className="steam-benefit-card">

              <div className="benefit-top">
                <span>03</span>
                <b>◇</b>
              </div>

              <h3>Fresh Appearance</h3>

              <p>
                Refresh your clothes and give your wardrobe
                a clean and polished appearance.
              </p>

              <div className="benefit-line"></div>

            </div>


            <div className="steam-benefit-card">

              <div className="benefit-top">
                <span>04</span>
                <b>✓</b>
              </div>

              <h3>Quality Checked</h3>

              <p>
                Every garment is inspected after pressing
                before it is ready for you.
              </p>

              <div className="benefit-line"></div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          FEATURE IMAGE SECTION
      ===================================================== */}

      <section className="steam-feature">

        <div className="steam-container">

          <div className="steam-feature-box">

            <div className="steam-feature-image">

              <img
                src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=90"
                alt="Premium clothing"
              />

            </div>

            <div className="steam-feature-content">

              <span className="steam-section-label">
                PREMIUM CLOTHING CARE
              </span>

              <h2>
                Because first
                <br />
                impressions matter.
              </h2>

              <p>
                Whether you're preparing for work, a meeting,
                an event or simply want to look your best,
                professionally pressed clothes make the
                difference.
              </p>

              <div className="steam-feature-points">

                <span>✓ Shirts & Trousers</span>
                <span>✓ Dresses & Sarees</span>
                <span>✓ Uniforms</span>
                <span>✓ Occasion Wear</span>

              </div>

              <a
                href={`tel:+${phoneNumber}`}
                className="steam-outline-btn"
              >
                Call for Service
                <span>→</span>
              </a>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          PROCESS
      ===================================================== */}

      <section className="steam-process">

        <div className="steam-container">

          <div className="steam-heading center">

            <span className="steam-section-label">
              OUR PROCESS
            </span>

            <h2>
              From garment to
              <br />
              <span>perfect finish.</span>
            </h2>

          </div>


          <div className="steam-process-grid">

            <div className="steam-process-card">

              <span className="process-number">01</span>

              <div className="process-icon">
                ◇
              </div>

              <h3>Inspect</h3>

              <p>
                We carefully examine the garment,
                fabric and pressing requirements.
              </p>

            </div>


            <div className="steam-process-card">

              <span className="process-number">02</span>

              <div className="process-icon">
                ≋
              </div>

              <h3>Steam</h3>

              <p>
                Controlled steam treatment helps
                relax fibres and remove wrinkles.
              </p>

            </div>


            <div className="steam-process-card">

              <span className="process-number">03</span>

              <div className="process-icon">
                ✦
              </div>

              <h3>Press</h3>

              <p>
                Garments are professionally pressed
                for a smooth and structured finish.
              </p>

            </div>


            <div className="steam-process-card">

              <span className="process-number">04</span>

              <div className="process-icon">
                ✓
              </div>

              <h3>Check</h3>

              <p>
                A final quality check ensures your
                clothes are ready to wear.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className="steam-final">

        <img
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=2200&q=90"
          alt="Professional garment service"
        />

        <div className="steam-final-overlay"></div>

        <div className="steam-container">

          <div className="steam-final-content">

            <span>
              PREMIUM GARMENT CARE
            </span>

            <h2>
              Look sharp.
              <br />
              <em>Feel confident.</em>
            </h2>

            <p>
              Give your favourite clothes the professional
              finish they deserve.
            </p>

            <div className="steam-final-buttons">

              <a
                href={`tel:+${phoneNumber}`}
                className="steam-final-call"
              >
                ☎ &nbsp; Call Now
              </a>

              <a
                href={`https://wa.me/${phoneNumber}?text=Hello%2C%20I%20want%20to%20book%20your%20Steam%20Press%20service.`}
                target="_blank"
                rel="noreferrer"
                className="steam-final-whatsapp"
              >
                ◉ &nbsp; WhatsApp Us
              </a>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Steampress;