module.exports = {
  server: {
    command: 'NODE_PATH=./src react-scripts start',
    port: 3000
  },
  launch: {
    dumpio: false,
    headless: process.env.HEADLESS !== 'false'
  },
  browserContext: 'default'
}
