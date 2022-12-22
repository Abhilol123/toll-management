const Express = require("express");
const tollRouter = require("./Toll");

const v1Router = Express.Router();

v1Router.use("/toll", tollRouter);

module.exports = v1Router;
