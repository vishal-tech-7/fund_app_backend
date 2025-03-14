require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth'); 

const app = express();
app.use(express.json());


app.use(cors({ origin: 'https://fund-app-frontend-a4iv.onrender.com', credentials: true }));


const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/fund_db';


mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1); 
  });


app.use('/api/auth', authRoutes);


app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


process.on('SIGINT', async () => {
  console.log('❗ Server shutting down...');
  await mongoose.connection.close();
  process.exit(0);
});
