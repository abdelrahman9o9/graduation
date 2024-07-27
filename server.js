const app = require('./app');
const mongoose = require('mongoose');

const dbURL =
  //'mongodb+srv://a7med3del1973:nodejs123@cluster0.gkjci2o.mongodb.net/TukRide';
  'mongodb+srv://abdokanoon:vbdDrbXZ4uqh0s4u@cluster0.bjajwf5.mongodb.net/TukRide?retryWrites=true&w=majority&appName=Cluster0';
mongoose
  .connect(dbURL)
  //, {
  //   useNewUrlParser: true,
  //   useUnifiedTopology: true,
  // }
  .then(() => console.log('DB connection successful !'))
  .catch((err) => console.log('DB connection error : ', err));

const PORT = 8080;
app.listen(PORT, (req, res) => {
  console.log(`Server is running on port ${PORT} ..`);
});

//vbdDrbXZ4uqh0s4u
//abdokanoon
