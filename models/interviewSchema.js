const mongoose =require("mongoose")

const interviewSchema = mongoose.Schema({
  company:String,
  role:String,
  questions:Array,
  type:String,
  difficulty:{
    type:String,
    enum:['Easy', 'Medium', 'Hard'],
    default:'Medium'
  },
  count:{
    type:Number,
    default:0
  }
});


const InterviewSchema = mongoose.model('InterviewSchema',interviewSchema)

module.exports = InterviewSchema
