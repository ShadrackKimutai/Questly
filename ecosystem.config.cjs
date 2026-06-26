module.exports = {
  apps: [
    {
      name: "questly-socket",
      script:
        "/home/shady/Dev/devilbox/data/www/questly.co/packages/socket/dist/index.cjs",
      env: {
        NODE_ENV: "production",
        CONFIG_PATH: "/home/shady/Dev/devilbox/data/www/questly.co/config",
      },
    },
  ],
}
