const { application } = require("express");
const v1Router = require("./v1");
const Express = require("express");

const Router = Express.Router();

Router.use("/v1", v1Router);

module.exports = Router;
