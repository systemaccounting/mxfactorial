module.exports = {
  server: {
    command: 'yarn start:env',
    port: 3000,
    launchTimeout: 30000
  },
  launch: {
    dumpio: false,
    headless: process.env.HEADLESS !== 'false'
  },
  browserContext: 'default'
}
