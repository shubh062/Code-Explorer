const express = require("express");

// Template Engine
const ejs = require("ejs");

// Module to remove the stopwords (is, an, the ....)
const { removeStopwords } = require("stopword");

// Module to remove the Punctuations (. , !)
const removePunc = require("remove-punctuation");

// Module for spell-check
const natural = require("natural");

// Module to remove grammer (add / adding == add)
const lemmatizer = require("wink-lemmatizer");

// Module to convert number to words
var converter = require("number-to-words");

// Modules to read file and set directory path
const fs = require("fs");
//We are importing the file system because we have to read the files which we are Generated during preprocessing step.
const path = require("path");
//We already discussed about this thing

// Module to calculate Title Similarity
const stringSimilarity = require("string-similarity");

// Module to convert word to numbers
const { wordsToNumbers } = require("words-to-numbers");

/**
 * Reading Required Arrays
 */

//Reading the IDF Array
const IDF = require("./idf");

// Reading the keywords array
const keywords = require("./keywords");

// Reading the length array
const length = require("./length");

//Reading the TF Array
let TF = require("./TF");

// Reading the titles array
const titles = require("./titles");

// Reading the urls array
const urls = require("./urls");

const N = 3023;//These are the number of documents
const W = 27602;//these are the number of keywords
//Below is the average document length We require this length because it is used in the BM25 formula.
const avgdl = 138.27125372146875;

// Starting the Server
const app = express();

// Function to capitalize the string

Object.defineProperty(String.prototype, "capitalize", {
  value: function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
  },
  enumerable: false,
});

// Setting EJS as our view engine
app.set("view engine", "ejs");

// Path to our Public Assets Folder And and Express to use it. When we use an express server Even the static files such as images, css they are served by our web server itself. So we need to tell our express server that they are present in a particular folder And to handle them accordingly
app.use(express.static(path.join(__dirname, "/public")));

// Making a dictionary with all our keywords
const spellcheck = new natural.Spellcheck(keywords);

// GET Route to home page
app.get("/", (req, res) => {
  res.render("index");
});







