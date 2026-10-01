import "../css/servicesslider.css";
import Work from "./Work";

const servicesData = [
  {
    title: "Coat Dry Cleaning",
    desc: "Expert care for formal wear.",
    img: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Carpet Cleaning",
    desc: "Deep cleaning for fresh carpets.",
    img: "https://tse4.mm.bing.net/th/id/OIP.JYTbeO8qklhVkWUTzOBlnAHaDt?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
  },
  {
    title: "Lehenga Care",
    desc: "Delicate care for heavy ethnic wear.",
    img: "https://spotlesswasche.com/wp-content/uploads/2021/06/saree.jpg",
  },
  {
    title: "Blanket Wash",
    desc: "Soft & hygienic wash for quilts.",
    img: "https://transform.octanecdn.com/crop/3200x1800/https://octanecdn.com/cleanenginesites/Blankets-scaled.jpeg",
  },
  {
    title: "Curtain Steam",
    desc: "Professional steam for curtains.",
    img: "https://th.bing.com/th/id/R.b0648e4c3451bdfd34bd5540028a6ac4?rik=c8NFjvRGb%2bmDpw&riu=http%3a%2f%2fwww.stevewilliamskitchens.co.uk%2fwp-content%2fuploads%2f2016%2f09%2f15-Nice-modern-living-room-curtains-ideas-living-room-modern-living-room-curtain-designs-with-grey-metal.jpg&ehk=GXmf1rboPQ52l%2b%2fXT5pSwgryP118HY%2bNld9xdpmVV7U%3d&risl=&pid=ImgRaw&r=0",
  },
];

function ServicesSlider() {
  return (
    <>
      <section className="services-section" aria-label="Our services">

        <h2 className="services-main-title">
          Our <span className="highlight">Services</span>
        </h2>

        <div className="slider-container">
          <div className="slider-track-continuous">

            {[...servicesData, ...servicesData].map((service, index) => (
              <article className="service-card" key={`${service.title}-${index}`}>

                <img
                  src={service.img}
                  alt={service.title}
                  loading="lazy"
                />

                <div className="service-card-overlay"></div>

                <div className="card-text">
                  <h3>{service.title}</h3>
                  <p>{service.desc}</p>
                </div>

              </article>
            ))}

          </div>
        </div>

      </section>

      {/* Work section — HomeUserRateList already iske andar hai */}
      <Work />
    </>
  );
}

export default ServicesSlider;