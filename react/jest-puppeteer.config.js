module.exports = {
  server: {
    command: `bash start.sh ${process.env.LOCAL_ENV}`,
    port: 3000
  },
  launch: {
    dumpio: false,
    headless: process.env.HEADLESS !== 'false'
  },
  browserContext: 'default'
}
