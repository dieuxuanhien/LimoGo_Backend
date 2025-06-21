const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const app = express();

const authRouter = require('./routers/authRouter');
const userRouter = require('./routers/userRouter');
const adminRouter = require('./routers/adminRouter');
const { adminOnly, loggedin } = require('./middlewares/identification');

const tripRouter = require('./routers/tripRouter');


app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});


app.use('/admin', adminRouter);
app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/api/trips', tripRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

app.listen(process.env.PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});


