require("dotenv").config();

const snoowrap = require("snoowrap");

const r = new snoowrap({
  userAgent: process.env.REDDIT_ACCESS_TOKEN,
  clientId: process.env.REDDIT_KEY,
  clientSecret: process.env.REDDIT_SECRET,
  refreshToken: process.env.REDDIT_REFRESH_TOKEN,
});

module.exports = {
  getPosts: (timeframe, amount, callback) => {
    r.getSubreddit("evilbuildings")
      .getTop({ time: timeframe, limit: amount })
      .then((post) => {
        post = JSON.parse(JSON.stringify(post));
        callback(post);
      });
  },
};
