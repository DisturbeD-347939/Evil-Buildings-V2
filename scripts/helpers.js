const fs = require("fs");
const path = require("path");
const request = require("request");

let imgFormats = ["jpeg", "jpg", "png"];

module.exports = {
  getImgFormat: (url, callback) => {
    let valid = url.match(/\.(jpeg|jpg|png)$/) != null;
    if (valid) {
      let format = url.split(/[#?]/)[0].split(".").pop().trim();
      module.exports.contains(imgFormats, format, (res) => {
        if (res) {
          callback(format);
          return;
        } else {
          callback(false);
          return;
        }
      });
    } else {
      callback(false);
      return;
    }
  },
  downloadImg: (url, path, callback) => {
    request.head(url, function (err, res, body) {
      request(url).pipe(fs.createWriteStream(path)).on("close", callback);
    });
  },
  contains: (pattern, target, callback) => {
    if (pattern.indexOf(target.toLowerCase()) > -1) {
      callback(true);
    } else {
      callback(false);
    }
  },
  getBase64Img: (path, callback) => {
    callback(fs.readFileSync(path, { encoding: "base64" }));
  },
  getDirectories: (srcpath, callback) => {
    callback(
      fs
        .readdirSync(srcpath)
        .map((file) => path.join(srcpath, file))
        .filter((path) => fs.statSync(path).isDirectory())
    );
  },
};
