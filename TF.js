const fs = require("fs");
const N = 3023;
let tf = new Array(N);
//Here we can't create a array of N*W because Nxw= 9 x 10^8 which is approximate 500mb and if we are generating the decimal value it will cost 8 * 500mb of the ram. Well, we are using this amount of memory when we are doing preprocessing, because we are doing that on our local machine. as we are only running it once on our local machine. So the memory will be flushed out So there is nothing to worry about. But if we are doing that on our Low memory server. half of the ram is already consumed in preprocessing step. So this is not a good idea.
for (let i = 0; i < N; i++) {
  tf[i] = new Array(0);
}

const TF = fs.readFileSync("TF.txt").toString();

const temp = TF.split("\n");
for (let k = 0; k < temp.length; k++) {
  const arr = temp[k].split(" ");
  const i = Number(arr[0]);
  const j = Number(arr[1]);
  const val = Number(arr[2]);
  // console.log(i);
  tf[i].push({
    id: j,
    val: val,
  });
  // tf[i][j] = val;
}

module.exports = tf;
