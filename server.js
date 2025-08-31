const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser'); 


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware

app.use(bodyParser.json());
// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully!');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

// Import and use routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/professors', require('./routes/professors'));
app.use('/api/students', require('./routes/students'));

// This is the main change: We only start the server if the file is run directly.
// This is crucial for testing, as Jest will handle the server's lifecycle.
if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  });
}

// We export the app so that Supertest can import and use it for testing.
module.exports = app;