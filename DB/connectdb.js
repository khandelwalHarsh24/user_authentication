const mongoose=require('mongoose');
mongoose.set('strictQuery', false);

const connectdb=(url)=>{
    return mongoose.connect(url);
}

module.exports=connectdb