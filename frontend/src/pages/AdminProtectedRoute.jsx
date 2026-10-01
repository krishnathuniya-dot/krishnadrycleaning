
import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const API_URL = "https://krishnadrycleaning.onrender.com";

function AdminProtectedRoute() {
  const location = useLocation();

  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let cancelled = false;

    const verifyAdmin = async () => {
      const token = localStorage.getItem("adminToken");

      // ==========================================
      // TOKEN NAHI HAI
      // ==========================================
      if (!token) {
        if (!cancelled) {
          setStatus("unauthorized");
        }
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/admin/profile`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        let data = {};

        try {
          data = await response.json();
        } catch (jsonError) {
          data = {};
        }

        // ==========================================
        // ADMIN DATA FIND KARO
        // ==========================================

        const admin =
          data?.admin ||
          data?.data?.admin ||
          data?.data ||
          null;

        const role = String(
          admin?.role || ""
        ).toLowerCase();

        // ==========================================
        // ADMIN VALIDATION
        // ==========================================

        const validAdmin =
          response.ok &&
          data?.success !== false &&
          Boolean(admin) &&
          ["admin", "superadmin"].includes(role);

        if (cancelled) {
          return;
        }

        // ==========================================
        // VALID ADMIN
        // ==========================================

        if (validAdmin) {
          localStorage.setItem(
            "admin",
            JSON.stringify(admin)
          );

          setStatus("authorized");
          return;
        }

        // ==========================================
        // INVALID / EXPIRED / REVOKED TOKEN
        // ==========================================

        localStorage.removeItem("adminToken");
        localStorage.removeItem("admin");
        localStorage.removeItem("adminSessionId");
        localStorage.removeItem("loginActivity");

        // IMPORTANT:
        // adminDeviceId ko remove nahi karna.
        // Ye permanent browser/device identity hai.

        setStatus("unauthorized");

      } catch (error) {
        console.error(
          "Admin verification error:",
          error
        );

        if (!cancelled) {
          setStatus("error");
        }
      }
    };

    verifyAdmin();

    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  // ==========================================
  // CHECKING
  // ==========================================

  if (status === "checking") {
    return (
      <div className="admin-route-loading">
        <div className="admin-route-spinner"></div>

        <p>
          Verifying admin access...
        </p>
      </div>
    );
  }

  // ==========================================
  // UNAUTHORIZED
  // ==========================================

  if (status === "unauthorized") {
    return (
      <Navigate
        to="/admin"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  // ==========================================
  // SERVER / NETWORK ERROR
  // ==========================================

  if (status === "error") {
    return (
      <div className="admin-route-error">

        <h2>
          Unable to verify admin access
        </h2>

        <p>
          Server se connection nahi ho pa raha.
          Apna backend check karke dobara try karo.
        </p>

        <button
          type="button"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>

      </div>
    );
  }

  // ==========================================
  // AUTHORIZED
  // ==========================================

  return <Outlet />;
}

export default AdminProtectedRoute;
