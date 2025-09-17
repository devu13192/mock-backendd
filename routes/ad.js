const express = require('express')
const ctrl = require('../controllers/ad.js')
const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage() })
const router = express.Router()

router.get('/', ctrl.listAds)
router.get('/all', ctrl.listAllAds)
router.post('/', ctrl.createAd)
router.put('/:id', ctrl.updateAd)
router.delete('/:id', ctrl.deleteAd)
router.post('/upload', upload.single('file'), ctrl.uploadImage)

module.exports = router


