const express=  require("express")
const router  = express.Router()
const {getInterviews,addInterview,getInterviewById,updateCount,updateInterview,deleteInterview,seedInterviews,seedReplaceSix,normalizeTypes,cleanupAllOrphanedUserInterviews}  = require("../controllers/interview.js")

router.get('/',getInterviews)
router.post('/',addInterview)
router.get('/:id',getInterviewById)
router.put('/:id',updateCount)
router.put('/:id/update',updateInterview)
router.delete('/:id',deleteInterview)
router.post('/seed/multi-company', seedInterviews)
router.post('/seed/replace-six', seedReplaceSix)
router.post('/normalize-types', normalizeTypes)
router.post('/cleanup-orphaned', cleanupAllOrphanedUserInterviews)

module.exports = router;
