import app from "./app"

const port = process.env['PORT'] || 8080;

app.listen(port, async function() {
	console.log("listening at http://localhost:" + port);
});