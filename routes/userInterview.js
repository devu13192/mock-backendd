const express=  require("express")
const router  = express.Router()
const {getInterviewsByUserId,addUserInterview}  = require("../controllers/userInterview.js")

router.get('/:id',getInterviewsByUserId)
router.post('/',addUserInterview)


module.exports = router;
