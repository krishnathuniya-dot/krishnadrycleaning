import React, { useMemo, useState } from "react";
import "../css/Help.css";

const Help = () => {
  const [language, setLanguage] = useState("en");
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  const content = {
    en: {
      badge: "HELP CENTER",
      title: "How can we help you?",
      subtitle:
        "Find quick answers, guides and support for managing your admin panel.",
      searchPlaceholder: "Search for help, questions or topics...",
      languageButton: "हिंदी",

      popularTitle: "Popular Topics",
      popularSubtitle:
        "Get quick help with the most commonly used admin features.",

      topics: [
        {
          icon: "🚀",
          title: "Getting Started",
          description:
            "Learn the basics of the admin panel and understand how everything works.",
        },
        {
          icon: "📦",
          title: "Orders",
          description:
            "Manage customer orders, update order status and track order progress.",
        },
        {
          icon: "👥",
          title: "Customers",
          description:
            "View customer information, search customers and manage customer accounts.",
        },
        {
          icon: "⭐",
          title: "Reviews",
          description:
            "Manage customer reviews, ratings and monitor feedback.",
        },
        {
          icon: "🔔",
          title: "Notifications",
          description:
            "Check important notifications and keep track of recent activities.",
        },
        {
          icon: "🔐",
          title: "Security",
          description:
            "Manage account security, login activity and connected devices.",
        },
      ],

      faqTitle: "Frequently Asked Questions",
      faqSubtitle:
        "Find answers to common questions about your admin panel.",

      faqs: [
        {
          question: "How can I update an order status?",
          answer:
            "Open the Orders section from the admin panel. Select the order you want to manage and update its status from the available options.",
        },
        {
          question: "How can I manage customers?",
          answer:
            "Go to the Customers section to view customer details, search customers, check their information and manage customer accounts.",
        },
        {
          question: "Where can I see login activity?",
          answer:
            "You can check login activity from the Security or Login Activity section. It can show recent login information and device activity.",
        },
        {
          question: "How can I manage customer reviews?",
          answer:
            "Open the Reviews section to view customer feedback, ratings and manage reviews according to your admin permissions.",
        },
        {
          question: "Where can I find notifications?",
          answer:
            "Click the notification icon or open the Notifications section from the admin panel to view recent alerts and activities.",
        },
        {
          question: "How can I keep my admin account secure?",
          answer:
            "Use a strong password, review login activity regularly and log out from devices that you do not recognize.",
        },
      ],

      supportTitle: "Still Need Help?",
      supportSubtitle:
        "Our support team is here to help you with any issue or question.",
      emailSupport: "Email Support",
      phoneSupport: "Phone Support",
      whatsappSupport: "WhatsApp Support",
      emailText: "Get help through email",
      phoneText: "Talk to our support team",
      whatsappText: "Chat with our support team",

      footer:
        "We're here to help you manage your admin panel easily and securely.",
    },

    hi: {
      badge: "सहायता केंद्र",
      title: "हम आपकी कैसे मदद कर सकते हैं?",
      subtitle:
        "अपने एडमिन पैनल को मैनेज करने के लिए तुरंत जवाब, गाइड और सहायता प्राप्त करें।",
      searchPlaceholder: "सहायता, सवाल या विषय खोजें...",
      languageButton: "English",

      popularTitle: "लोकप्रिय विषय",
      popularSubtitle:
        "एडमिन पैनल के सबसे ज्यादा इस्तेमाल होने वाले फीचर्स की जल्दी सहायता प्राप्त करें।",

      topics: [
        {
          icon: "🚀",
          title: "शुरुआत कैसे करें",
          description:
            "एडमिन पैनल की बेसिक जानकारी जानें और समझें कि सभी फीचर्स कैसे काम करते हैं।",
        },
        {
          icon: "📦",
          title: "ऑर्डर्स",
          description:
            "कस्टमर ऑर्डर्स मैनेज करें, ऑर्डर स्टेटस अपडेट करें और ऑर्डर की प्रोग्रेस देखें।",
        },
        {
          icon: "👥",
          title: "ग्राहक",
          description:
            "ग्राहकों की जानकारी देखें, ग्राहक खोजें और उनके अकाउंट मैनेज करें।",
        },
        {
          icon: "⭐",
          title: "रिव्यू",
          description:
            "कस्टमर रिव्यू, रेटिंग और फीडबैक को मैनेज करें।",
        },
        {
          icon: "🔔",
          title: "सूचनाएं",
          description:
            "महत्वपूर्ण notifications देखें और हाल की activities पर नजर रखें।",
        },
        {
          icon: "🔐",
          title: "सुरक्षा",
          description:
            "अकाउंट सिक्योरिटी, login activity और connected devices को मैनेज करें।",
        },
      ],

      faqTitle: "अक्सर पूछे जाने वाले सवाल",
      faqSubtitle:
        "अपने एडमिन पैनल से जुड़े सामान्य सवालों के जवाब यहां पाएं।",

      faqs: [
        {
          question: "मैं ऑर्डर का स्टेटस कैसे अपडेट कर सकता हूं?",
          answer:
            "एडमिन पैनल में Orders section खोलें। जिस ऑर्डर को मैनेज करना है उसे चुनें और उपलब्ध options में से उसका status अपडेट करें।",
        },
        {
          question: "मैं ग्राहकों को कैसे मैनेज कर सकता हूं?",
          answer:
            "Customers section में जाकर ग्राहक की जानकारी देखें, ग्राहक को search करें और customer account को manage करें।",
        },
        {
          question: "मैं Login Activity कहां देख सकता हूं?",
          answer:
            "Security या Login Activity section में जाकर हाल की login information और device activity देख सकते हैं।",
        },
        {
          question: "मैं customer reviews कैसे manage कर सकता हूं?",
          answer:
            "Reviews section खोलकर customer feedback, ratings और reviews को देख और manage कर सकते हैं।",
        },
        {
          question: "Notifications कहां मिलेंगी?",
          answer:
            "Admin panel के notification icon पर क्लिक करें या Notifications section खोलकर recent alerts और activities देखें।",
        },
        {
          question: "मैं अपना admin account सुरक्षित कैसे रख सकता हूं?",
          answer:
            "एक मजबूत password इस्तेमाल करें, login activity को समय-समय पर check करें और अनजान devices से logout करें।",
        },
      ],

      supportTitle: "अभी भी मदद चाहिए?",
      supportSubtitle:
        "हमारी support team किसी भी समस्या या सवाल में आपकी सहायता करने के लिए तैयार है।",
      emailSupport: "ईमेल सहायता",
      phoneSupport: "फोन सहायता",
      whatsappSupport: "WhatsApp सहायता",
      emailText: "ईमेल के जरिए सहायता प्राप्त करें",
      phoneText: "हमारी support team से बात करें",
      whatsappText: "हमारी support team से चैट करें",

      footer:
        "हम आपके एडमिन पैनल को आसानी और सुरक्षित तरीके से मैनेज करने में आपकी सहायता के लिए हमेशा तैयार हैं।",
    },
  };

  const t = content[language];

  const filteredTopics = useMemo(() => {
    if (!search.trim()) {
      return t.topics;
    }

    return t.topics.filter((topic) => {
      const text = `${topic.title} ${topic.description}`.toLowerCase();
      return text.includes(search.toLowerCase());
    });
  }, [search, language, t.topics]);

  const filteredFaqs = useMemo(() => {
    if (!search.trim()) {
      return t.faqs;
    }

    return t.faqs.filter((faq) => {
      const text = `${faq.question} ${faq.answer}`.toLowerCase();
      return text.includes(search.toLowerCase());
    });
  }, [search, language, t.faqs]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "hi" : "en"));
    setOpenFaq(null);
    setSearch("");
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="help-page">

      {/* ================= HEADER ================= */}

      <div className="help-header">

        <div className="help-header-left">
          <div className="help-header-icon">
            ?
          </div>

          <div>
            <div className="help-breadcrumb">
              Admin Panel <span>/</span> Help
            </div>

            <h1>{t.title}</h1>

            <p>{t.subtitle}</p>
          </div>
        </div>

        <button
          type="button"
          className="help-language-btn"
          onClick={toggleLanguage}
        >
          <span>🌐</span>
          {t.languageButton}
        </button>

      </div>

      {/* ================= SEARCH ================= */}

      <div className="help-search-box">

        <div className="help-search-icon">
          🔍
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.searchPlaceholder}
        />

        {search && (
          <button
            type="button"
            className="help-search-clear"
            onClick={() => setSearch("")}
          >
            ×
          </button>
        )}

      </div>

      {/* ================= POPULAR TOPICS ================= */}

      <section className="help-section">

        <div className="help-section-heading">
          <div>
            <span className="help-small-label">
              {t.badge}
            </span>

            <h2>{t.popularTitle}</h2>

            <p>{t.popularSubtitle}</p>
          </div>
        </div>

        {filteredTopics.length > 0 ? (
          <div className="help-topics-grid">

            {filteredTopics.map((topic, index) => (
              <div className="help-topic-card" key={index}>

                <div className="help-topic-icon">
                  {topic.icon}
                </div>

                <div className="help-topic-content">

                  <h3>{topic.title}</h3>

                  <p>{topic.description}</p>

                  <button
                    type="button"
                    className="help-topic-link"
                    onClick={() => {
                      setSearch(topic.title);
                      window.scrollTo({
                        top: document.body.scrollHeight,
                        behavior: "smooth",
                      });
                    }}
                  >
                    {language === "en"
                      ? "Learn More →"
                      : "और जानें →"}
                  </button>

                </div>

              </div>
            ))}

          </div>
        ) : (
          <div className="help-no-result">
            <div>🔎</div>

            <h3>
              {language === "en"
                ? "No topics found"
                : "कोई विषय नहीं मिला"}
            </h3>

            <p>
              {language === "en"
                ? "Try searching with a different keyword."
                : "कृपया कोई दूसरा keyword इस्तेमाल करके देखें।"}
            </p>
          </div>
        )}

      </section>

      {/* ================= FAQ ================= */}

      <section className="help-section">

        <div className="help-section-heading">

          <div>
            <span className="help-small-label">
              FAQ
            </span>

            <h2>{t.faqTitle}</h2>

            <p>{t.faqSubtitle}</p>
          </div>

        </div>

        {filteredFaqs.length > 0 ? (
          <div className="help-faq-list">

            {filteredFaqs.map((faq, index) => {

              const isOpen = openFaq === index;

              return (
                <div
                  className={`help-faq-item ${
                    isOpen ? "open" : ""
                  }`}
                  key={index}
                >

                  <button
                    type="button"
                    className="help-faq-question"
                    onClick={() => toggleFaq(index)}
                  >

                    <span>
                      <span className="help-faq-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      {faq.question}
                    </span>

                    <span className="help-faq-arrow">
                      {isOpen ? "−" : "+"}
                    </span>

                  </button>

                  {isOpen && (
                    <div className="help-faq-answer">
                      {faq.answer}
                    </div>
                  )}

                </div>
              );
            })}

          </div>
        ) : (
          <div className="help-no-result">
            <div>❓</div>

            <h3>
              {language === "en"
                ? "No FAQ found"
                : "कोई FAQ नहीं मिला"}
            </h3>
          </div>
        )}

      </section>

      {/* ================= SUPPORT ================= */}

      <section className="help-support-section">

        <div className="help-support-content">

          <div className="help-support-icon">
            💬
          </div>

          <div>
            <span className="help-small-label">
              SUPPORT
            </span>

            <h2>{t.supportTitle}</h2>

            <p>{t.supportSubtitle}</p>
          </div>

        </div>

        <div className="help-support-grid">

          {/* EMAIL */}

          <a
            href="mailto:support@example.com"
            className="help-support-card"
          >
            <div className="help-support-card-icon">
              📧
            </div>

            <div>
              <h3>{t.emailSupport}</h3>
              <p>{t.emailText}</p>
            </div>

            <span className="help-card-arrow">
              →
            </span>
          </a>

          {/* PHONE */}

          <a
            href="tel:+911234567890"
            className="help-support-card"
          >
            <div className="help-support-card-icon">
              📞
            </div>

            <div>
              <h3>{t.phoneSupport}</h3>
              <p>{t.phoneText}</p>
            </div>

            <span className="help-card-arrow">
              →
            </span>
          </a>

          {/* WHATSAPP */}

          <a
            href="https://wa.me/911234567890"
            target="_blank"
            rel="noreferrer"
            className="help-support-card"
          >
            <div className="help-support-card-icon">
              💬
            </div>

            <div>
              <h3>{t.whatsappSupport}</h3>
              <p>{t.whatsappText}</p>
            </div>

            <span className="help-card-arrow">
              →
            </span>
          </a>

        </div>

      </section>

      {/* ================= FOOTER ================= */}

      <div className="help-footer">

        <div className="help-footer-left">
          <span className="help-footer-logo">
            K
          </span>

          <span>
            {t.footer}
          </span>
        </div>

        <div className="help-footer-language">
          🌐{" "}
          {language === "en"
            ? "English"
            : "हिंदी"}
        </div>

      </div>

    </div>
  );
};

export default Help;