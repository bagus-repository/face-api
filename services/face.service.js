const tf = require('@tensorflow/tfjs-node')
console.log(`init tf version ${tf.version_core}`)
const faceapi = require("@vladmandic/face-api")  
const canvas = require("canvas")  
const fs = require("fs")

// mokey pathing the faceapi canvas
const { Canvas, Image, ImageData } = canvas  
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })

const faceDetectionNet = faceapi.nets.ssdMobilenetv1

// SsdMobilenetv1Options
const minConfidence = 0.5

// TinyFaceDetectorOptions
const inputSize = 408  
const scoreThreshold = 0.5

// MtcnnOptions
const minFaceSize = 50  
const scaleFactor = 0.8

function getFaceDetectorOptions(net) {  
    return net === faceapi.nets.ssdMobilenetv1
        ? new faceapi.SsdMobilenetv1Options({ minConfidence })
        : (net === faceapi.nets.tinyFaceDetector
            ? new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold })
            : new faceapi.MtcnnOptions({ minFaceSize, scaleFactor })
        )
}

const faceDetectionOptions = getFaceDetectorOptions(faceDetectionNet)

async function image(input){
 // read input image file and create tensor to be used for processing
 let buffer;
 buffer = fs.readFileSync(input);

 // decode image using tfjs-node so we don't need external depenencies
 // can also be done using canvas.js or some other 3rd party image library
 if (!buffer) return {};
 const tensor = tf.tidy(() => {
   const decode = faceapi.tf.node.decodeImage(buffer, 3);
   let expand;
   if (decode.shape[2] === 4) { // input is in rgba format, need to convert to rgb
     const channels = faceapi.tf.split(decode, 4, 2); // tf.split(tensor, 4, 2); // split rgba to channels
     const rgb = faceapi.tf.stack([channels[0], channels[1], channels[2]], 2); // stack channels back to rgb and ignore alpha
     expand = faceapi.tf.reshape(rgb, [1, decode.shape[0], decode.shape[1], 3]); // move extra dim from the end of tensor and use it as batch number instead
   } else {
     expand = faceapi.tf.expandDims(decode, 0);
   }
   const cast = faceapi.tf.cast(expand, 'float32');
   return cast;
 });
 return tensor;
}

module.exports = {
    async run(filePath) {
        await faceapi.tf.setBackend("tensorflow");
        await faceapi.tf.enableProdMode();
        await faceapi.tf.ENV.set("DEBUG", false);
        await faceapi.tf.ready();

        // load weights
        await faceDetectionNet.loadFromDisk('./weights')
        
    
        // load the image
        // const img = await canvas.loadImage('./uploads/' + filePath)
        const img = await image(filePath);
        
        // detect the faces with landmarks
        const results = await faceapi.detectAllFaces(img, faceDetectionOptions);
        
        img.dispose();
        return results;
    }
}