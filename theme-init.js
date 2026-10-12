(() => {
  try {
    const savedTheme = localStorage.getItem("ders-pusulasi-theme");
    const theme = savedTheme === "dark" || savedTheme === "light"
      ? savedTheme
      : matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.querySelector("#themeColorMeta").content = theme === "dark" ? "#07172d" : "#134383";
  } catch (_) {}
})();
