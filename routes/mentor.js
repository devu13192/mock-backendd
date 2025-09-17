const express = require("express");
const mentorController = require("../controllers/mentor.js");

const router = express.Router();

// Mentor routes
router.post("/", mentorController.addMentor);
router.get("/", mentorController.listMentors);
router.get("/:id", mentorController.getMentor);
router.put("/:id", mentorController.updateMentor);
router.delete("/:id", mentorController.deleteMentor);
router.patch("/:id/status", mentorController.updateMentorStatus);
router.get("/test/email", mentorController.testEmail);

module.exports = router;
