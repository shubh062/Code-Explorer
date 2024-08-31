const fs = require("fs");
const lengthstr = fs.readFileSync("length.txt").toString();
const length = lengthstr.split("\n");

for (let i = 0; i < length.length; i++) {
  length[i] = Number(length[i]);
}
//Here we are just getting the length of each and every document and exporting it.
module.exports = length;
