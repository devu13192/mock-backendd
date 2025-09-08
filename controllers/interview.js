
const InterviewSchema = require("../models/interviewSchema.js")
const mongoose = require("mongoose")



exports.getInterviews = async (req,res) =>{
    
    const data = await InterviewSchema.find();
    res.send(data)
}
exports.addInterview = async(req,res) =>{
    const interview = req.body
    const newInterview= new InterviewSchema(interview)
    try {
        newInterview.save()
        res.status(201).json(newInterview);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }

}

exports.getInterviewById= async (req,res) =>{
    const id = req.params.id
    const data = await InterviewSchema.findById(id);
    res.send(data)
}

exports.updateCount= async (req,res) =>{
    const id = req.params.id
    const data = await InterviewSchema.findByIdAndUpdate(id, { $inc: { count: 1 } }, { new: true })
    .then((updatedInterview) => {
      // Handle the updated interview
      console.log(updatedInterview);
    })
    .catch((error) => {
      // Handle the error
      console.error(error);
    });
    res.send(data)
}

exports.updateInterview = async (req, res) => {
    const id = req.params.id;
    const updateData = req.body;
    
    try {
        const updatedInterview = await InterviewSchema.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true }
        );
        
        if (!updatedInterview) {
            return res.status(404).json({ message: "Interview not found" });
        }
        
        res.status(200).json(updatedInterview);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteInterview = async (req, res) => {
    const id = req.params.id;
    
    try {
        const deletedInterview = await InterviewSchema.findByIdAndDelete(id);
        
        if (!deletedInterview) {
            return res.status(404).json({ message: "Interview not found" });
        }
        
        res.status(200).json({ message: "Interview deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};