//We need to extract the keywords from our query string. So we have perform some operations on it. We can do it by apply remove stop words, then remove punctuation And we also, you know, split the query across space delimiter. But our search engine must be smart.
/*  1. Our search engine must be smart enough to map querystring=[added a number] to the keywords present [add, number], instead of [added, number] which is not present in dataset.
    2. to Automatically detect the misspelt words. eg: query=[nuber]...it should search for the [nummber] in the keywords.
    3. our search engine should also figure out that "two sum" means "2 sum", that is both are same.
    4. should handel camel casing eg: "twoSum" is same as "two sum".
    5. Word to Numbers it might happen someone query for "two sum" but in actual question their is "2sum" we will be handling that case too.
    6. Deals with the grammmer and spell check. eg--> adds -> add
*/
// GET Route to perform our search
app.get("/search", (req, res) => {
  const query = req.query.query;
  //This extracts the query parameter from the query string of the incoming request URL.For example, if the request URL is /search?query=example search, req.query.query will be example search.
  const oldString = query.split(" ");
  //This splits the query string into an array of words using a space as the delimiter. For example, if query is example search, oldString will be ['example', 'search'].
  const newString = removeStopwords(oldString);
  newString.sort(); // newString is an array

  let queryKeywords = [];

 // this below regular expression is used to extract numerical digits from a string.
  let getNum = query.match(/\d+/g);

  //Push all the numbers and their word form to query keywords
  if (getNum) {
    getNum.forEach((num) => {
      //pushing that extracted numeric keyword to our keyword
      queryKeywords.push(num);
      // below we are using the library to convert the number to words
      let numStr = converter.toWords(Number(num));
      let numKeys = numStr.split("-");
      //the reason for splitting, eg:two-hundered-thirty-four
      queryKeywords.push(numStr); 

      numKeys.forEach((key) => {
        let spaceSplits = key.split(" ");// can be gap between them
        if (numKeys.length > 1) queryKeywords.push(key);
        if (spaceSplits.length > 1)
          spaceSplits.forEach((key) => {
            queryKeywords.push(key);
          });
      });
    });
  }

 





  for (let j = 0; j < newString.length; j++) {
    // Original Keywords
    newString[j] = newString[j].toLowerCase();
    newString[j] = removePunc(newString[j]);
    if (newString[j] !== "") queryKeywords.push(newString[j]);

    // Camelcasing: twoSum will be [two, sum]
    // twoSumXyz=[two, sum, xyz]
    var letr = newString[j].match(/[a-zA-Z]+/g);// regular expression for finding the camel casing
    if (letr) {
      letr.forEach((w) => {
        queryKeywords.push(removePunc(w.toLowerCase()));
      });
    }

    //Word to Numbers
    // it might happen someone query for "two sum" but in actual question their is "2sum" we will be handling that case too.
    let x = wordsToNumbers(newString[j]).toString();
    //if it is already a number no need to convert it retur
    if (x != newString[j]) queryKeywords.push(x);
  }




  // Grammer and Spell Check
  let queryKeywordsNew = queryKeywords;
  queryKeywords.forEach((key) => {
    let key1 = key;
    let key2 = lemmatizer.verb(key1); 
    // doing lammatization(extracting the root of that particular keyword)
    /* lemmatize.adjective( 'farthest' );
         // -> 'far'
       lemmatize.adjective( 'coolest' );
        // -> 'cool'
       lemmatize.adjective( 'easier' );
       // -> 'easy' 
       // Lemmatize nouns
       lemmatize.noun( 'knives' );
       // -> 'knife'
       lemmatize.noun( 'potatoes' );
       // -> 'potato'
       lemmatize.noun( 'men' );
       // -> 'man'

       // Lemmatize verbs
       lemmatize.verb( 'eaten' );
       // -> 'eat'
       lemmatize.verb( 'pushes' );
       // -> 'push'
       lemmatize.verb( 'suggesting' );
       // -> 'suggest'
       */
    queryKeywordsNew.push(key2);
    


    //spellcheck is a time consuming process. eg-->> [nu_ber] there are 26 possibilities to fill that position, [n__ber] now there are 26*26 possibilities. And adding more to that we initially don't know which position is having that missing alphabet. How do we come to know that the missing alphabet is at the starting position of the word, or at the last position of the word, or in between the word. we are doing it with the distance k=1 from the actual word otherwise it is too complicated to come up with the actual keyword. For spell checking we will not be mapping our incoming query word to a real, huge dictionary. Instead, we are mapping that incoming world to our list of keyword, which contains all the keywords because that makes sense
    let spellkey1 = spellcheck.getCorrections(key1);
    //It will provide a list which is having words which is at a distance of K<= 1. Before pushing this inside the keyword list, we will be checking that the query for a particular wordwhich the user is asking is present in this list If it is present, then we will be pushing only that word otherwise we will be pushing the whole list
    let spellkey2 = spellcheck.getCorrections(key2);
    if (spellkey1.indexOf(key1) == -1) {
      spellkey1.forEach((k1) => {
        queryKeywordsNew.push(k1);
        //We are also doing the spell cheque for the lemmatized word because "aded-->ad" but it is corrrectly spelled as "add".
        queryKeywordsNew.push(lemmatizer.verb(k1));
      });
    }

    if (spellkey2.indexOf(key2) == -1) {
      spellkey2.forEach((k2) => {
        queryKeywordsNew.push(k2);
        queryKeywordsNew.push(lemmatizer.verb(k2));
      });
    }
  });

  // Updating the querykeywords array
  queryKeywords = queryKeywordsNew;
  console.log(queryKeywords);







  // Now we need to filter out those keywords which are present in our dataset. We don't need those keywords, which are not present in our dataset. why to overcompute. 
  let temp = [];
  for (let i = 0; i < queryKeywords.length; i++) {
    const id = keywords.indexOf(queryKeywords[i]);
    if (id !== -1) {
      temp.push(queryKeywords[i]);
    }
  }

  queryKeywords = temp;
  queryKeywords.sort();

  //Getting Unique Query Keyword
  // Inside BM25 formula. We never used the term frequency of a keyword inside the query string. 
  let temp1 = [];
  queryKeywords.forEach((key) => {
    if (temp1.indexOf(key) == -1) {
      temp1.push(key);
    }
  });

  queryKeywords = temp1;

  //Getting id of every query keyword
  let qid = [];
  queryKeywords.forEach((key) => {
    qid.push(keywords.indexOf(key));
  });

  /**
   * BM25 Algorithm
   */

  // Similarity Score of each doc with query string
  const arr = [];
  //The above mentioned array will store the score for the keyword 

  for (let i = 0; i < N; i++) {
    let s = 0;
    qid.forEach((key) => {
      const idfKey = IDF[key];
      let tf = 0;
      for (let k = 0; k < TF[i].length; k++) {
        if (TF[i][k].id == key) {
          tf = TF[i][k].val / length[i];

          break;
        }
      }
      // we are using k= 1.2 and b=0.75
      const tfkey = tf;
      const x = tfkey * (1.2 + 1);
      const y = tfkey + 1.2 * (1 - 0.75 + 0.75 * (length[i] / avgdl));
      let BM25 = (x / y) * idfKey;

      //Giving Higher weightage to Leetcode and Intterview bit Problems
      if (i < 2214) BM25 *= 2;
      s += BM25;
    });

    // Title Similarity
    //In this we are calculating the similarity of our query string and the title of question
    const titSim = stringSimilarity.compareTwoStrings(
      titles[i],
      query.toLowerCase()
    );
    s *= titSim;

    arr.push({ id: i, sim: s });
  }

  //Sorting According to Score
  //Sorting descending value of scores.
  arr.sort((a, b) => b.sim - a.sim);


  //Now we are done with the similarity score. Now we have to send the response. So we will be sending top 10 responses according to the similarity score. And But we will be sending is that the idea of that particular output along with title and the problem text. This is just the back end implementation. We are just sending a few lines Not all the lines of problem
  let response = [];
  let nonZero = 0;
  //This variable basically says that if there is a document with similarity score greater than zero Then we will be sending our response array, if we are passing a stringm with similarity score 0 then it will Send empty array.

  for (let i = 0; i < 10; i++) {
    if (arr[i].sim != 0) nonZero++;
    const str = path.join(__dirname, "Problems");
    const str1 = path.join(str, `problem_text_${arr[i].id + 1}.txt`);
    let question = fs.readFileSync(str1).toString().split("\n");
    let n = question.length;
    let problem = "";
    //leetcode problem are till 1773, just something inappropriate was happening so just handled that case
    if (arr[i].id <= 1773) {
      problem = question[0].split("ListShare")[1] + " ";
      if (n > 1) problem += question[1];
    } else {
      problem = question[0] + " ";
      if (n > 1) problem += question[1];
    }
    response.push({
      id: arr[i].id,
      title: titles[arr[i].id],
      problem: problem,
    });
  }

  console.log(response);

  // res.locals.titles = response;
  setTimeout(() => {
    if (nonZero) res.json(response);
    else res.json([]);
  }, 1000);
  //Basically everything is stored in the ram. So the computation may be very fast. So to have the user that feeling of simulation, we just added a timeout of 1000 milliseconds.
});

