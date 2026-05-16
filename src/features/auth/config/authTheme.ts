const authTheme = {
  backgroundImagePath: "/images/invernadero.png"
};

export function applyAuthTheme() {
  const background = authTheme.backgroundImagePath
    ? `url("${authTheme.backgroundImagePath}")`
    : "none";

  document.documentElement.style.setProperty("--auth-background-image", background);
}
