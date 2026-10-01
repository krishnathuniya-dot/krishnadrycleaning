
const getDeviceInfo = (userAgent = "") => {
  const ua = userAgent || "";
  const lowerUA = ua.toLowerCase();

  // ==========================================
  // DEVICE TYPE
  // ==========================================

  let deviceType = "Unknown";

  if (/ipad|tablet/.test(lowerUA)) {
    deviceType = "Tablet";
  } else if (
    /mobile|iphone|ipod|android.*mobile|windows phone/.test(lowerUA)
  ) {
    deviceType = "Mobile";
  } else if (
    /windows|macintosh|mac os|linux|x11/.test(lowerUA)
  ) {
    deviceType = "Desktop";
  }

  // ==========================================
  // DEVICE NAME
  // ==========================================

  let deviceName = "Unknown Device";

  if (lowerUA.includes("iphone")) {
    deviceName = "iPhone";
  } else if (lowerUA.includes("ipad")) {
    deviceName = "iPad";
  } else if (lowerUA.includes("ipod")) {
    deviceName = "iPod";
  } else if (lowerUA.includes("android")) {
    deviceName = "Android Device";
  } else if (lowerUA.includes("windows phone")) {
    deviceName = "Windows Phone";
  } else if (lowerUA.includes("windows")) {
    deviceName = "Windows PC";
  } else if (
    lowerUA.includes("macintosh") ||
    lowerUA.includes("mac os")
  ) {
    deviceName = "Mac";
  } else if (lowerUA.includes("linux")) {
    deviceName = "Linux PC";
  }

  // ==========================================
  // BROWSER + VERSION
  // ==========================================

  let browser = "Unknown";
  let browserVersion = "Unknown";
  let match;

  // Microsoft Edge - Desktop
  match = ua.match(/Edg\/([\d.]+)/i);

  if (match) {
    browser = "Microsoft Edge";
    browserVersion = match[1];
  }

  // Microsoft Edge - Android
  if (browser === "Unknown") {
    match = ua.match(/EdgA\/([\d.]+)/i);

    if (match) {
      browser = "Microsoft Edge";
      browserVersion = match[1];
    }
  }

  // Microsoft Edge - iOS
  if (browser === "Unknown") {
    match = ua.match(/EdgiOS\/([\d.]+)/i);

    if (match) {
      browser = "Microsoft Edge";
      browserVersion = match[1];
    }
  }

  // Opera
  if (browser === "Unknown") {
    match = ua.match(/OPR\/([\d.]+)/i);

    if (match) {
      browser = "Opera";
      browserVersion = match[1];
    }
  }

  // Chrome
  if (browser === "Unknown") {
    match = ua.match(/Chrome\/([\d.]+)/i);

    if (match) {
      browser = "Google Chrome";
      browserVersion = match[1];
    }
  }

  // Firefox
  if (browser === "Unknown") {
    match = ua.match(/Firefox\/([\d.]+)/i);

    if (match) {
      browser = "Mozilla Firefox";
      browserVersion = match[1];
    }
  }

  // Safari
  if (browser === "Unknown") {
    match = ua.match(/Version\/([\d.]+).*Safari\/[\d.]+/i);

    if (match) {
      browser = "Safari";
      browserVersion = match[1];
    }
  }

  // ==========================================
  // OPERATING SYSTEM + VERSION
  // ==========================================

  let operatingSystem = "Unknown";
  let osVersion = "Unknown";

  // ==========================================
  // Windows
  // ==========================================

  match = ua.match(/Windows NT ([\d.]+)/i);

  if (match) {
    operatingSystem = "Windows";

    const windowsVersion = match[1];

    const windowsMap = {
      "10.0": "10/11",
      "6.4": "10",
      "6.3": "8.1",
      "6.2": "8",
      "6.1": "7",
      "6.0": "Vista",
      "5.1": "XP",
      "5.2": "XP",
    };

    osVersion =
      windowsMap[windowsVersion] || windowsVersion;
  }

  // ==========================================
  // Android
  // ==========================================

  match = ua.match(/Android\s+([\d.]+)/i);

  if (match) {
    operatingSystem = "Android";
    osVersion = match[1];
  }

  // ==========================================
  // iPhone / iPad / iPod
  // ==========================================

  match = ua.match(/OS\s+([\d_]+)\s+like Mac OS X/i);

  if (match) {
    operatingSystem = "iOS";
    osVersion = match[1].replace(/_/g, ".");
  }

  // ==========================================
  // macOS
  // ==========================================

  if (operatingSystem === "Unknown") {
    match = ua.match(/Mac OS X\s*([\d_\.]+)/i);

    if (match) {
      operatingSystem = "macOS";
      osVersion = match[1].replace(/_/g, ".");
    }
  }

  // ==========================================
  // Linux
  // ==========================================

  if (
    operatingSystem === "Unknown" &&
    lowerUA.includes("linux")
  ) {
    operatingSystem = "Linux";
    osVersion = "Unknown";
  }

  // ==========================================
  // RETURN
  // ==========================================

  return {
    deviceType,
    deviceName,
    browser,
    browserVersion,
    operatingSystem,
    osVersion,
    userAgent: ua,
  };
};

module.exports = getDeviceInfo;

