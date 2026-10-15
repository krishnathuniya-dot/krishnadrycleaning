
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { NavLink, useNavigate } from "react-router-dom";
import "../css/navbar.css";

const API_URL = "https://krishnadrycleaning.onrender.com";

const GOOGLE_CLIENT_ID =
  "1051931774575-p62cmrv5cqelgfctuovf5kgouob9m19o.apps.googleusercontent.com";

// =====================================================
// PROFILE IMAGE URL
// =====================================================

const getProfileImageUrl = (image) => {
  if (!image || typeof image !== "string") return "";

  const value = image.trim();

  if (!value) return "";

  // Cloudinary URL: use directly
  if (/^https?:\/\//i.test(value)) return value;

  // Temporary browser preview
  if (value.startsWith("blob:")) return value;

  // Legacy local uploads
  if (value.startsWith("/")) return `${API_URL}${value}`;

  return `${API_URL}/${value}`;
};

function Navbar() {
  const navigate = useNavigate();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);

  const [user, setUser] = useState(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const servicesRef = useRef(null);
  const profileRef = useRef(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);

  const googleBtnRef = useRef(null);
  const googleInitializedRef = useRef(false);
  const googleInitTimerRef = useRef(null);

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // =====================================================
  // LOAD USER
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        if (!cancelled) setUser(null);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/profile`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          // Don't delete the session on a temporary server error.
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("userId");
            localStorage.removeItem("name");
            localStorage.removeItem("email");
            localStorage.removeItem("mobile");
            localStorage.removeItem("profileImage");

            if (!cancelled) setUser(null);
          }
          return;
        }

        if (data?.success && data?.user && !cancelled) {
          const profile = data.user;

          setUser(profile);
          localStorage.setItem("user", JSON.stringify(profile));

          const userId = profile._id || profile.id;

          if (userId) {
            localStorage.setItem("userId", userId);
          }

          if (profile.profileImage) {
            localStorage.setItem("profileImage", profile.profileImage);
          } else {
            localStorage.removeItem("profileImage");
          }
        }
      } catch (error) {
        console.error("Navbar profile error:", error);

        if (!cancelled) {
          try {
            const savedUser = localStorage.getItem("user");
            if (savedUser) setUser(JSON.parse(savedUser));
          } catch (parseError) {
            console.error("Saved user parse error:", parseError);
          }
        }
      }
    };

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [] );

  // =====================================================
  // OUTSIDE CLICK
  // =====================================================

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        servicesRef.current &&
        !servicesRef.current.contains(event.target)
      ) {
        setIsServicesOpen(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // =====================================================
  // ESCAPE KEY
  // =====================================================

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key !== "Escape") return;

      setIsServicesOpen(false);
      setIsProfileMenuOpen(false);
      setIsMobileMenuOpen(false);
      setIsMobileServicesOpen(false);

      if (!isLoading && !isGoogleLoading) {
        setIsAuthOpen(false);
        setMessage("");
        setMessageType("");
        setShowPassword(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isLoading, isGoogleLoading]);

  // =====================================================
  // BODY SCROLL
  // =====================================================

  useEffect(() => {
    document.body.style.overflow =
      isAuthOpen || isMobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isAuthOpen, isMobileMenuOpen]);

  // =====================================================
  // PROFILE UPDATE EVENT
  // =====================================================

  useEffect(() => {
    const handleProfileUpdate = (event) => {
      if (!event.detail) return;

      const updatedUser = event.detail;

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      const userId = updatedUser._id || updatedUser.id;

      if (userId) {
        localStorage.setItem("userId", userId);
      }

      if (updatedUser.profileImage) {
        localStorage.setItem("profileImage", updatedUser.profileImage);
      } else {
        localStorage.removeItem("profileImage");
      }
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, []);

  // =====================================================
  // GOOGLE LOGIN
  // =====================================================

  const handleGoogleCredentialResponse = useCallback(
    async (response) => {
      try {
        setIsGoogleLoading(true);
        setMessage("");
        setMessageType("");

        const res = await fetch(`${API_URL}/api/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            credential: response.credential,
          }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          setMessage(data.message || "Google login failed.");
          setMessageType("error");
          return;
        }

        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        if (data.user) {
          const profile = data.user;
          const userId = profile._id || profile.id;

          if (userId) localStorage.setItem("userId", userId);

          localStorage.setItem("user", JSON.stringify(profile));
          localStorage.setItem("name", profile.fullName || "");
          localStorage.setItem("email", profile.email || "");
          localStorage.setItem("mobile", profile.mobile || "");

          if (profile.profileImage) {
            localStorage.setItem("profileImage", profile.profileImage);
          } else {
            localStorage.removeItem("profileImage");
          }

          setUser(profile);
        }

        setMessage("Google login successful!");
        setMessageType("success");

        window.setTimeout(() => {
          setIsAuthOpen(false);
          setMessage("");
          setMessageType("");

          if (data.needsMobile) {
            navigate("/complete-profile");
          } else {
            navigate("/");
          }
        }, 1000);
      } catch (error) {
        console.error("Google authentication error:", error);
        setMessage("Unable to connect to server. Please try again.");
        setMessageType("error");
      } finally {
        setIsGoogleLoading(false);
      }
    },
    [navigate]
  );

  // =====================================================
  // GOOGLE BUTTON INITIALIZATION
  // =====================================================

  useEffect(() => {
    if (!isAuthOpen) return;

    let cancelled = false;

    const initGoogle = () => {
      if (cancelled) return;

      if (!window.google?.accounts?.id) {
        googleInitTimerRef.current = window.setTimeout(initGoogle, 200);
        return;
      }

      try {
        if (!googleInitializedRef.current) {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          googleInitializedRef.current = true;
        }

        if (googleBtnRef.current) {
          googleBtnRef.current.innerHTML = "";

          const width =
            window.innerWidth <= 360
              ? 240
              : window.innerWidth <= 480
                ? 280
                : 340;

          window.google.accounts.id.renderButton(
            googleBtnRef.current,
            {
              theme: "outline",
              size: "large",
              width,
              text: "continue_with",
              shape: "rectangular",
              logo_alignment: "left",
            }
          );
        }
      } catch (error) {
        console.error("Google button initialization error:", error);
      }
    };

    googleInitTimerRef.current = window.setTimeout(initGoogle, 300);

    return () => {
      cancelled = true;

      if (googleInitTimerRef.current) {
        window.clearTimeout(googleInitTimerRef.current);
      }
    };
  }, [isAuthOpen, isLoginView, handleGoogleCredentialResponse]);

  // =====================================================
  // PROFILE IMAGE URL — CLOUDINARY SUPPORT
  // =====================================================

  const profileImageUrl = useMemo(
    () => getProfileImageUrl(user?.profileImage),
    [user?.profileImage]
  );

  const getAvatarLetter = () => {
    const name = user?.fullName || "";
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  // =====================================================
  // OPEN / CLOSE AUTH MODAL
  // =====================================================

  const openAuthModal = () => {
    setIsAuthOpen(true);
    setIsLoginView(true);
    setMessage("");
    setMessageType("");
    setShowPassword(false);
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  const closeAuthModal = () => {
    if (isLoading || isGoogleLoading) return;

    setIsAuthOpen(false);
    setMessage("");
    setMessageType("");
    setShowPassword(false);
  };

  const switchAuthView = (loginView) => {
    setIsLoginView(loginView);
    setEmail("");
    setPassword("");
    setFullName("");
    setMobile("");
    setMessage("");
    setMessageType("");
    setShowPassword(false);
  };

  // =====================================================
  // LOGIN / SIGNUP
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setMessageType("");

    if (!isLoginView && !/^[0-9]{10}$/.test(mobile)) {
      setMessage("Please enter a valid 10-digit mobile number.");
      setMessageType("error");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      setMessageType("error");
      return;
    }

    if (!email.trim()) {
      setMessage("Please enter your email address.");
      setMessageType("error");
      return;
    }

    if (!isLoginView && !fullName.trim()) {
      setMessage("Please enter your full name.");
      setMessageType("error");
      return;
    }

    setIsLoading(true);

    try {
      const url = isLoginView
        ? `${API_URL}/api/login`
        : `${API_URL}/api/signup`;

      const body = isLoginView
        ? { email: email.trim(), password }
        : {
            fullName: fullName.trim(),
            mobile,
            email: email.trim(),
            password,
          };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.message || "Something went wrong.");
        setMessageType("error");
        return;
      }

      if (!isLoginView) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("userId");
        localStorage.removeItem("name");
        localStorage.removeItem("email");
        localStorage.removeItem("mobile");
        localStorage.removeItem("profileImage");

        setUser(null);
        setMessage(
          data.message || "Account created successfully. Please login."
        );
        setMessageType("success");

        setPassword("");
        setFullName("");
        setMobile("");
        setIsLoginView(true);
        return;
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      if (data.user) {
        const profile = data.user;
        const userId = profile._id || profile.id;

        if (userId) localStorage.setItem("userId", userId);

        localStorage.setItem("user", JSON.stringify(profile));
        localStorage.setItem("name", profile.fullName || "");
        localStorage.setItem("email", profile.email || "");
        localStorage.setItem("mobile", profile.mobile || "");

        if (profile.profileImage) {
          localStorage.setItem("profileImage", profile.profileImage);
        } else {
          localStorage.removeItem("profileImage");
        }

        setUser(profile);
      }

      setMessage(data.message || "Login successful.");
      setMessageType("success");

      setEmail("");
      setPassword("");
      setFullName("");
      setMobile("");

      window.setTimeout(() => {
        setIsAuthOpen(false);
        setMessage("");
        setMessageType("");
      }, 1000);
    } catch (error) {
      console.error("Authentication error:", error);
      setMessage("Unable to connect to server. Please try again.");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to logout?")) return;

    const token = localStorage.getItem("token");

    try {
      if (token) {
        await fetch(`${API_URL}/api/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (error) {
      console.error("Logout API error:", error);
    }

    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("user");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("mobile");
    localStorage.removeItem("profileImage");

    setUser(null);
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);

    navigate("/");
    window.alert("Logout successful");
  };

  const handleProfile = () => {
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
    navigate("/profile");
  };

  const handleSettings = () => {
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
    navigate("/settings");
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsMobileServicesOpen(false);
  };

  // =====================================================
  // REUSABLE PROFILE AVATAR
  // =====================================================

  const renderAvatar = (className) => (
    <span className={className}>
      {profileImageUrl ? (
        <img
          src={profileImageUrl}
          alt={user?.fullName || "Profile"}
          className="navbar-profile-image"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      ) : (
        getAvatarLetter()
      )}
    </span>
  );

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>
      <header className="navbar">
        <div className="navbar-container">
          <NavLink to="/" className="logo">
            <div className="logo-icon">K</div>
            <div className="logo-text">
              <span className="brand-name">KRISHNA</span>
              <span className="brand-sub">DRY CLEANING</span>
            </div>
          </NavLink>

          <nav className="nav-menu">
            <NavLink to="/" className="nav-item">
              Home
            </NavLink>

            <div className="services-dropdown-container" ref={servicesRef}>
              <button
                type="button"
                className="nav-item services-dropdown-btn"
                onClick={() => setIsServicesOpen((open) => !open)}
              >
                <span>Services</span>
                <span className={isServicesOpen ? "services-arrow rotate" : "services-arrow"}>
                  ▼
                </span>
              </button>

              {isServicesOpen && (
                <div className="services-dropdown">
                  <div className="services-dropdown-header">
                    <span className="services-dropdown-small">OUR SERVICES</span>
                    <h3>Premium Clothing Care</h3>
                    <p>Professional care for every fabric, every time.</p>
                  </div>

                  <div className="services-list">
                    <NavLink to="/services/dry-cleaning" className="service-dropdown-item" onClick={() => setIsServicesOpen(false)}>
                      <div className="service-icon dry-cleaning-icon">🧥</div>
                      <div className="service-dropdown-content">
                        <strong>Dry Cleaning</strong>
                        <span>Deep cleaning &amp; premium fabric care</span>
                      </div>
                      <span className="service-item-arrow">→</span>
                    </NavLink>

                    <NavLink to="/services/rafu" className="service-dropdown-item" onClick={() => setIsServicesOpen(false)}>
                      <div className="service-icon rafu-icon">🧵</div>
                      <div className="service-dropdown-content">
                        <strong>Rafu / Darning</strong>
                        <span>Expert repair for damaged clothes</span>
                      </div>
                      <span className="service-item-arrow">→</span>
                    </NavLink>

                    <NavLink to="/services/charak" className="service-dropdown-item" onClick={() => setIsServicesOpen(false)}>
                      <div className="service-icon charak-icon">✂️</div>
                      <div className="service-dropdown-content">
                        <strong>Charak</strong>
                        <span>Perfect fitting &amp; professional alterations</span>
                      </div>
                      <span className="service-item-arrow">→</span>
                    </NavLink>

                    <NavLink to="/services/steam-press" className="service-dropdown-item" onClick={() => setIsServicesOpen(false)}>
                      <div className="service-icon steam-icon">👔</div>
                      <div className="service-dropdown-content">
                        <strong>Steam Press</strong>
                        <span>Crisp, wrinkle-free clothes</span>
                      </div>
                      <span className="service-item-arrow">→</span>
                    </NavLink>
                  </div>

                  <div className="services-dropdown-footer">
                    <span>✨ Quality care for your clothes</span>
                    <NavLink to="/services" onClick={() => setIsServicesOpen(false)}>
                      View All →
                    </NavLink>
                  </div>
                </div>
              )}
            </div>

            <NavLink to="/rate-list" className="nav-item">
              Pricing
            </NavLink>

            <NavLink to="/shop" className="nav-item location-link">
              <span className="loc-icon">📍</span>
              Store Locator
            </NavLink>
          </nav>

          <div className="nav-right">
            {!user && (
              <button className="auth-trigger-btn" onClick={openAuthModal}>
                👤 Login / Signup
              </button>
            )}

            {user && (
              <div className="user-profile-container" ref={profileRef}>
                <button
                  className="user-profile-btn"
                  onClick={() => setIsProfileMenuOpen((open) => !open)}
                >
                  {renderAvatar("user-avatar")}
                  <span className="user-name">{user.fullName || "User"}</span>
                  <span className={isProfileMenuOpen ? "profile-arrow rotate" : "profile-arrow"}>
                    ▼
                  </span>
                </button>

                {isProfileMenuOpen && (
                  <div className="profile-dropdown">
                    <div className="profile-dropdown-header">
                      <div className="dropdown-avatar">
                        {profileImageUrl ? (
                          <img
                            src={profileImageUrl}
                            alt={user.fullName || "Profile"}
                            className="dropdown-profile-image"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          getAvatarLetter()
                        )}
                      </div>

                      <div>
                        <strong>{user.fullName || "User"}</strong>
                        <span>{user.email}</span>
                      </div>
                    </div>

                    <div className="dropdown-divider" />

                    <button className="profile-dropdown-item" onClick={handleProfile}>
                      <span>👤</span>
                      <div>
                        <strong>Profile</strong>
                        <small>View your profile</small>
                      </div>
                    </button>

                    <button className="profile-dropdown-item" onClick={handleSettings}>
                      <span>⚙️</span>
                      <div>
                        <strong>Settings</strong>
                        <small>Account settings</small>
                      </div>
                    </button>

                    <div className="dropdown-divider" />

                    <button className="profile-dropdown-item logout-item" onClick={handleLogout}>
                      <span>🚪</span>
                      <div>
                        <strong>Logout</strong>
                        <small>Sign out of your account</small>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}

            <a
              href="https://wa.me/919910655308"
              className="whatsapp-btn"
              target="_blank"
              rel="noreferrer"
            >
              <span className="wa-icon">💬</span>
              <span className="wa-text">Chat</span>
            </a>

            <button
              type="button"
              className={isMobileMenuOpen ? "dot-menu-btn active" : "dot-menu-btn"}
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              aria-label="Open menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      <div
        className={isMobileMenuOpen ? "mobile-menu-overlay active" : "mobile-menu-overlay"}
        onClick={closeMobileMenu}
      >
        <div className="mobile-menu-drawer" onClick={(event) => event.stopPropagation()}>
          <div className="mobile-menu-header">
            <span className="mobile-menu-title">MENU</span>
            <button type="button" className="mobile-menu-close" onClick={closeMobileMenu} aria-label="Close menu">
              ×
            </button>
          </div>

          <nav className="mobile-menu-nav">
            <NavLink to="/" className="mobile-menu-item" onClick={closeMobileMenu}>
              <span className="mobile-menu-icon">🏠</span>
              <span>Home</span>
            </NavLink>

            <div className="mobile-services-wrapper">
              <button
                type="button"
                className="mobile-menu-item mobile-services-toggle"
                onClick={() => setIsMobileServicesOpen((open) => !open)}
              >
                <span className="mobile-menu-icon">🧺</span>
                <span>Services</span>
                <span className={isMobileServicesOpen ? "mobile-services-arrow rotate" : "mobile-services-arrow"}>
                  ▼
                </span>
              </button>

              {isMobileServicesOpen && (
                <div className="mobile-services-list">
                  <NavLink to="/services/dry-cleaning" className="mobile-service-item" onClick={closeMobileMenu}>
                    <span>🧥</span> Dry Cleaning
                  </NavLink>
                  <NavLink to="/services/rafu" className="mobile-service-item" onClick={closeMobileMenu}>
                    <span>🧵</span> Rafu / Darning
                  </NavLink>
                  <NavLink to="/services/charak" className="mobile-service-item" onClick={closeMobileMenu}>
                    <span>✂️</span> Charak
                  </NavLink>
                  <NavLink to="/services/steam-press" className="mobile-service-item" onClick={closeMobileMenu}>
                    <span>👔</span> Steam Press
                  </NavLink>
                  <NavLink to="/services" className="mobile-service-item view-all" onClick={closeMobileMenu}>
                    View All Services →
                  </NavLink>
                </div>
              )}
            </div>

            <NavLink to="/rate-list" className="mobile-menu-item" onClick={closeMobileMenu}>
              <span className="mobile-menu-icon">💰</span>
              <span>Pricing</span>
            </NavLink>

            <NavLink to="/shop" className="mobile-menu-item" onClick={closeMobileMenu}>
              <span className="mobile-menu-icon">📍</span>
              <span>Store Locator</span>
            </NavLink>

            <div className="mobile-menu-divider" />

            {!user && (
              <button type="button" className="mobile-auth-btn" onClick={openAuthModal}>
                👤 Login / Signup
              </button>
            )}

            {user && (
              <div className="mobile-user-section">
                <div className="mobile-user-info">
                  <div className="mobile-user-avatar">
                    {profileImageUrl ? (
                      <img
                        src={profileImageUrl}
                        alt={user.fullName || "Profile"}
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      getAvatarLetter()
                    )}
                  </div>

                  <div className="mobile-user-details">
                    <strong>{user.fullName || "User"}</strong>
                    <span>{user.email}</span>
                  </div>
                </div>

                <NavLink to="/profile" className="mobile-menu-item" onClick={closeMobileMenu}>
                  <span className="mobile-menu-icon">👤</span>
                  <span>My Profile</span>
                </NavLink>

                <NavLink to="/settings" className="mobile-menu-item" onClick={closeMobileMenu}>
                  <span className="mobile-menu-icon">⚙️</span>
                  <span>Settings</span>
                </NavLink>

                <button type="button" className="mobile-menu-item mobile-logout-btn" onClick={handleLogout}>
                  <span className="mobile-menu-icon">🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </nav>
        </div>
      </div>

      {/* AUTH MODAL */}
      {isAuthOpen && (
        <div className="auth-modal-overlay" onClick={closeAuthModal}>
          <div className="professional-auth-modal" onClick={(event) => event.stopPropagation()}>
            <button className="professional-close-btn" onClick={closeAuthModal} aria-label="Close login">
              ×
            </button>

            <div className="auth-brand-area">
              <div className="auth-brand-logo">K</div>
              <h3>KRISHNA</h3>
              <span>DRY CLEANING</span>
              <p>Premium care for your clothes.</p>
            </div>

            <div className="professional-auth-body">
              <div className="professional-auth-header">
                <span className="auth-small-title">
                  {isLoginView ? "WELCOME BACK" : "GET STARTED"}
                </span>
                <h2>{isLoginView ? "Sign in to your account" : "Create your account"}</h2>
                <p>
                  {isLoginView
                    ? "Enter your details to continue."
                    : "Join Krishna Dry Cleaning today."}
                </p>
              </div>

              <div className="professional-auth-tabs">
                <button
                  type="button"
                  className={isLoginView ? "professional-tab active" : "professional-tab"}
                  onClick={() => switchAuthView(true)}
                >
                  Login
                </button>

                <button
                  type="button"
                  className={!isLoginView ? "professional-tab active" : "professional-tab"}
                  onClick={() => switchAuthView(false)}
                >
                  Create Account
                </button>
              </div>

              {message && (
                <div className={messageType === "success" ? "auth-message success" : "auth-message error"}>
                  <span>{messageType === "success" ? "✓" : "!"}</span>
                  {message}
                </div>
              )}

              <div className="google-auth-section">
                <div className="google-btn-wrapper">
                  <div ref={googleBtnRef}></div>
                </div>

                {isGoogleLoading && (
                  <div className="google-loading-text">
                    <span className="spinner"></span>
                    Signing in with Google...
                  </div>
                )}

                <div className="auth-divider">
                  <span></span>
                  <p>OR</p>
                  <span></span>
                </div>
              </div>

              <form className="professional-auth-form" onSubmit={handleSubmit}>
                {!isLoginView && (
                  <div className="professional-input-group">
                    <label>Full Name</label>
                    <div className="professional-input-wrapper">
                      <span className="input-icon">👤</span>
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                {!isLoginView && (
                  <div className="professional-input-group">
                    <label>Mobile Number</label>
                    <div className="professional-input-wrapper">
                      <span className="input-icon">📱</span>
                      <span className="country-code">+91</span>
                      <input
                        type="tel"
                        placeholder="Enter mobile number"
                        maxLength={10}
                        value={mobile}
                        onChange={(event) =>
                          setMobile(event.target.value.replace(/\D/g, ""))
                        }
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="professional-input-group">
                  <label>Email Address</label>
                  <div className="professional-input-wrapper">
                    <span className="input-icon">✉</span>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="professional-input-group">
                  <label>Password</label>
                  <div className="professional-input-wrapper">
                    <span className="input-icon">🔒</span>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword((show) => !show)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>

                  {!isLoginView && (
                    <small className="password-hint">
                      Password must contain at least 6 characters.
                    </small>
                  )}
                </div>

                {isLoginView && (
                  <div className="auth-extra-row">
                    <label className="remember-me">
                      <input type="checkbox" />
                      <span>Remember me</span>
                    </label>

                    <button
                      type="button"
                      className="forgot-password"
                      onClick={() => {
                        setIsAuthOpen(false);
                        setMessage("");
                        setMessageType("");
                        navigate("/forgot-password");
                      }}
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                <button type="submit" className="professional-submit-btn" disabled={isLoading}>
                  {isLoading ? (
                    <span className="loading-content">
                      <span className="spinner"></span>
                      {isLoginView ? "Signing in..." : "Creating account..."}
                    </span>
                  ) : (
                    <>
                      {isLoginView ? "Sign In" : "Create Account"}
                      <span className="submit-arrow">→</span>
                    </>
                  )}
                </button>
              </form>

              <div className="professional-auth-footer">
                <span>
                  {isLoginView
                    ? "Don't have an account?"
                    : "Already have an account?"}
                </span>

                <button type="button" onClick={() => switchAuthView(!isLoginView)}>
                  {isLoginView ? "Create one" : "Sign in"}
                </button>
              </div>

              {!isLoginView && (
                <div className="auth-terms">
                  By creating an account, you agree to our
                  <span> Terms &amp; Conditions </span>
                  and
                  <span> Privacy Policy</span>.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
