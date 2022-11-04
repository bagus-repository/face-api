const uploadFile = require("../middleware/upload");
const faceService = require('../services/face.service')
const fs = require("fs")  

module.exports = {
  async detectFaces (req, res){
    try {
      await uploadFile(req, res);
      if (req.file == undefined) {
        return res.status(400).send({ message: "Upload a file please!" });
      }
      let result = await faceService.run(req.file.originalname);
      let isFaceDetected = result.length > 0;
      let facesDetected = result.length;

      if (isFaceDetected) {
        fs.unlink('./uploads/' + req.file.originalname, (err) => {if(err) throw err});
      }
      
      res.status(200).send({
        status: "OK",
        message: "The following file was uploaded successfully: " + req.file.originalname,
        data: {
          isFaceDetected: isFaceDetected,
          facesDetected: facesDetected
        }
      });
    } catch (err) {
      if (err.code == "LIMIT_FILE_SIZE") {
          return res.status(400).send({
            message: "File larger than 2MB cannot be uploaded!",
          });
        }
      res.status(500).send({
        message: `Unable to upload the file: ${req.file.originalname}. ${err}`,
      });
    }
  }
};