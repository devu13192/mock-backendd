const express=  require("express")
const router  = express.Router()
const {getInterviewsByUserId,addUserInterview,deleteUserInterviewHistory}  = require("../controllers/userInterview.js")

router.get('/:id',getInterviewsByUserId)
router.post('/',addUserInterview)
router.post('/delete', deleteUserInterviewHistory)


module.exports = router;
