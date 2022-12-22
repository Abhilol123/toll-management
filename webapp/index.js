const Express = require("express");
const BodyParser = require("body-parser");
const CookieParser = require("cookie-parser");
const Cors = require("cors");
const Router = require("./Router");

const app = Express();

app.use(CookieParser());

app.use(BodyParser.urlencoded({
	limit: '1MB',
	extended: true
}));

app.use(BodyParser.json({ limit: '1MB' }));

app.use(Cors());

const NODEJS_PORT = process.env.NODEJS_PORT ?? "9000";

/**
 * Use express router to organise API end points and versioning.
 */
app.use("/", Router);

process.once('SIGINT', () => {
	return process.emit('cleanup_and_exit');
});

process.once('SIGTERM', () => {
	return process.emit('cleanup_and_exit');
});

app.listen(NODEJS_PORT, () => {
	return console.log(`Listening to requests on http://localhost:${NODEJS_PORT}`);
});
