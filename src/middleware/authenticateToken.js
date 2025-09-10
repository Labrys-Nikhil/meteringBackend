// const jwt = require('jsonwebtoken');

// function authenticateToken(req, res, next) {
//   try {
//     const authHeader = req.headers['authorization'];

//     if (!authHeader) {
//       console.error('Authorization header missing');
//       return res.status(401).json({ message: 'Access denied: No auth header' });
//     }

//     const token = authHeader.split(' ')[1];

//     if (!token) {
//       console.error('Token not found in auth header:', authHeader);
//       return res.status(401).json({ message: 'Access denied: Token missing' });
//     }

//     console.log('Checking token...');
//     const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
// console.log("====req.user",req.user)
//     req.user = decoded;

//     next();
//   } catch (err) {
//     console.error('Token verification failed:', err.message);
//     res.status(403).json({ message: 'Invalid or expired token' });
//   }
// };

// module.exports = { authenticateToken };















//  const jwt = require('jsonwebtoken');


// const User = require("../model/User");
// require("dotenv").config();
// function authenticateToken(req, res, next) {
//   try {
//     const authHeader = req.headers['authorization'];

//     if (!authHeader) {
//       console.error('Authorization header missing');
//       return res.status(401).json({ message: 'Access denied: No auth header' });
//     }

//     const token = authHeader.split(' ')[1];

//     if (!token) {
//       console.error('Token not found in auth header:', authHeader);
//       return res.status(401).json({ message: 'Access denied: Token missing' });
//     }

//     console.log('Checking token...');
//     const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//         // Fetch user to ensure they still exist
//     const user = User.findById(decoded.id);
//     if (!user) {
//       return res.status(401).json({ message: "User not found" });
//     }

//     console.log("==req.userID= req.userRole= req.user",req,req.id, req.role, req.user,)

//     req.userID = decoded.id;
//     req.userRole = decoded.role;
//     req.user = user;
//     next();
//   } catch (err) {
//     console.error('Token verification failed:', err.message);
//     res.status(403).json({ message: 'Invalid or expired token' });
//   }
// };

// module.exports = { authenticateToken };




const jwt = require("jsonwebtoken");
const User = require("../model/User");
require("dotenv").config();


const authenticateToken = async (req, res, next) => {
    try {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Bearer token is missing" });
  }

  const token = authHeader.split(" ")[1];
      if (!token) {
      console.error('Token not found in auth header:', authHeader);
      return res.status(401).json({ message: 'Access denied: Token missing' });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
    // Fetch user to ensure they still exist
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.userID = decoded.id;
    req.userRole = decoded.role;
    req.user = user;
    next();
  } catch (error) {
    console.error("Token Verification Error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

 module.exports = { authenticateToken };