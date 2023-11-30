const mongoose=require('mongoose');

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    username: {
        type: String,
        unique: true,
        required: true
    },
    bio: {
        type: String
    },
    age: {
        type: Number
    },
    password: {
        type: String,
        required: true
    }
})


userSchema.virtual('id').get(function (){
    return this._id.toHexString();
})

userSchema.set('toJSON',{
    virtuals:true,
})


module.exports=mongoose.model('User',userSchema);