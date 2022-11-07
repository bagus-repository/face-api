const express = require("express");
const router = express.Router();
const {faceDetection} = require("../controller");

router.post("/detectfaces", faceDetection.detectFaces);
router.post("/rundatasets", faceDetection.testDataSets);
router.get("/hello", (req, res) => {
  return res.json("Hello World");
});
module.exports = router