require("dotenv").config();

const vision = require("@google-cloud/vision");

module.exports = {
  classify: async (imgPath, callback) => {
    // Creates a client
    const client = new vision.ImageAnnotatorClient({
      keyFilename: process.env.GOOGLE_SERVICE_ACCOUNT,
    });

    // Performs label detection on the image file
    const [result] = await client.labelDetection(imgPath);
    const labels = result.labelAnnotations;
    callback(labels);
  },
};
