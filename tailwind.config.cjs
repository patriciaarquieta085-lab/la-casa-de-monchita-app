module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#0a0a0a",
          gold: "#D4AF37",
          gold2: "#B08D28",
          muted: "#131313",
        }
      },
      boxShadow: {
        gold: "0 10px 25px -10px rgba(212,175,55,0.45)",
      }
    },
  },
  plugins: [],
}