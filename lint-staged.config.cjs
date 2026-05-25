module.exports = {
  "apps/**/*.{ts,tsx,js,jsx,json}": (files) => [
    `pnpm exec biome check ${files.join(" ")}`,
  ],
};