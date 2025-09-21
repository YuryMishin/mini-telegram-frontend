module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    // Дополнительные плагины для оптимизации CSS
    ...(process.env.NODE_ENV === 'production' && {
      cssnano: {
        preset: 'default',
      },
    }),
  },
}
