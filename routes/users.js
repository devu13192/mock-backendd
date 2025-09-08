const express=  require("express")
const router  = express.Router()
const {getUser,addInterview,addUser,updateScore}  = require("../controllers/users.js")

router.get('/:id',getUser)
router.post('/:id',addUser)
router.patch('/:id',addInterview)
router.patch('/score/:id',updateScore)

module.exports = router;
