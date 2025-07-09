// vue.config.js
module.exports = {
  // ganti '/nama-subpath/' sesuai kebutuhan;
  // untuk root gunakan '/'
  publicPath: process.env.NODE_ENV === 'production'
    ? '/nama-subpath/'
    : '/'
}
