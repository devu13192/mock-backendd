const mongoose =require("mongoose")

const userInterviewSchema = mongoose.Schema({
  uid:String,
  company:String,
  role:String,
  type:String,
  score:Number,
  feedback:String
});


const UserInterviewSchema = mongoose.model('UserInterviewSchema',userInterviewSchema)

module.exports = UserInterviewSchema
