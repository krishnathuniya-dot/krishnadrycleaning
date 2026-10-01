import { useMemo } from "react";
import "../css/work.css";
import HomeUserRateList from "../pages/HomeUserRateList";

// =====================================================
// PROCESS STEPS
// =====================================================
const STEPS = [
  { no: "01", title: "Dirty Clothes",         image: "/work_steps/step-03.jpg" },
  { no: "02", title: "Easy Pickup",           image: "/work_steps/step-08.jpg" },
  { no: "03", title: "Inspection by Experts", image: "/work_steps/step-03.jpg" },
  { no: "04", title: "Dry Spotting",          image: "/work_steps/step-04.jpg" },
  { no: "05", title: "Pre-Processing",        image: "/work_steps/pre.jpg" },
  { no: "06", title: "Professional Cleaning", image: "/work_steps/step-02.jpg" },
  { no: "07", title: "Quality Check",         image: "/work_steps/step-01.jpg" },
  { no: "08", title: "Steam Press & Finishing", image: "/work_steps/step-06.jpg" },
  { no: "09", title: "Delivery",              image: "/work_steps/delivery.jpg" },
  { no: "10", title: "Happy Customer",        image: "/work_steps/happy.jpg" },
];

function Work() {
  // Duplicate for seamless infinite scroll
  const sliderSteps = useMemo(() => [...STEPS, ...STEPS], []);

  return (
    <>
      <section className="krishna-process" aria-label="Our process">

        {/* =================================================
            HEADING
        ================================================= */}
        <div className="process-heading">
          <span className="process-tag">KRISHNA DRY CLEANING</span>

          <h2>
            Our <strong>10-Step</strong> Formula for
            <br />
            <span>Exceptional Garment Cleaning</span>
          </h2>

          <p>
            From pickup to final delivery, we treat every garment with
            professional care, advanced cleaning, and premium finishing.
          </p>
        </div>

        {/* =================================================
            AUTO SLIDER
        ================================================= */}
        <div className="process-wrapper">
          <div className="process-track">
            {sliderSteps.map((step, index) => (
              <article className="process-card" key={`${step.no}-${index}`}>
                <div className="card-image">
                  <img
                    src={step.image}
                    alt={`Step ${step.no}: ${step.title}`}
                    loading="lazy"
                  />
                  <div className="image-overlay"></div>
                  <span className="image-step">STEP {step.no}</span>
                </div>

                <div className="card-content">
                  <span className="step-number">{step.no}</span>
                  <h3>{step.title}</h3>
                  <span className="krishna-line"></span>
                  <span className="brand-text">KRISHNA DRY CLEANING</span>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* =================================================
            DECORATIVE BOTTOM LINE
        ================================================= */}
        <div className="process-bottom">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </section>

      {/* Rate list ko section ke bahar rakha — clean separation */}
      <HomeUserRateList />
    </>
  );
}

export default Work;