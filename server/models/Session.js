const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true
    },
    duration: {
      type: Number,
      required: true,
      min: 1
    },
    completed: {
      type: Boolean,
      default: true
    },
    startTime: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Session = mongoose.model("Session", sessionSchema);
module.exports = Session;
