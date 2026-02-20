/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                glass: {
                    100: 'rgba(255, 255, 255, 0.1)',
                    200: 'rgba(255, 255, 255, 0.2)',
                    300: 'rgba(255, 255, 255, 0.3)',
                    900: 'rgba(0, 0, 0, 0.6)', // Dark glass
                },
                primary: '#6366f1', // Indigo
                secondary: '#ec4899', // Pink
            },
            backdropBlur: {
                xs: '2px',
            }
        },
    },
    plugins: [],
}
