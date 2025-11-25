require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((error) => console.error("❌ Error:", error));

// Import models
const Task = require("./models/Task");
const Session = require("./models/Session");

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "FocusTools API",
    status: "Running",
    endpoints: {
      tasks: "/api/tasks",
      sessions: "/api/sessions",
      stats: "/api/stats",
      search: "/api/tasks/search?q=keyword"
    },
  });
});

// ============================================
// TASK ROUTES
// ============================================

// CREATE - Add a new task
app.post("/api/tasks", async (req, res) => {
  try {
    const task = new Task({
      title: req.body.title,
      completed: req.body.completed
    });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// EXTENSION 4A: Task Search - Search tasks by title
app.get("/api/tasks/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: "Search query 'q' is required" });
    }
    const tasks = await Task.find({
      title: { $regex: q, $options: 'i' }
    });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ ALL - Get all tasks (EXTENSION 1: with optional filtering & EXTENSION 4C: sorting)
app.get("/api/tasks", async (req, res) => {
  try {
    const { completed, sortBy, order } = req.query;
    
    // EXTENSION 1: Build filter for completion status
    let filter = {};
    if (completed !== undefined) {
      filter.completed = completed === 'true';
    }
    
    // EXTENSION 4C: Build sort options
    let sortOptions = {};
    if (sortBy) {
      const sortOrder = order === 'desc' ? -1 : 1;
      sortOptions[sortBy] = sortOrder;
    }
    
    const tasks = await Task.find(filter).sort(sortOptions);
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ ONE - Get a specific task
app.get("/api/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE - Modify a task
app.put("/api/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.status(200).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE - Remove a task
app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.status(200).json({
      message: "Task deleted successfully",
      task: task
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// EXTENSION 4B: Session History for a Task - Get all sessions for a specific task
app.get("/api/tasks/:id/sessions", async (req, res) => {
  try {
    const sessions = await Session.find({ taskId: req.params.id }).populate('taskId');
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// SESSION ROUTES
// ============================================

// CREATE - Log a completed Pomodoro session
app.post("/api/sessions", async (req, res) => {
  try {
    const session = new Session({
      taskId: req.body.taskId,
      duration: req.body.duration,
      startTime: req.body.startTime,
      completed: req.body.completed
    });
    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// READ ALL - Get all Pomodoro sessions (EXTENSION 3: with task details populated, EXTENSION 4C: with sorting)
app.get("/api/sessions", async (req, res) => {
  try {
    const { sortBy, order } = req.query;
    
    // EXTENSION 4C: Build sort options
    let sortOptions = {};
    if (sortBy) {
      const sortOrder = order === 'desc' ? -1 : 1;
      const sortField = sortBy === 'date' ? 'startTime' : sortBy;
      sortOptions[sortField] = sortOrder;
    }
    
    const sessions = await Session.find().sort(sortOptions).populate('taskId');
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// STATISTICS ROUTE
// ============================================

// EXTENSION 2: Session Statistics - Get productivity stats
app.get("/api/stats", async (req, res) => {
  try {
    const totalPomodoros = await Session.countDocuments();
    const durationResult = await Session.aggregate([
      {
        $group: {
          _id: null,
          totalSeconds: { $sum: "$duration" }
        }
      }
    ]);
    const totalMinutes = durationResult.length > 0 
      ? Math.round(durationResult[0].totalSeconds / 60) 
      : 0;
    
    const completedTasks = await Task.countDocuments({ completed: true });
    const activeTasks = await Task.countDocuments({ completed: false });
    
    res.status(200).json({
      totalPomodoros,
      totalMinutes,
      completedTasks,
      activeTasks
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
