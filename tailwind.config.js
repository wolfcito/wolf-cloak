/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Chess board inspired color palette
        "chess-dark": "#2C303A",        // Main dark background (chess board blue)
        "chess-darker": "#22252D",      // Darker background (chess board black)
        "chess-darkest": "#1A1D23",     // Darkest background
        "chess-sidebar": "#2A2E36",     // Sidebar background
        "chess-panel": "#323640",       // Panel background
        "chess-text": "#E8E9EA",        // Primary text color
        "chess-text-muted": "#8A8D94",  // Muted text color
        "chess-accent": "#4D94FF",      // Chess blue accent
        "chess-red": "#FF4D4D",         // Chess red accent
        "chess-green": "#4CAF50",       // Success green
        "chess-yellow": "#FFC107",      // Warning yellow
        "chess-orange": "#FF9800",      // Orange accent
        "chess-purple": "#9C27B0",      // Purple accent
        "chess-pink": "#E91E63",        // Pink accent
        "chess-border": "#3A3E47",      // Border color
        "chess-hover": "#3A3E47",       // Hover state
        "chess-selected": "#404550",    // Selected state
        // Legacy colors for compatibility
        "cloak-black": "#22252D",
        "cloak-dark": "#2C303A",
        "cloak-blue": "#4D94FF",
        "cloak-purple": "#9C27B0",
        "cloak-gray": "#E8E9EA",
        "cloak-red": "#FF4D4D",
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
