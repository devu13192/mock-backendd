const express=  require("express")
const router  = express.Router()
const {getUser,addInterview,addUser,updateScore,listUsers,setActive,setPhotoURL}  = require("../controllers/users.js")
const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage() })

router.get('/:id',getUser)
router.post('/:id',addUser)
router.patch('/:id',addInterview)
router.patch('/score/:id',updateScore)
router.get('/',listUsers)
router.patch('/active/:id',setActive)
// Accept multipart/form-data file as 'avatar' or JSON { photoURL }
router.patch('/photo/:id', upload.single('avatar'), setPhotoURL)

module.exports = router;
