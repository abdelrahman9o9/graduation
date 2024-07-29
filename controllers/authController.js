const jwt = require('jsonwebtoken');
const Driver = require('../models/driverModel');

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'You are not logged in!' });
    }

    console.log('Token:', token); // Log the token to check its format

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentDriver = await Driver.findById(decoded.id);
    if (!currentDriver) {
      return res.status(401).json({ message: 'The driver no longer exists.' });
    }

    req.driver = currentDriver;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error protecting route.', error });
    console.log(error);
  }
};
