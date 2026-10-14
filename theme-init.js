(() => {
  try {
    const isAndroid = /Android/i.test(navigator.userAgent);
    document.documentElement.dataset.platform = isAndroid ? "android" : "default";
    document.documentElement.dataset.displayMode = matchMedia("(display-mode: standalone)").matches ? "standalone" : "browser";
    const savedTheme = localStorage.getItem("ders-pusulasi-theme");
    const theme = savedTheme === "dark" || savedTheme === "light"
      ? savedTheme
      : matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    const savedPalette = localStorage.getItem("ders-pusulasi-palette");
    document.documentElement.dataset.palette = ["classic", "forest", "berry", "sunset", "violet", "ocean"].includes(savedPalette) ? savedPalette : "classic";
    const textSize = localStorage.getItem("ders-pusulasi-text-size");
    document.documentElement.dataset.textSize = ["normal", "large", "xlarge"].includes(textSize) ? textSize : "normal";
    document.documentElement.dataset.highContrast = localStorage.getItem("ders-pusulasi-high-contrast") === "1" ? "true" : "false";
    const reducedMotion = localStorage.getItem("ders-pusulasi-reduced-motion");
    document.documentElement.dataset.reducedMotion = reducedMotion === "1" || (reducedMotion === null && matchMedia("(prefers-reduced-motion: reduce)").matches) ? "true" : "false";
    document.documentElement.style.colorScheme = theme;
    const themeColors = {
      classic: { light: "#134383", dark: "#07172d" },
      forest: { light: "#176b5b", dark: "#071b18" },
      berry: { light: "#8b3156", dark: "#21111a" },
      sunset: { light: "#a33f24", dark: "#24120d" },
      violet: { light: "#5b3f99", dark: "#171126" },
      ocean: { light: "#006979", dark: "#071d22" },
    };
    document.querySelector("#themeColorMeta").content = themeColors[document.documentElement.dataset.palette][theme];
  } catch (_) {}
})();
