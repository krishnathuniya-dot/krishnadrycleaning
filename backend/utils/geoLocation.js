const geoip = require("geoip-lite");

// =====================================================
// NORMALIZE IP
// =====================================================

const normalizeIp = (ip) => {
  if (!ip) return "";

  let value = String(ip).trim();

  if (value.startsWith("::ffff:")) {
    value = value.replace("::ffff:", "");
  }

  if (value === "::1") {
    value = "127.0.0.1";
  }

  return value;
};

// =====================================================
// IP VERSION
// =====================================================

const getIpVersion = (ip) => {
  if (!ip) return "Unknown";

  const value = String(ip).trim();

  if (value.includes(":")) return "IPv6";

  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(value)) {
    return "IPv4";
  }

  return "Unknown";
};

// =====================================================
// LOCAL / PRIVATE IP CHECK
// =====================================================

const isLocalIp = (ip) => {
  if (!ip) return true;

  const value = String(ip).trim();

  if (
    value === "127.0.0.1" ||
    value === "localhost" ||
    value === "::1" ||
    value === "Unknown"
  ) {
    return true;
  }

  if (/^10\./.test(value)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(value)) return true;
  if (/^192\.168\./.test(value)) return true;
  if (/^169\.254\./.test(value)) return true;
  if (/^fc00:/i.test(value)) return true;
  if (/^fe80:/i.test(value)) return true;

  return false;
};

// =====================================================
// GET LOCATION FROM IP
// =====================================================

const getLocationFromIp = (rawIp) => {
  const ip = normalizeIp(rawIp);

  const empty = {
    ipAddress: ip || "Unknown",
    ipVersion: getIpVersion(ip),
    country: "",
    countryCode: "",
    region: "",
    city: "",
  };

  if (!ip) return empty;

  if (isLocalIp(ip)) {
    return {
      ...empty,
      country: "Local Network",
      countryCode: "",
      region: "Local Network",
      city: "Local Network",
    };
  }

  try {
    const geo = geoip.lookup(ip);

    if (!geo) return empty;

    return {
      ipAddress: ip,
      ipVersion: getIpVersion(ip),
      country: geo.country || "",
      countryCode: geo.country || "",
      region: geo.region || "",
      city: geo.city || "",
    };
  } catch (error) {
    console.error("GEO LOOKUP ERROR:", error.message);
    return empty;
  }
};

module.exports = {
  normalizeIp,
  getIpVersion,
  isLocalIp,
  getLocationFromIp,
};