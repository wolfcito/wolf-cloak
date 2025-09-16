/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Trading platform inspired color palette
        "trading-darkest": "#1A1A1A",     // Main dark background
        "trading-darker": "#212121",      // Darker background
        "trading-dark": "#2C2C2C",        // Card backgrounds
        "trading-sidebar": "#1E1E1E",     // Sidebar background
        "trading-panel": "#242424",       // Panel background
        "trading-text": "#FFFFFF",        // Primary text color
        "trading-text-muted": "#B0B0B0",  // Muted text color
        "trading-accent": "#00E676",      // Bright green accent
        "trading-red": "#FF5252",         // Red accent
        "trading-green": "#00E676",       // Success green
        "trading-yellow": "#FFC107",      // Warning yellow
        "trading-orange": "#FF9800",      // Orange accent
        "trading-purple": "#9C27B0",      // Purple accent
        "trading-pink": "#E91E63",        // Pink accent
        "trading-border": "#3A3A3A",      // Border color
        "trading-hover": "#3A3A3A",       // Hover state
        "trading-selected": "#404040",    // Selected state
        // Legacy colors for compatibility
        "chess-dark": "#2C2C2C",
        "chess-darker": "#212121",
        "chess-darkest": "#1A1A1A",
        "chess-sidebar": "#1E1E1E",
        "chess-panel": "#242424",
        "chess-text": "#FFFFFF",
        "chess-text-muted": "#B0B0B0",
        "chess-accent": "#00E676",
        "chess-red": "#FF5252",
        "chess-green": "#00E676",
        "chess-yellow": "#FFC107",
        "chess-orange": "#FF9800",
        "chess-purple": "#9C27B0",
        "chess-pink": "#E91E63",
        "chess-border": "#3A3A3A",
        "chess-hover": "#3A3A3A",
        "chess-selected": "#404040",
        "cloak-black": "#212121",
        "cloak-dark": "#2C2C2C",
        "cloak-blue": "#00E676",
        "cloak-purple": "#9C27B0",
        "cloak-gray": "#FFFFFF",
        "cloak-red": "#FF5252",
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
