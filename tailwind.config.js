/** Past Enlighten – Tailwind CSS v3 build config.
 *  Build the site stylesheet after changing classes in any page or script:
 *    npx tailwindcss@3.4.17 -c tailwind.config.js -i css/tw-src.css -o css/tw.css --minify
 */
module.exports = {
  content: ['./*.html', './tours/*.html', './blog/*.html', './js/*.js'],
  theme: {
    extend: {
      colors: {
        brand: { 950: '#061a14', 900: '#0a261e', 800: '#0f382c', 700: '#164e3f', 600: '#1e6b57', 500: '#28886f', 100: '#e5f3ee', 50: '#f2f9f6' },
        accent: { gold: '#d97706', amber: '#f59e0b', light: '#fef3c7', dark: '#b45309' },
        warmgray: '#f8faf9'
      },
      fontFamily: {
        cinzel: ['"Cinzel"', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        urdu: ['"Noto Nastaliq Urdu"', '"Jameel Noori Nastaleeq"', 'serif']
      }
    }
  }
};
