const express=  require("express")
const router  = express.Router()
const {getInterviewsByUserId,addUserInterview,deleteUserInterviewHistory,getAllUserInterviews}  = require("../controllers/userInterview.js")

router.get('/all', getAllUserInterviews)
router.get('/:id',getInterviewsByUserId)
router.post('/',addUserInterview)
router.post('/delete', deleteUserInterviewHistory)


module.exports = router;
