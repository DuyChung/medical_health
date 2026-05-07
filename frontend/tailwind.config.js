export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        medical: {
          50: "#ecfeff",
          100: "#cffafe",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
          900: "#164e63"
        }
      },
      boxShadow: {
        soft: "0 14px 50px rgba(8, 145, 178, 0.14)"
      }
    }
  },
  plugins: []
};
