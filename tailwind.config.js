/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Discord-inspired color palette
        "discord-dark": "#2C2F33",      // Main dark background
        "discord-darker": "#23272A",    // Darker background for panels
        "discord-darkest": "#1E2124",   // Darkest background
        "discord-sidebar": "#2F3136",   // Sidebar background
        "discord-channel": "#36393F",   // Channel background
        "discord-text": "#DCDDDE",      // Primary text color
        "discord-text-muted": "#72767D", // Muted text color
        "discord-accent": "#5865F2",    // Discord's signature purple/blue
        "discord-red": "#ED4245",       // Discord red for notifications
        "discord-green": "#3BA55C",     // Online status green
        "discord-yellow": "#FAA61A",    // Warning/boost yellow
        "discord-orange": "#FF6B35",    // Orange accent
        "discord-purple": "#9C84EF",    // Purple accent
        "discord-pink": "#F47B68",      // Pink accent
        "discord-border": "#40444B",    // Border color
        "discord-hover": "#40444B",     // Hover state
        "discord-selected": "#393C43",  // Selected state
        // Legacy colors for compatibility
        "cloak-black": "#1E2124",
        "cloak-dark": "#2C2F33",
        "cloak-blue": "#5865F2",
        "cloak-purple": "#9C84EF",
        "cloak-gray": "#DCDDDE",
        "cloak-red": "#ED4245",
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
