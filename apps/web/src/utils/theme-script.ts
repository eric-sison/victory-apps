const script = `(function () {
    const stored = localStorage.getItem("ui-theme");
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    const theme =
        stored === "dark" || stored === "light"
        ? stored
        : window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    root.classList.add(theme);
    root.style.colorScheme = theme;
    })();`

export function minify(input: string): string {
  return input
    .replace(/\/\*[\s\S]*?\*\//g, "") // block comments
    .replace(/\/\/.*$/gm, "") // line comments
    .replace(/\n/g, " ") // remove newlines
    .replace(/\t/g, " ") // remove tabs
    .replace(/\s+/g, " ") // collapse whitespace
    .trim()
}

export const themeScript = minify(script)
