const express=  require("express")
const router  = express.Router()
const {getUser,addInterview,addUser,updateScore,listUsers,setActive}  = require("../controllers/users.js")

router.get('/:id',getUser)
router.post('/:id',addUser)
router.patch('/:id',addInterview)
router.patch('/score/:id',updateScore)
router.get('/',listUsers)
router.patch('/active/:id',setActive)

module.exports = router;
