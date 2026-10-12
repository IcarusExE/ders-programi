(() => {
  try {
    const savedTheme = localStorage.getItem("ders-pusulasi-theme");
    const theme = savedTheme === "dark" || savedTheme === "light"
      ? savedTheme
      : matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    const savedPalette = localStorage.getItem("ders-pusulasi-palette");
    document.documentElement.dataset.palette = ["classic", "forest", "berry"].includes(savedPalette) ? savedPalette : "classic";
    document.documentElement.style.colorScheme = theme;
    const themeColors = {
      classic: { light: "#134383", dark: "#07172d" },
      forest: { light: "#176b5b", dark: "#071b18" },
      berry: { light: "#8b3156", dark: "#21111a" },
    };
    document.querySelector("#themeColorMeta").content = themeColors[document.documentElement.dataset.palette][theme];
  } catch (_) {}
})();
