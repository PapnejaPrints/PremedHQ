const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/premed-hq', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Course Schema
const courseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  grade: { type: String, required: true },
  credits: { type: Number, required: true },
  semester: { type: String, required: true },
  year: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Activity Schema
const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  organization: { type: String, required: true },
  hours: { type: Number, required: true },
  description: { type: String, required: true },
  tags: [String],
  journalEntries: [{
    title: String,
    content: String,
    date: Date,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

// Test Schema
const testSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  date: { type: Date, required: true },
  score: String,
  status: { type: String, default: 'Scheduled' },
  notes: String,
  sections: {
    type: Map,
    of: String
  },
  createdAt: { type: Date, default: Date.now }
});

// Application Schema
const applicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  school: { type: String, required: true },
  status: { type: String, default: 'Not Started' },
  deadline: Date,
  interviewDate: Date,
  notes: String,
  requirements: {
    type: Map,
    of: String
  },
  createdAt: { type: Date, default: Date.now }
});

// Journal Schema
const journalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Timeline Schema
const timelineSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  date: { type: Date, required: true },
  description: { type: String, required: true },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Models
const User = mongoose.model('User', userSchema);
const Course = mongoose.model('Course', courseSchema);
const Activity = mongoose.model('Activity', activitySchema);
const Test = mongoose.model('Test', testSchema);
const Application = mongoose.model('Application', applicationSchema);
const Journal = mongoose.model('Journal', journalSchema);
const Timeline = mongoose.model('Timeline', timelineSchema);

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.userId = user.id;
    next();
  });
};

// Auth Routes
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      user: { id: user._id, name: user.name, email: user.email },
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      user: { id: user._id, name: user.name, email: user.email },
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Course Routes
app.get('/api/courses', authenticateToken, async (req, res) => {
  try {
    const courses = await Course.find({ userId: req.userId });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/courses', authenticateToken, async (req, res) => {
  try {
    const course = new Course({
      ...req.body,
      userId: req.userId
    });
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/courses/:id', authenticateToken, async (req, res) => {
  try {
    const course = await Course.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.delete('/api/courses/:id', authenticateToken, async (req, res) => {
  try {
    const course = await Course.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Activity Routes
app.get('/api/activities', authenticateToken, async (req, res) => {
  try {
    const activities = await Activity.find({ userId: req.userId });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/activities', authenticateToken, async (req, res) => {
  try {
    const activity = new Activity({
      ...req.body,
      userId: req.userId
    });
    await activity.save();
    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/activities/:id', authenticateToken, async (req, res) => {
  try {
    const activity = await Activity.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.delete('/api/activities/:id', authenticateToken, async (req, res) => {
  try {
    const activity = await Activity.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Test Routes
app.get('/api/tests', authenticateToken, async (req, res) => {
  try {
    const tests = await Test.find({ userId: req.userId });
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/tests', authenticateToken, async (req, res) => {
  try {
    const test = new Test({
      ...req.body,
      userId: req.userId
    });
    await test.save();
    res.status(201).json(test);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/tests/:id', authenticateToken, async (req, res) => {
  try {
    const test = await Test.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    res.json(test);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.delete('/api/tests/:id', authenticateToken, async (req, res) => {
  try {
    const test = await Test.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    res.json({ message: 'Test deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Application Routes
app.get('/api/applications', authenticateToken, async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.userId });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/applications', authenticateToken, async (req, res) => {
  try {
    const application = new Application({
      ...req.body,
      userId: req.userId
    });
    await application.save();
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/applications/:id', authenticateToken, async (req, res) => {
  try {
    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.delete('/api/applications/:id', authenticateToken, async (req, res) => {
  try {
    const application = await Application.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Journal Routes
app.get('/api/journal', authenticateToken, async (req, res) => {
  try {
    const journal = await Journal.find({ userId: req.userId });
    res.json(journal);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/journal', authenticateToken, async (req, res) => {
  try {
    const entry = new Journal({
      ...req.body,
      userId: req.userId
    });
    await entry.save();
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/journal/:id', authenticateToken, async (req, res) => {
  try {
    const entry = await Journal.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }
    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.delete('/api/journal/:id', authenticateToken, async (req, res) => {
  try {
    const entry = await Journal.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }
    res.json({ message: 'Journal entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Timeline Routes
app.get('/api/timeline', authenticateToken, async (req, res) => {
  try {
    const timeline = await Timeline.find({ userId: req.userId });
    res.json(timeline);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/timeline', authenticateToken, async (req, res) => {
  try {
    const event = new Timeline({
      ...req.body,
      userId: req.userId
    });
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/timeline/:id', authenticateToken, async (req, res) => {
  try {
    const event = await Timeline.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!event) {
      return res.status(404).json({ message: 'Timeline event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.delete('/api/timeline/:id', authenticateToken, async (req, res) => {
  try {
    const event = await Timeline.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!event) {
      return res.status(404).json({ message: 'Timeline event not found' });
    }
    res.json({ message: 'Timeline event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Dashboard data endpoint
app.get('/api/dashboard', authenticateToken, async (req, res) => {
  try {
    const courses = await Course.find({ userId: req.userId });
    const activities = await Activity.find({ userId: req.userId });
    const tests = await Test.find({ userId: req.userId });
    const applications = await Application.find({ userId: req.userId });
    const journal = await Journal.find({ userId: req.userId });
    const timeline = await Timeline.find({ userId: req.userId });

    res.json({
      courses,
      activities,
      tests,
      applications,
      journal,
      timeline
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;