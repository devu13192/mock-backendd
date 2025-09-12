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

// Get all user interviews (for cleanup purposes)
exports.getAllUserInterviews = async (req, res) => {
    try {
        const data = await UserInterviewSchema.find({});
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
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

// Delete all user interview history rows that match given filters
// Accepts optional uid/company/role/type; if none provided, 400
exports.deleteUserInterviewHistory = async (req, res) => {
    try {
        const { uid, company, role, type } = req.body || {}
        if (!uid && !company && !role && !type) {
            return res.status(400).json({ message: 'Provide at least one filter: uid, company, role, or type' })
        }
        const filter = {}
        if (uid) filter.uid = uid
        if (company) filter.company = company
        if (role) filter.role = role
        if (type) filter.type = type
        const result = await UserInterviewSchema.deleteMany(filter)
        return res.status(200).json({ message: 'Deleted user interview history', deletedCount: result?.deletedCount || 0 })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}