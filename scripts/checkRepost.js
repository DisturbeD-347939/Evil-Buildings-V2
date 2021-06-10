const https = require("https");

module.exports = {
  check: async function (url, callback) {
    let path = "/image?&target_match_percent=90&url=";

    path += url;

    var options = {
      host: "api.repostsleuth.com",
      path: path,
    };

    //GET Request
    request = function (response) {
      var data = "";

      //Retrieve data using chunks
      response.on("data", function (chunk) {
        data += chunk;
      });

      //All data retrieved
      response.on("end", function () {
        parsedData = JSON.parse(data);

        if (parsedData.matches == null || parsedData.matches == undefined) {
          callback(false);
          return;
        }

        //Check if there are any matches
        if (Object.keys(parsedData.matches).length === 0) {
          //If no repost matches are found, return false (NO REPOSTS)
          callback(false);
        } else {
          //Get matches
          let reposts = parsedData.matches;

          //Loop through matches
          for (let i = 0; i < Object.keys(reposts).length; i++) {
            let subreddit = reposts[i].post.subreddit;
            let timestamp = reposts[i].post.created_at;

            //Get timestamp of a year ago
            let oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

            //If the post has been reposted within the last year on "evilbuildings", return true (RECENT REPOST)
            //Else return false (REPOST NOT IN THE SUBREDDIT OR TOO LONG AGO)
            if (
              subreddit == "evilbuildings" &&
              oneYearAgo < new Date(timestamp * 1000)
            ) {
              callback(true);
              return;
            }

            if (i + 1 >= Object.keys(reposts).length) {
              callback(false);
            }
          }
        }
      });
    };

    //GET request to the URL
    https.request(options, request).end();
  },
};
