let t = require("twitter");
let fs = require("fs");

let twitter = new t({
  consumer_key: process.env.TWITTER_KEY,
  consumer_secret: process.env.TWITTER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

module.exports = {
  get: () => {
    let params = { screen_name: "nodejs" };
    twitter.get(
      "statuses/user_timeline",
      params,
      function (error, tweets, response) {
        if (!error) {
          console.log(tweets);
        }
      }
    );
  },
  postImg: (img, title, callback) => {
    twitter.post(
      "media/upload",
      {
        media_data: img,
      },
      function (error, media, response) {
        if (error) throw error;

        const status = {
          status: title,
          media_ids: media.media_id_string,
        };

        twitter.post(
          "statuses/update",
          status,
          function (error, tweet, response) {
            if (error) callback(error);
            callback(true);
          }
        );
      }
    );
  },
};
