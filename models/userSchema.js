const mongoose =require("mongoose")

const userSchema = mongoose.Schema({
    id:String,
    email:{
        type:String,
        default:''
    },
    photoURL:{
        type:String,
        default:''
    },
    score:{
        type:Number,
        default:0
    },
    active:{
        type:Boolean,
        default:true
    },
    createdAt:{
        type:Date,
        default: () => new Date()
    }
});


const UserSchema = mongoose.model('UserSchema',userSchema)

module.exports = UserSchema
