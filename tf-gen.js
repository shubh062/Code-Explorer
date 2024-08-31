// Basically, this file help us to generate the term frequency and inverse document frequency for all type of documents. this statement is just an overview of the whole file.

const { removeStopwords } = require("stopword");
const removePunc = require("remove-punctuation");






// STEP1 To generate term frequency and inverse document frequency for any kind of document First, we need the .txt file. Basically, these files will be converted to the string for each and every document. Actually, we need the actual document to generate the inverse document frequency and term frequency. So first step is to get all string in our code. So basically, we are reading all the files and storing it in a document.
let documents = [];
const fs = require("fs");
const path = require("path");//This thing always ensures that the path we are generating is always a valid path.
const N = 3023;
for (let i = 1; i <= N; i++) {
  const str = path.join(__dirname, "Problems");
  const str1 = path.join(str, `problem_text_${i}.txt`);
  console.log(str1);
  const question = fs.readFileSync(str1).toString();
  documents.push(question);
}





// STEP2: In this step what we are doing is that we are converting every document, into a list of keywords. We are doing this because a particular problem can have a lot of words and we may not need every word. So we are just filtering out the keywords from that particular document of a problem.We have to go through another function which is split() in the javascript. This split function allows us to split our string into a multiple substring across space, "\n" etc.
let docKeywords = [];
for (let i = 0; i < documents.length; i++) {
  const lines = documents[i].split("\n");  // We are splitting our document across the line. We have done this so as to generate the single line strings.
  const docWords = [];
  for (let k = 0; k < lines.length; k++) {
    const temp1 = lines[k].split(" ");
    //Now we are generating substring across the spaces from the substring which are being generated across the lines.

    temp1.forEach((e) => {
      e = e.split("\r");
      //Basically, we are splitting the strain in the basis of  Carriage return character. What basically it does is it moves the cursor back to the beginning of the line without advancing to the next line. Basically, this type of characters are not visible to us. These are generally present at the end of word
      if (e[0].length) docWords.push(e[0]);//this part is to handle the empty string cased by the split("/r")
    });
  }
// Here we are removing the stop words. For the working of this particular removeStopwords() function. 
  const newString = removeStopwords(docWords);
  newString.sort();//Here we are sorting the keywords because we want our keywords in the alphabetic order


  let temp = [];
  for (let j = 0; j < newString.length; j++) {
    newString[j] = newString[j].toLowerCase();
    //And we also don't want casing to matter. Because something which is written in uppercase and exactly in the lower case actually means the same. So we are converting all of them to the lower case
    newString[j] = removePunc(newString[j]);
    // (order.) At the end of this keyword, there is a punctuation mark. So we have to remove this also
    if (newString[j] !== "") temp.push(newString[j]);//We are only pushing when it is not a empty string, because we have removed the punctuation mark.
  }

  docKeywords.push(temp);
}






let sum = 0;
// In below for loop, we have done is that we are maintain a length for every document It says the number of keywords in everydocument. And we also maintain a sum which eventually get the sum of all the keywords present in the all of the  documents.
for (let i = 0; i < N; i++) {
  const length = docKeywords[i].length;
  sum += length;
  fs.appendFileSync("length.txt", length + "\n");
  console.log(length);
}


// As for now, we have not removed the duplicate keywords from any of the document. So the below mentioned array is an array which contains the unique keywords from the all the keywords
let keywords = [];
for (let i = 0; i < N; i++) {
  //Iterating over all the documents.
  for (let j = 0; j < docKeywords[i].length; j++) {
    //Iterating over the keywords array
    if (keywords.indexOf(docKeywords[i][j]) === -1)
      keywords.push(docKeywords[i][j]);
  }
}
keywords.sort();
//Till here we have generated our global array, which having the unique keywords and sorted them.




//Now we have appended all the keywords into a file. It is just a file containing all the keywords
const W = keywords.length;
keywords.forEach((word) => {
  fs.appendFileSync("keywords.txt", word + "\n");
});


// Now we will be calculating the Term frequency
//Term frequency says that the number of times a particular term which appears in a document
//here below we are calculating the term frequency for each and every keyword, for each and every document.

let TF = new Array(N);
//N is number of documents
for (let i = 0; i < N; i++) {
  //iterating over all the documents.
  TF[i] = new Array(W).fill(0); //making all zero
  // here w Is the length of keywords.txt.
  let map = new Map();
  docKeywords[i].forEach((key) => {
    return map.set(key, 0);
    //here we are populating the array basically
  });

 
  docKeywords[i].forEach((key) => {
    let cnt = map.get(key);
    cnt++;
    return map.set(key, cnt);
  });

  
  docKeywords[i].forEach((key) => {
    const id = keywords.indexOf(key);
    if (id !== -1) {
      TF[i][id] = map.get(key) / docKeywords[i].length;
      //Here we are calculating the term frequency for each document and every keyword
    }
  });
}








for (let i = 0; i < N; i++) {
  for (let j = 0; j < W; j++) {
    if (TF[i][j] != 0)
      //Basically in this file we are storing Turm frequency. Of each word in Document and the last value is the term frequency value.Here, i represent the document number and j represents the word in that document. And the last value represent the term frequency. And here we also avoiding the term frequency value, which are 0 because they are of no use. Basically, the last value, which we are calling at term frequency value, we are not storing the decimal values. Instead, we are storing the actual count of a particular word in particular document, instead of term frequency Which eventually is the number of time a particular word occurs in a particular document, divided by the length of the document value because we Will not be using cosine similarity instead. We will be using BM25 formula. Will be storing the actual frequency. Well, there is one more reason why we are not sure in the term Term frequency. because the BM25, formula doesn't have Term frequency in its equation instead, it's have The actual frequency.
      fs.appendFileSync("TF.txt", i + " " + j + " " + TF[i][j] + "\n");
  }

 
}


//Here we will be calculating inverse document frequency
//So here also, we will be using BM25 formula for inverse document frequency (idf)
let IDF = new Array(W);
for (let i = 0; i < W; i++) {
  let cnt = 0;
  for (let j = 0; j < N; j++) {
    if (TF[j][i]) {
      cnt++;
    }
  }
   //Here below it is IDF formula.
  if (cnt) IDF[i] = Math.log((N - cnt + 0.5) / (cnt + 0.5) + 1) + 1;
}


// here we are storing the iverse document frequency IDF value in a separate file. So we're having IDF value corresponding to every keyword present
IDF.forEach((word) => {
  fs.appendFileSync("IDF.txt", word + "\n");
});

