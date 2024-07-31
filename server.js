const app = require('./app');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const dbURL =
  'mongodb+srv://abdokanoon:vbdDrbXZ4uqh0s4u@cluster0.bjajwf5.mongodb.net/TukRide?retryWrites=true&w=majority&appName=Cluster0';
mongoose
  .connect(dbURL, {
    // useNewUrlParser: true,
    //  useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connection successful !');
    const PORT = 8080;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} ..`);
    });
  })
  .catch((err) => {
    console.error('DB connection error : ', err);
  });
