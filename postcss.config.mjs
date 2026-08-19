/**
 * PostCSS Configuration
 *
 * Tailwind CSS v4 is wired in via `@tailwindcss/postcss`, which sets up all
 * required PostCSS plugins (including autoprefixing) automatically.
 */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
