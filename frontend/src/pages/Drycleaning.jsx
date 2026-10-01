
import "../css/dry.css";

function Drycleaning() {
  const phoneNumber = "9910655308";

  const whatsappMessage =
    "Hello Krishna Dry Cleaning, I would like to know more about your Dry Cleaning service.";

  return (
    <div className="service-page">

      {/* =====================================================
          HERO SECTION
      ===================================================== */}

      <section className="premium-service-hero dry-cleaning-hero">

        <div className="premium-hero-image">
          <img
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1800&q=85"
            alt="Professional Dry Cleaning"
          />
        </div>

        <div className="premium-hero-overlay"></div>

        <div className="service-section-container">

          <div className="premium-hero-content">

            <span className="service-badge">
              PREMIUM CLOTHING CARE
            </span>

            <h1>
              Professional
              <br />
              <span>Dry Cleaning</span>
            </h1>

            <p>
              Expert garment care designed to keep your
              clothes fresh, clean, elegant and looking
              their best for longer.
            </p>

            <div className="service-hero-buttons">

              {/* CALL */}

              <a
                href={`tel:+${phoneNumber}`}
                className="service-primary-btn call-btn"
              >
                <span className="button-icon">☎</span>
                Call Now
                <span className="button-arrow">→</span>
              </a>

              {/* WHATSAPP */}

              <a
                href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(
                  whatsappMessage
                )}`}
                target="_blank"
                rel="noreferrer"
                className="service-whatsapp-btn"
              >
                <span>💬</span>
                WhatsApp Us
              </a>

            </div>

            <div className="hero-trust-row">

              <div className="hero-trust-item">
                <strong>10+</strong>
                <span>Years Experience</span>
              </div>

              <div className="hero-trust-item">
                <strong>10K+</strong>
                <span>Happy Customers</span>
              </div>

              <div className="hero-trust-item">
                <strong>100%</strong>
                <span>Care & Quality</span>
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          INTRODUCTION
      ===================================================== */}

      <section className="premium-intro-section">

        <div className="service-section-container">

          <div className="premium-intro-grid">

            {/* IMAGE */}

            <div className="premium-intro-image">

              <img
                src="https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=1000&q=85"
                alt="Clean clothes"
              />

              <div className="image-floating-card">

                <span className="floating-icon">
                  ✨
                </span>

                <div>
                  <strong>
                    Premium Care
                  </strong>

                  <small>
                    For every garment
                  </small>
                </div>

              </div>

            </div>


            {/* CONTENT */}

            <div className="premium-intro-content">

              <span className="section-label">
                WHY DRY CLEANING?
              </span>

              <h2>
                Care that makes
                <span> every garment feel new.</span>
              </h2>

              <p>
                Some clothes need more than ordinary
                washing. Our professional dry cleaning
                service is designed to care for your
                favourite garments while maintaining
                their colour, texture and finish.
              </p>

              <p>
                From formal suits and elegant dresses
                to delicate fabrics and special occasion
                wear, every garment receives individual
                attention.
              </p>


              <div className="intro-points">

                <div className="intro-point">
                  <span>✓</span>
                  <div>
                    <strong>Expert Fabric Care</strong>
                    <p>
                      Suitable cleaning for different
                      types of fabrics.
                    </p>
                  </div>
                </div>

                <div className="intro-point">
                  <span>✓</span>
                  <div>
                    <strong>Professional Finish</strong>
                    <p>
                      Fresh, clean and ready-to-wear
                      garments.
                    </p>
                  </div>
                </div>

                <div className="intro-point">
                  <span>✓</span>
                  <div>
                    <strong>Quality Checked</strong>
                    <p>
                      Every garment receives a final
                      quality inspection.
                    </p>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          GARMENT TYPES
      ===================================================== */}

      <section className="garment-section">

        <div className="service-section-container">

          <div className="service-heading">

            <span className="section-label">
              WHAT WE CLEAN
            </span>

            <h2>
              Professional care for
              <span> every wardrobe.</span>
            </h2>

            <p>
              We carefully handle a wide range of
              everyday, formal and premium garments.
            </p>

          </div>


          <div className="garment-grid">

            {/* SUITS */}

            <div className="garment-card">

              <div className="garment-image">

                <img
                  src="https://images.unsplash.com/photo-1598808503746-f34c53b9323e?auto=format&fit=crop&w=900&q=85"
                  alt="Suits"
                />

                <span className="garment-number">
                  01
                </span>

              </div>

              <div className="garment-content">

                <span>FORMAL WEAR</span>

                <h3>
                  Suits & Blazers
                </h3>

                <p>
                  Professional cleaning and finishing
                  for your formal wardrobe.
                </p>

              </div>

            </div>


            {/* DRESSES */}

            <div className="garment-card">

              <div className="garment-image">

                <img
                  src="https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=85"
                  alt="Dresses"
                />

                <span className="garment-number">
                  02
                </span>

              </div>

              <div className="garment-content">

                <span>OCCASION WEAR</span>

                <h3>
                  Dresses & Gowns
                </h3>

                <p>
                  Gentle care for elegant dresses,
                  gowns and special occasion wear.
                </p>

              </div>

            </div>


            {/* SHIRTS */}

            <div className="garment-card">

              <div className="garment-image">

                <img
                  src="https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=85"
                  alt="Shirts"
                />

                <span className="garment-number">
                  03
                </span>

              </div>

              <div className="garment-content">

                <span>EVERYDAY WEAR</span>

                <h3>
                  Shirts & Trousers
                </h3>

                <p>
                  Fresh and professional cleaning for
                  your everyday clothing.
                </p>

              </div>

            </div>


            {/* PREMIUM */}

            <div className="garment-card">

              <div className="garment-image">

                <img
                  src="https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=85"
                  alt="Premium clothes"
                />

                <span className="garment-number">
                  04
                </span>

              </div>

              <div className="garment-content">

                <span>PREMIUM FABRICS</span>

                <h3>
                  Delicate Garments
                </h3>

                <p>
                  Special attention for delicate and
                  premium fabrics.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          BENEFITS
      ===================================================== */}

      <section className="service-benefits premium-benefits">

        <div className="service-section-container">

          <div className="service-heading">

            <span className="section-label">
              OUR ADVANTAGES
            </span>

            <h2>
              Why choose Krishna
              <span> Dry Cleaning?</span>
            </h2>

          </div>


          <div className="benefits-grid">

            <div className="benefit-card">

              <div className="benefit-icon">
                ✨
              </div>

              <h3>
                Deep Cleaning
              </h3>

              <p>
                Effective cleaning to remove difficult
                stains, dirt and unwanted odours.
              </p>

            </div>


            <div className="benefit-card">

              <div className="benefit-icon">
                🎨
              </div>

              <h3>
                Colour Protection
              </h3>

              <p>
                Careful cleaning helps maintain the
                original look and colour of your clothes.
              </p>

            </div>


            <div className="benefit-card">

              <div className="benefit-icon">
                🧵
              </div>

              <h3>
                Fabric Safe
              </h3>

              <p>
                Special care for delicate, premium and
                sensitive fabrics.
              </p>

            </div>


            <div className="benefit-card">

              <div className="benefit-icon">
                👔
              </div>

              <h3>
                Professional Finish
              </h3>

              <p>
                Garments are finished carefully for a
                clean, fresh and polished appearance.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          PROCESS
      ===================================================== */}

      <section className="premium-process-section">

        <div className="service-section-container">

          <div className="service-heading">

            <span className="section-label">
              OUR PROCESS
            </span>

            <h2>
              Simple.
              <span> Professional. Reliable.</span>
            </h2>

            <p>
              From inspection to final quality check,
              your clothes are handled with care.
            </p>

          </div>


          <div className="process-grid">

            {/* STEP 1 */}

            <div className="process-card">

              <div className="process-image">

                <img
                  src="https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=800&q=85"
                  alt="Garment inspection"
                />

                <div className="process-number">
                  01
                </div>

              </div>

              <div className="process-card-content">

                <span>
                  STEP 01
                </span>

                <h3>
                  Garment Inspection
                </h3>

                <p>
                  We carefully inspect the garment,
                  fabric type, stains and special
                  care requirements.
                </p>

              </div>

            </div>


            {/* STEP 2 */}

            <div className="process-card">

              <div className="process-image">

                <img
                  src="https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?auto=format&fit=crop&w=800&q=85"
                  alt="Professional cleaning"
                />

                <div className="process-number">
                  02
                </div>

              </div>

              <div className="process-card-content">

                <span>
                  STEP 02
                </span>

                <h3>
                  Professional Cleaning
                </h3>

                <p>
                  Each garment receives suitable
                  professional cleaning based on its
                  fabric and care requirements.
                </p>

              </div>

            </div>


            {/* STEP 3 */}

            <div className="process-card">

              <div className="process-image">

                <img
                  src="https://images.unsplash.com/photo-1598032895397-b9472444bf93?auto=format&fit=crop&w=800&q=85"
                  alt="Clothes finishing"
                />

                <div className="process-number">
                  03
                </div>

              </div>

              <div className="process-card-content">

                <span>
                  STEP 03
                </span>

                <h3>
                  Finishing & Pressing
                </h3>

                <p>
                  Clothes are carefully pressed and
                  finished to give them a fresh,
                  polished appearance.
                </p>

              </div>

            </div>


            {/* STEP 4 */}

            <div className="process-card">

              <div className="process-image">

                <img
                  src="https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=800&q=85"
                  alt="Quality checked clothes"
                />

                <div className="process-number">
                  04
                </div>

              </div>

              <div className="process-card-content">

                <span>
                  STEP 04
                </span>

                <h3>
                  Final Quality Check
                </h3>

                <p>
                  Every garment is checked before
                  it is prepared for you.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          PREMIUM CTA
      ===================================================== */}

      <section className="service-bottom-cta premium-bottom-cta">

        <div className="premium-cta-background">

          <img
            src="https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1800&q=85"
            alt="Premium clothing care"
          />

        </div>

        <div className="premium-cta-overlay"></div>

        <div className="premium-cta-content">

          <span>
            READY TO REFRESH YOUR WARDROBE?
          </span>

          <h2>
            Give your clothes
            <br />
            the care they deserve.
          </h2>

          <p>
            Talk to our team today and discover
            professional garment care.
          </p>


          <div className="premium-cta-buttons">

            <a
              href={`tel:+${phoneNumber}`}
              className="service-primary-btn"
            >
              ☎ Call Now
              <span>→</span>
            </a>


            <a
              href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(
                whatsappMessage
              )}`}
              target="_blank"
              rel="noreferrer"
              className="service-whatsapp-btn"
            >
              💬 WhatsApp Us
            </a>

          </div>

        </div>

      </section>


      {/* =====================================================
          QUICK CONTACT STRIP
      ===================================================== */}

      <section className="quick-contact-section">

        <div className="service-section-container">

          <div className="quick-contact-content">

            <div className="quick-contact-text">

              <span>
                NEED HELP?
              </span>

              <h3>
                Our team is ready to assist you.
              </h3>

              <p>
                Call us or send a WhatsApp message
                for service information.
              </p>

            </div>


            <div className="quick-contact-buttons">

              <a
                href={`tel:+${phoneNumber}`}
                className="quick-call-btn"
              >
                <span>☎</span>
                Call Now
              </a>


              <a
                href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(
                  whatsappMessage
                )}`}
                target="_blank"
                rel="noreferrer"
                className="quick-whatsapp-btn"
              >
                <span>💬</span>
                WhatsApp
              </a>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Drycleaning;

