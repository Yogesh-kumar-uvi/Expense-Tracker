const mongoose = require('mongoose');
// To prepare for Mongoose 7, set strictQuery to false
mongoose.set('strictQuery', false);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error(`Error: ${err.message}`);
    // For now, we throw the error so the server knows the connection failed.
    // In a real app, you might want to retry or exit.
    throw err;
  }
};

module.exports = connectDB;