const uploadFile = require("../middleware/upload");
const faceService = require('../services/face.service')
const fs = require("fs")  

module.exports = {
  async testDataSets (req, res){
    try {
      const dirPath = './datasets/20221030/';
      const resultDirPath = './datasets/result/';
      let failedCounter = 0;
      if (!fs.existsSync(resultDirPath)) {
        fs.mkdirSync(resultDirPath)
      }
      const dir = await fs.promises.opendir(dirPath);
      for await (const item of dir){
        if (item.isFile()) {
          let result = await faceService.run(dirPath + item.name);
          if (result.length < 1) {
            failedCounter += 1;
            fs.copyFile(dirPath + item.name, resultDirPath + item.name, (err) => {
              if(err) throw err
            });
          }
        }
      }
      res.status(200).send({
        status: "OK",
        message: "Run test on datasets successfully, failed counter " + failedCounter,
      });
    } catch (err) {
      res.status(500).send({
        message: `Unable to test datasets: ${err}`,
      });
    }
  },
  async detectFaces (req, res){
    try {
      let dirPath = './uploads/';
      await uploadFile(req, res);
      if (req.file == undefined) {
        return res.status(400).send({ message: "Upload a file please!" });
      }
      let result = await faceService.run(dirPath + req.file.originalname);
      let isFaceDetected = result.length > 0;
      let facesDetected = result.length;

      if (isFaceDetected) {
        fs.unlink(dirPath + req.file.originalname, (err) => {if(err) throw err});
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