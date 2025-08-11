module.exports = {
  lintOnSave: false,
  devServer: {
    host: "localhost",
    port: 21091,
    https: false,
    proxy: {
      "/api/book-manage-sys-api": {
        target: "http://localhost:21090",
        changeOrigin: true
      }
    },
    overlay: {
      warning: false,
      errors: false
    }
  }
};