// GET route to question page

app.get("/question/:id", (req, res) => {
  const id = Number(req.params.id);
  const str = path.join(__dirname, "Problems");
  const str1 = path.join(str, `problem_text_${id + 1}.txt`);
  let text = fs.readFileSync(str1).toString();
  // console.log(text);
  if (id <= 1773) {
    text = text.split("ListShare");
    text = text[1];
  }

  var find = "\n";
  var re = new RegExp(find, "g");

  text = text.replace(re, "<br/>");

  let title = titles[id];
  title = title.split("-");
  let temp = "";
  for (let i = 0; i < title.length; i++) {
    temp += title[i] + " ";
  }
  title = temp;
  title = title.capitalize();
  let type = 0;
  if (id < 1774) type = "Leetcode";
  else if (id < 2214) type = "Interview Bit";
  else type = "Techdelight";
  const questionObject = {
    title,
    link: urls[id],
    value: text,
    type,
  };

  res.locals.questionObject = questionObject;

  res.locals.questionBody = text;
  res.locals.questionTitle = titles[id];
  res.locals.questionUrl = urls[id];
  res.render("question");
});

// Listining on Port

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Server is runnning on port " + port);
});

// Binary Search Tree -> ['binary', 'search', 'tree', 'orange'] -> ['binary', 'search', 'tree']
// Keywords -> []
// const score = [];
// for(const document of documents) {
// bm25
// score.push({id: document_id, score: bm25})
// }

// O(N*W)
// score.sort((a, b) => {
//  return b.score-a.score;
// })

// for(let i=0; i< 10; i++){
// console.log(document[score[i]._id]);
//}
//
//
