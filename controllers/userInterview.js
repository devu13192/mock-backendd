const UserInterviewSchema = require("../models/userInterviewSchema.js")
const mongoose = require("mongoose")


exports.getInterviewsByUserId = async (req,res) =>{
    const id = req.params.id
    const data = await UserInterviewSchema.find({ uid:id}).then((interviews) => {
        // Send the retrieved interviews as the response
        res.json(interviews);
      })
      .catch((error) => {
        // Handle the error
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
      });
}

exports.addUserInterview = async(req,res) =>{
    const interview = req.body
    const newInterview= new UserInterviewSchema(interview)
    try {
        newInterview.save()
        res.status(201).json(newInterview);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }

}