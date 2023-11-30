const userSchema = require("../model/userModel");
const jwt=require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const tokenBlacklist = new Set();

const validateUserDetails = (data) => {
    const { name, username,bio, age } = data;
    
    if (name && typeof name !== 'string') {
      return 'Name must be a string';
    }

    if(username && typeof username!=='string'){
        return 'Username must be a string'
    }
  
    if (bio && typeof bio !== 'string') {
      return 'Bio must be a string';
    }
  
    if (age && (typeof age !== 'number' || age < 0)) {
      return 'Age must be a non-negative number';
    }
  
    return null; // Validation passed
};

const allUser=async(req,res)=>{
    const user=await userSchema.find().select('-password');
    if(!user){
        res.status(400).json({"message":"No User Exist"});
    }
    res.status(200).json(user);
}

const userRegister=async(req,res)=>{
    try {
        const {name,username,bio,age,password}=req.body;
        if (!name || !username || !bio || !age || !password) {
            return res.status(400).json({ message: 'Required fields are missing' });
        }
        if (typeof age !== 'number') {
            return res.status(400).json({ message: 'Age must be a number' });
        }
        if (username.length < 6 || username.length > 30) {
            return res.status(400).json({ message: 'Username must be between 6 and 30 characters' });
        }
        if (password.length < 8 || password.length > 50) {
            return res.status(400).json({ message: 'Password must be between 8 and 50 characters' });
        }
        const existingUser = await userSchema.findOne({ username });
        if (existingUser) {
          return res.status(400).json({ message: 'Username is already taken' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new userSchema({
          name: name,
          username: username,
          password: hashedPassword,
          bio: bio,
          age: age
        });
        const savedUser = await newUser.save();
        res.status(200).json(savedUser);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
}

const loginUser=async(req,res)=>{
    try{
        const {username,password}=req.body;
        const secret=process.env.secret;
        if(!username || !password){
            return res.status(400).json({ message: 'Required fields are missing' });
        }
        const user=await userSchema.findOne({username});
        if(!user){
            return res.status(400).json({message:"User does not Exist"})
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid UserName or password.' });
        }
        const token = jwt.sign({ id: user.id, username: user.username }, secret, { expiresIn: '1h' });
        res.status(200).json({ userdata: user,token: token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

const getUser=async(req,res)=>{
    try{
        const loggedInUser = req.user;
        if (tokenBlacklist.has(req.headers.authorization)) {
            return res.status(401).json({ message: 'Token has already been invalidated' });
        }
        if (!loggedInUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        const userDetails = {
            name: loggedInUser.name,
            username: loggedInUser.username,
            bio: loggedInUser.bio,
            age: loggedInUser.age,
        };
        res.status(200).json(userDetails);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}


const updateUser=async(req,res)=>{
    try {
        const loggedInUser = req.user;
        if (tokenBlacklist.has(req.headers.authorization)) {
            return res.status(401).json({ message: 'Token has already been invalidated' });
        }
        const validationError = validateUserDetails(req.body);
        if (validationError) {
          return res.status(400).json({ message: validationError });
        }
        const username=req.body.username;
        const userDetails=await userSchema.findOne({username});
        if(userDetails){
            return res.status(400).json({"message":"Username already exist"})
        }
        const user = await userSchema.findByIdAndUpdate(
            loggedInUser.id,
            {
                name: req.body.name,
                username: req.body.username,
                bio: req.body.bio,
                age: req.body.age
            },
            {new: true}
        );
        res.status(200).json(user);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
}


const deleteUser=async(req,res)=>{
    try {
        const loggedInUser = req.user;
        if (tokenBlacklist.has(req.headers.authorization)) {
            return res.status(401).json({ message: 'Token has already been invalidated' });
        }
        const deletedUser = await userSchema.findByIdAndDelete(loggedInUser.id);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'Account deleted successfully' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
}


const logOutUser=async(req,res)=>{
    try {
        const loggedInUser = req.user;
        if (tokenBlacklist.has(req.headers.authorization)) {
            return res.status(401).json({ message: 'Token has already been invalidated' });
        }
        const updatedUser = await userSchema.findByIdAndUpdate(loggedInUser.id, { token: null }, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        tokenBlacklist.add(req.headers.authorization);
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
module.exports={allUser,userRegister,loginUser,getUser,updateUser,deleteUser,logOutUser};