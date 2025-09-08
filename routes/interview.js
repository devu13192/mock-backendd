const express=  require("express")
const router  = express.Router()
const {getInterviews,addInterview,getInterviewById,updateCount,updateInterview,deleteInterview}  = require("../controllers/interview.js")

router.get('/',getInterviews)
router.post('/',addInterview)
router.get('/:id',getInterviewById)
router.put('/:id',updateCount)
router.put('/:id/update',updateInterview)
router.delete('/:id',deleteInterview)

module.exports = router;
