const mongoose = require("mongoose");

const Message = require("./mensagens");

function connectDb() {
  function disconnectDb() {
    mongoose.connection.close(function () {
      console.log(
        "Mongoose default connection is disconnected due to application termination"
      );
      process.exit(0);
    });
  }
  process.on("SIGINT", function () {
    disconnectDb();
  });

  process.on("SIGTERM", function () {
    disconnectDb();
  });

  process.on("SIGHUP", function () {
    disconnectDb();
  });

  process.on("SIGBREAK", function () {
    disconnectDb();
  });

  mongoose.set('useCreateIndex', true);

  return mongoose.connect(process.env.MONGODB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  });
}

const models = { Message };

module.exports = { models, connectDb };
