const fs = require("fs");

const datasetPath = __dirname + "/../world-cities.json";

module.exports = {
  get: (string, callback) => {
    let data = fs.readFileSync(datasetPath);

    data = JSON.parse(data);

    string = string.toLowerCase();

    for (let i = 0; i < Object.keys(data).length; i++) {
      if (new RegExp("\\b" + data[i].name.toLowerCase() + "\\b").test(string)) {
        callback(data[i].name + ", " + data[i].country);
        return;
      } else if (
        new RegExp("\\b" + data[i].country.toLowerCase() + "\\b").test(string)
      ) {
        callback(data[i].country);
        return;
      } else if (i + 1 >= Object.keys(data).length) {
        callback(false);
        return;
      }
    }
  },
};
