module.exports = {
  "apps/**/*.{ts,tsx,js,jsx,json}": (files) => {
    const filtered = files.filter(
      (f) =>
        !f.includes("/scripts/") &&
        !f.includes("/src/database/migrations/") &&
        !f.includes("/src/database/schemas/")
    );
    
    if (!filtered.length) return [];
    return [`pnpm exec biome check ${filtered.join(" ")}`];
  },
};