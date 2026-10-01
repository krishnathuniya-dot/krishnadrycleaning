import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/completeProfile.css";

const API_URL = "https://krishnadrycleaning.onrender.com";

function CompleteProfile() {
  const navigate = useNavigate();

  const [mobile, setMobile] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // =====================================================
  // GUARD — Agar user logged in nahi hai ya mobile already hai
  // =====================================================

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedMobile = localStorage.getItem("mobile");

    if (!token) {
      navigate("/");
      return;
    }

    if (savedMobile && savedMobile.trim() !== "") {
      navigate("/");
    }
  }, [navigate]);

  // =====================================================
  // SAVE MOBILE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    if (!/^[0-9]{10}$/.test(mobile)) {
      setMessage(
        "Please enter a valid 10-digit mobile number."
      );
      setMessageType("error");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(
        `${API_URL}/api/complete-profile`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ mobile }),
        }
      );

      const data = await res.json();
      console.log("Complete Profile Response:", data);

      if (!res.ok || !data.success) {
        setMessage(
          data.message || "Failed to save mobile number"
        );
        setMessageType("error");
        return;
      }

      // Update localStorage
      if (data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );
        localStorage.setItem(
          "mobile",
          data.user.mobile || ""
        );
      }

      setMessage("Mobile number saved successfully!");
      setMessageType("success");

      // Navbar ko update karne ke liye event fire karo
      window.dispatchEvent(
        new CustomEvent("profileUpdated", {
          detail: data.user,
        })
      );

      setTimeout(() => {
        navigate("/");
      }, 1200);
    } catch (err) {
      console.log("Complete Profile Error:", err);
      setMessage(
        "Unable to connect to server. Please try again."
      );
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="complete-profile-page">
      <div className="complete-profile-card">
        {/* BACKGROUND DECORATION */}
        <div className="complete-profile-bg-decor"></div>

        <div className="complete-profile-content">
          {/* LOGO */}
          <div className="complete-profile-logo">K</div>

          {/* HEADER */}
          <div className="complete-profile-header">
            <span className="complete-profile-step">
              STEP 2 OF 2
            </span>

            <h1>One Last Step</h1>

            <p>
              Please enter your mobile number to
              complete your profile. We'll use this for
              order updates and delivery.
            </p>
          </div>

          {/* MESSAGE */}
          {message && (
            <div
              className={
                messageType === "success"
                  ? "auth-message success"
                  : "auth-message error"
              }
            >
              <span>
                {messageType === "success" ? "✓" : "!"}
              </span>
              {message}
            </div>
          )}

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="complete-profile-form"
          >
            <div className="professional-input-group">
              <label>Mobile Number</label>

              <div className="professional-input-wrapper">
                <span className="input-icon">📱</span>
                <span className="country-code">+91</span>

                <input
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  maxLength="10"
                  value={mobile}
                  onChange={(e) => {
                    const value = e.target.value.replace(
                      /\D/g,
                      ""
                    );
                    setMobile(value);
                  }}
                  autoFocus
                  required
                />
              </div>

              <small className="password-hint">
                We'll send order updates on this number.
              </small>
            </div>

            <button
              type="submit"
              className="professional-submit-btn"
              disabled={isLoading || mobile.length !== 10}
            >
              {isLoading ? (
                <span className="loading-content">
                  <span className="spinner"></span>
                  Saving...
                </span>
              ) : (
                <>
                  Save & Continue
                  <span className="submit-arrow">→</span>
                </>
              )}
            </button>
          </form>

          {/* FOOTER */}
          <div className="complete-profile-footer">
            <span>🔒 Your number is safe with us</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompleteProfile;