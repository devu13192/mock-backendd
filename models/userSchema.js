const mongoose =require("mongoose")

const userSchema = mongoose.Schema({
    id:String,
    score:{
        type:Number,
        default:0
    }
});


const UserSchema = mongoose.model('UserSchema',userSchema)

module.exports = UserSchema
