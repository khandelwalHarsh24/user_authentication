const express=require('express');
const router=express.Router();
const authMiddleware = require('../middleware/authMiddleware'); 

const {allUser,userRegister,loginUser, getUser,updateUser,deleteUser,logOutUser}=require('../controller/userController')

router.route('/alluser').get(allUser);
router.route('/register').post(userRegister);
router.route('/login').post(loginUser);
router.route('/details').get(authMiddleware,getUser)
router.route('/update').put(authMiddleware,updateUser);
router.route('/delete').delete(authMiddleware,deleteUser)
router.route('/logout').post(authMiddleware,logOutUser);

module.exports=router;