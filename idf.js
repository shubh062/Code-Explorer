const fs = require("fs");
const idfstr = fs.readFileSync("IDF.txt").toString();
const idf = idfstr.split("\n");
//Here we are just reading the idf.txt and returning it in the form of array.
for (let i = 0; i < idf.length; i++) {
  idf[i] = Number(idf[i]);
}
//Here we are exporting that array.
module.exports = idf;
