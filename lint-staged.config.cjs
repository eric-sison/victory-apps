module.exports = {
  "apps/**/*.{ts,tsx,js,jsx,json}": (files) => {
    const filtered = files.filter((f) => !f.includes("/scripts/"));
    if (!filtered.length) return [];
    return [`pnpm exec biome check ${filtered.join(" ")}`];
  },
};