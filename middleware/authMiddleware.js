const jwt = require('jsonwebtoken');
const userSchema=require('../model/userModel');

const authMiddleware=async(req,res,next)=>{
    const token =req.headers.authorization.replace('Bearer ', '');
    // console.log(token);
    if (!token) {
       return res.status(401).json({ message: 'Authorization token is missing' });
    }
    try {
        const decoded = jwt.verify(token, process.env.secret); 
        // console.log(decoded);

        const user = await userSchema.findById(decoded.id);
    
        if (!user) {
          return res.status(401).json({ message: 'Invalid token - User not found' });
        }
    
        // Attach the user object to the request for future use in the route
        req.user = user;
    
        // Continue to the next middleware or route handler
        next();
      } catch (error) {
        console.error(error);
        return res.status(401).json({ message: 'Invalid token' });
      }
}

module.exports=authMiddleware