const throng = require("throng");
const worker = require("./app/src/jobs/executer");

throng({ workers: 1, lifetime: Infinity }, worker);
