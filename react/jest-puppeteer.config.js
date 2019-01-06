module.exports = {
  server: {
    command: 'yarn start',
    port: 3000
  },
  launch: {
    dumpio: false,
    headless: process.env.HEADLESS !== 'false'
  },
  browserContext: 'default'
}
