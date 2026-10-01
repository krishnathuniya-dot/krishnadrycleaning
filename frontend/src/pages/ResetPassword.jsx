import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "../css/ResetPassword.css";

const API_URL = "http://localhost:2340/api";

function ResetPassword() {
  const { token } = useParams();

  const navigate = useNavigate();

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!password) {
      setError(
        "Please enter your new password."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (
      password !== confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    if (!token) {
      setError(
        "Invalid password reset link."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/reset-password/${token}`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            password,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to reset password."
        );
      }

      setMessage(
        data.message ||
          "Password reset successfully."
      );

      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 2500);

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
    <div className="reset-page">

      <div className="reset-card">

        <div className="reset-logo">
          <span>KRISHNA</span>
          <strong>DRY CLEANING</strong>
        </div>

        <div className="reset-icon">
          🔑
        </div>

        <span className="reset-eyebrow">
          CREATE NEW PASSWORD
        </span>

        <h1>
          Reset your password
        </h1>

        <p className="reset-description">
          Create a strong new password for
          your Krishna Dry Cleaning account.
        </p>


        {message && (
          <div className="reset-success">
            ✓ {message}

            <small>
              Redirecting you to login...
            </small>
          </div>
        )}


        {error && (
          <div className="reset-error">
            ! {error}
          </div>
        )}


        {!message && (
          <form
            onSubmit={handleSubmit}
            className="reset-form"
          >

            <label>
              New Password
            </label>

            <div className="password-field">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                placeholder="Enter new password"
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
              >
                {showPassword
                  ? "Hide"
                  : "Show"}
              </button>

            </div>


            <label>
              Confirm Password
            </label>

            <div className="password-field">

              <input
                type={
                  showConfirm
                    ? "text"
                    : "password"
                }
                value={
                  confirmPassword
                }
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                placeholder="Confirm new password"
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirm(
                    !showConfirm
                  )
                }
              >
                {showConfirm
                  ? "Hide"
                  : "Show"}
              </button>

            </div>


            <div className="password-hint">
              Password must contain at least
              6 characters.
            </div>


            <button
              type="submit"
              className="reset-submit"
              disabled={loading}
            >
              {loading
                ? "Updating..."
                : "Update Password →"}
            </button>

          </form>
        )}


        <Link
          to="/login"
          className="reset-back"
        >
          ← Back to Login
        </Link>

      </div>

    </div>
  );
}

export default ResetPassword;