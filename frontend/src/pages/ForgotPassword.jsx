import { useState } from "react";
import { Link } from "react-router-dom";
import "../css/ForgotPassword.css";

const API_URL = "https://krishnadrycleaning.onrender.com";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!email.trim()) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/forgot-password`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email:
              email.trim().toLowerCase(),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to process request."
        );
      }

      setMessage(
        data.message ||
          "If an account exists with this email, a reset link has been sent."
      );

      setEmail("");

    } catch (err) {

      setError(
        err.message ||
          "Something went wrong."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page">

      <div className="forgot-card">

        <div className="forgot-logo">
          <span>KRISHNA</span>
          <strong>DRY CLEANING</strong>
        </div>

        <div className="forgot-icon">
          🔐
        </div>

        <span className="forgot-eyebrow">
          ACCOUNT SECURITY
        </span>

        <h1>
          Forgot your password?
        </h1>

        <p className="forgot-description">
          Enter the email address associated
          with your account and we'll send you
          a secure password reset link.
        </p>


        {message && (
          <div className="forgot-success">
            ✓ {message}
          </div>
        )}


        {error && (
          <div className="forgot-error">
            ! {error}
          </div>
        )}


        {!message && (
          <form
            onSubmit={handleSubmit}
            className="forgot-form"
          >

            <label>
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Enter your email"
              autoComplete="email"
              required
            />

            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Sending..."
                : "Send Reset Link →"}
            </button>

          </form>
        )}


        <Link
          to="/login"
          className="back-login"
        >
          ← Back to Login
        </Link>

      </div>

    </div>
  );
}

export default ForgotPassword;