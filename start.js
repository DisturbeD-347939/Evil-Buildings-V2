const fs = require("fs");

const repost = require("./scripts/checkRepost");
const helpers = require("./scripts/helpers");
const reddit = require("./scripts/reddit");
const twitter = require("./scripts/twitter");
const imgRecognition = require("./scripts/imageRecognition");
const location = require("./scripts/checkLocation");

let postsPerDay = 2;
let postsRetrieved = 10; //How many posts are taken from reddit (higher than postsPerDay in case some posts are broken/repeated)
let timeframe = "day";
let redditURL = "https://www.reddit.com";
let postsPath = "./posts";
let excludedTags = ["building", "buildings", "structure"];

//No Reposts
//https://www.reddit.com/r/evilbuildings/comments/nsrugw/a_tower_in_brussel_no_one_know_who_actualy/

//Reposted
//https://www.reddit.com/r/evilbuildings/comments/iatok0/imagine_seeing_this_place_with_no_prior_knowledge/

setImmediate(() => {
  let postingInterval = (24 / postsPerDay) * 3600000;

  //Create directory for posts if not existing
  if (!fs.existsSync(postsPath)) {
    fs.mkdirSync(postsPath);
  }

  /*location.get("o", (res) => {
    console.log(res);
  });*/

  /*helpers.contains(excludedTags, "building", (res) => {
    console.log(res);
  });*/

  /*if (excludedTags.indexOf("test") > -1) {
    console.log("Exists");
  } else {
    console.log("Doesn't exist");
  }*/

  //imgRecognition.classify("./posts/t3_ntsnii/image.jpg");

  /*helpers.getBase64Img("./posts/t3_ntsnii/image.jpg", (res) => {
    twitter.postImg(res);
  });*/

  //Run main program
  processPosts();

  setTimeout(() => {
    post();
  }, 60000);

  setInterval(() => {
    post();
  }, postingInterval);

  setInterval(() => {
    processPosts();
  }, 86400000);
});

function processPosts() {
  reddit.getPosts(timeframe, postsRetrieved, (posts) => {
    console.log(Object.keys(posts).length + " posts being retrieved");
    for (let i = 0; i < Object.keys(posts).length; i++) {
      let fullId = posts[i].name;
      let id = posts[i].id;
      let authorId = posts[i].author_fullname;
      let authorUsername = posts[i].author;
      let url = posts[i].permalink;
      let imgUrl = posts[i].url_overridden_by_dest;
      let upvotes = posts[i].ups;
      let title = posts[i].title;
      let sensitiveContent = posts[i].over_18;

      if (upvotes >= 100 && !fs.existsSync(postsPath + "/" + fullId)) {
        repost.check(redditURL + url, (res) => {
          //Not reposted
          if (!res) {
            console.log("Not reposted");
            helpers.getImgFormat(imgUrl, (format) => {
              //Valid img (jpeg, jpg, png)
              if (format != false) {
                let targetFolder = postsPath + "/" + fullId; //Post directory path
                let targetPath = targetFolder + "/image." + format; //Post img path

                //Create directory for post
                fs.mkdir(targetFolder, function (err) {
                  if (!err) {
                    //Download image from post into directory
                    helpers.downloadImg(imgUrl, targetPath, () => {
                      console.log("Gathered post " + id + " by " + author);

                      //Get tags using image recognition build by Google (Vision AI API)
                      imgRecognition.classify(targetPath, (tags) => {
                        let tagsArray = [];
                        let arrayFull = false;

                        //Gather top 3 words that aren't in the excluded list
                        tags.forEach((tag, index, array) => {
                          if (
                            tagsArray.length < 3 &&
                            index != array.length - 1
                          ) {
                            helpers.contains(
                              excludedTags,
                              tag.description,
                              (res) => {
                                if (!res) {
                                  tagsArray.push(
                                    tag.description
                                      .replace(/\s/g, "")
                                      .toLowerCase()
                                  );
                                }
                              }
                            );
                          } else {
                            //Tags array full or end of array
                            if (!arrayFull) {
                              arrayFull = true;

                              location.get(title, (res) => {
                                //Put all the data together
                                let data = {
                                  fullId: fullId,
                                  id: id,
                                  authorId: authorId,
                                  authorUsername: authorUsername,
                                  title: title,
                                  sensitiveContent: sensitiveContent,
                                  tags: tagsArray,
                                  format: format,
                                  posted: false,
                                  location: res,
                                };

                                //Write to JSON file
                                try {
                                  fs.writeFileSync(
                                    targetFolder + "/data.json",
                                    JSON.stringify(data)
                                  );
                                  console.log("Data created for " + id);
                                } catch (err) {
                                  console.log(err);
                                }
                              });
                            }
                          }
                        });
                      });
                    });
                  } else {
                    console.log(err);
                  }
                });
              } else {
                console.log("Wrong format");
              }
            });
          }
        });
      }
    }
  });
}

function post() {
  console.log("Trying to post...");
  helpers.getDirectories(postsPath, (posts) => {
    for (let i = 0; i < posts.length; i++) {
      if (fs.existsSync(posts[i] + "/data.json", "utf-8")) {
        let data = fs.readFileSync(posts[i] + "/data.json", "utf-8");

        data = JSON.parse(data);
        if (!data.posted) {
          let index = i;
          i = posts.length;
          let status = "";

          if (data.location != false) {
            status += data.location + " ";
          }

          for (let j = 0; j < data.tags.length; j++) {
            status += "#" + data.tags[j] + " ";
            if (j + 1 >= data.tags.length) {
              helpers.getBase64Img(
                posts[index] + "/image." + data.format,
                (res) => {
                  twitter.postImg(res, status, (res) => {
                    if (res) {
                      data.posted = true;
                      console.log("Posted");
                      try {
                        fs.writeFileSync(
                          posts[index] + "/data.json",
                          JSON.stringify(data)
                        );
                        console.log("Updated data for " + data.fullId);
                      } catch (err) {
                        console.log(err);
                      }
                    } else {
                      console.log(res);
                    }
                  });
                }
              );
            }
          }
        }
      }
    }
  });
}
