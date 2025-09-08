
const UserSchema = require("../models/userSchema.js")
const mongoose = require("mongoose")


exports.getUser = async (req,res) =>{
    const id = req.params.id
    await UserSchema.findOne({id:id}).then((docs)=>{
        res.send(docs)
    }).catch((err)=>{
        res.send("user not found")
    })
    
}
exports.addUser = async(req,res) =>{
    const id = req.params.id
    const user = {id:id}
    UserSchema.findOne({id:id}).then((docs)=>{
        if(docs!==null){
            res.send("User already exists")
        }
        else{
            const newUser= new UserSchema(user)
        try {
            newUser.save()
            res.status(201).json(newUser);
        } catch (error) {
            res.status(409).json({ message: error.message });
        }
        }
    }).catch((err)=>{
        res.send(err)
    })

}

exports.addInterview= async (req,res) =>{
    const id = req.params.id
    const interviewId = req.body
    UserSchema.findOneAndUpdate({id:id}, { interviews: {...interviews,interviewId}},
                            function (err, docs) {
    if (err){
        console.log(err)
    }
    else{
        console.log("Updated User : ", docs);
    }
});
}
exports.updateScore= async (req,res) =>{
    const id = req.params.id
    const {score} = req.body
    UserSchema.findOneAndUpdate({id:id}, { $inc:{'score':score} },{new:true}).then((response)=>{
        res.send(response)
    }).catch((err)=>{
        res.send(err)
    });
}