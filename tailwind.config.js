/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Enigma Protocol light theme color palette
        "enigma-bg": "#F8F8FC",           // Main light background
        "enigma-white": "#FFFFFF",        // Pure white for cards
        "enigma-sidebar": "#FFFFFF",      // Sidebar background
        "enigma-panel": "#FFFFFF",        // Panel background
        "enigma-text": "#1A1A1A",         // Primary dark text
        "enigma-text-muted": "#6B7280",   // Muted text color
        "enigma-text-light": "#9CA3AF",   // Light text color
        "enigma-primary": "#4A2C8C",      // Dark blue/purple primary
        "enigma-accent": "#3B82F6",       // Blue accent
        "enigma-red": "#EF4444",          // Red accent
        "enigma-green": "#10B981",        // Green accent
        "enigma-yellow": "#F59E0B",       // Yellow accent
        "enigma-orange": "#F97316",       // Orange accent
        "enigma-purple": "#8B5CF6",       // Purple accent
        "enigma-pink": "#EC4899",         // Pink accent
        "enigma-border": "#E5E7EB",       // Light border color
        "enigma-hover": "#F3F4F6",        // Hover state
        "enigma-selected": "#EDE9FE",     // Selected state
        // Gradient colors for buttons
        "enigma-gradient-start": "#3B82F6", // Blue start
        "enigma-gradient-end": "#4A2C8C",   // Purple end
        // Legacy colors for compatibility
        "trading-darkest": "#F8F8FC",
        "trading-darker": "#FFFFFF",
        "trading-dark": "#FFFFFF",
        "trading-sidebar": "#FFFFFF",
        "trading-panel": "#FFFFFF",
        "trading-text": "#1A1A1A",
        "trading-text-muted": "#6B7280",
        "trading-accent": "#4A2C8C",
        "trading-red": "#EF4444",
        "trading-green": "#10B981",
        "trading-yellow": "#F59E0B",
        "trading-orange": "#F97316",
        "trading-purple": "#8B5CF6",
        "trading-pink": "#EC4899",
        "trading-border": "#E5E7EB",
        "trading-hover": "#F3F4F6",
        "trading-selected": "#EDE9FE",
        "chess-dark": "#FFFFFF",
        "chess-darker": "#FFFFFF",
        "chess-darkest": "#F8F8FC",
        "chess-sidebar": "#FFFFFF",
        "chess-panel": "#FFFFFF",
        "chess-text": "#1A1A1A",
        "chess-text-muted": "#6B7280",
        "chess-accent": "#4A2C8C",
        "chess-red": "#EF4444",
        "chess-green": "#10B981",
        "chess-yellow": "#F59E0B",
        "chess-orange": "#F97316",
        "chess-purple": "#8B5CF6",
        "chess-pink": "#EC4899",
        "chess-border": "#E5E7EB",
        "chess-hover": "#F3F4F6",
        "chess-selected": "#EDE9FE",
        "cloak-black": "#FFFFFF",
        "cloak-dark": "#FFFFFF",
        "cloak-blue": "#4A2C8C",
        "cloak-purple": "#8B5CF6",
        "cloak-gray": "#1A1A1A",
        "cloak-red": "#EF4444",
      },
      fontFamily: {
        mono: ['"Anonymous Pro"', '"Roboto Mono"', "monospace"],
        sans: ['"Open Sans"', "sans-serif"],
      },
      animation: {
        "neon-glow": "neon-glow 1.5s ease-in-out infinite alternate",
      },
      keyframes: {
        "neon-glow": {
          "0%": {
            "box-shadow": "0 0 5px #39FF14, 0 0 10px #39FF14, 0 0 15px #39FF14",
          },
          "100%": {
            "box-shadow":
              "0 0 10px #39FF14, 0 0 20px #39FF14, 0 0 30px #39FF14",
          },
        },
      },
    },
  },
  plugins: [],
};
