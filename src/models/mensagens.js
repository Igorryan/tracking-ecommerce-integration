const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    hawb: {
      type: String,
      unique: true,
    },
    evento: String,
  },
);

const Message = mongoose.model("Mensagens", MessageSchema);

module.exports = Message;
