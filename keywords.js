const fs = require("fs");
const keywordsstr = fs.readFileSync("keywords.txt").toString();
//Here we are doing the same as in case of idf.js.
const keywords = keywordsstr.split("\n");
//Here we are splitting through and "\n". We are splitting this in this way because the keywords in the keywords .txt file are splitted by "\n".
module.exports = keywords;
