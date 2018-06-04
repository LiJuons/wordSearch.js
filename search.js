"use strict";

// #####################################################
//  Main functions for getting data and search filtering
// #####################################################

var trie = new Trie();
var words = [];
var get = new function getJSON() {

  fetch("https://api.datamuse.com/words?ml=fruit&max=200")
  .then(response => response.json())
  .then(response => {
    for (let i in response){
      trie.insert(response[i].word)
      words.push(response[i].word)
    }
  })
  .catch(function(error) {
    console.log(error);
  });

}

function mainFunc() {
  var resultsList = document.getElementById('resultsList');
  $(resultsList).empty();

  var searchWord = document.getElementById("searchBox").value
  searchWord = searchWord.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '')

  if (searchWord != ''){

    var radios = document.getElementsByName('algoS');

    //if Trie search algorithm is selected
    if (radios[0].checked) {

      console.log("Trie");
      let found = trie.find(searchWord);

      for (let i in found){

        found[i] = replacePart(found[i],searchWord)

        let item = document.createElement("li")
        item.innerHTML = found[i]
        resultsList.appendChild(item)

        setTimeout(function() {
          item.className = item.className + " show";
        }, i*60);

      }

    }

    //if search by chars algorithm is selected
    else if (radios[1].checked) {

      console.log("Char");
      let matches = matchFilter(words, searchWord);

      for (let i in matches){

        let item = document.createElement("li")
        item.innerHTML = matches[i]
        resultsList.appendChild(item)

        setTimeout(function() {
          item.className = item.className + " show";
        }, i*50);

      }

    }

  }
  else {
    let item = document.createElement("li")
    item.innerHTML = "Nothing to search for"
    resultsList.appendChild(item)
    item.className = item.className + " show";
  }

}

function replaceKeys(inputString, keys){
    var placeholder = '!!';
    var s = inputString.replace(new RegExp(/strong><mark>/gi),placeholder);

    for (var i = 0; i < keys.length; i++) {
                var t = keys[i];

                if (t) s = s.replace(new RegExp(t, 'gi'), function replacing() {
                  return '<' + placeholder + t + '</' + placeholder;
                })
            }

  return s.replace(new RegExp(placeholder,'g'),'mark></strong>');
}

function replacePart(inputString, part){
    var placeholder = '!!';
    var s = inputString.replace(new RegExp(/strong><mark>/gi),placeholder);

    if (part) s = s.replace(new RegExp(part, 'gi'), function replacing() {
      return '<' + placeholder + part + '</' + placeholder;
    })

    return s.replace(new RegExp(placeholder,'g'),'mark></strong>');

}

// #####################################################
//  Algorithm for search by characters
// #####################################################

function matchFilter(words, find) {
  let matchedWords = [];
  for (let i in words){
    let mW = stringSearch(words[i],find)
    if (mW == find.length){
      matchedWords.push(replaceKeys(words[i],[...find]))
    }
  }

  return matchedWords;
}

function stringSearch(str, find) {

  let strArr = [...str]
  let fKeys = [...find]
  let fnum = 0

  for (let i in strArr)
    for (let j in fKeys)
      if (fKeys[j] == strArr[i]) {
        fnum++
        fKeys.splice(j, 1)
        break
      }


  return fnum;
}

// #####################################################
//  Algorithm for search using Trie (tree data structure)
// #####################################################

function TrieNode(key) {
  // the "key" value will be the character in sequence
  this.key = key;

  // we keep a reference to parent
  this.parent = null;

  // we have hash of children
  this.children = {};

  // check to see if the node is at the end
  this.end = false;
}

TrieNode.prototype.getWord = function() {
  var output = [];
  var node = this;

  while (node !== null) {
    output.unshift(node.key);
    node = node.parent;
  }

  return output.join('');
};

// -----------------------------------------

// we implement Trie with just a simple root with null value.
function Trie() {
  this.root = new TrieNode(null);
}

// inserts a word into the trie.
// time complexity: O(k), k = word length
Trie.prototype.insert = function(word) {
  var node = this.root; // we start at the root 😬

  // for every character in the word
  for(var i = 0; i < word.length; i++) {
    // check to see if character node exists in children.
    if (!node.children[word[i]]) {
      // if it doesn't exist, we then create it.
      node.children[word[i]] = new TrieNode(word[i]);

      // we also assign the parent to the child node.
      node.children[word[i]].parent = node;
    }

    // proceed to the next depth in the trie.
    node = node.children[word[i]];

    // finally, we check to see if it's the last word.
    if (i == word.length-1) {
      // if it is, we set the end flag to true.
      node.end = true;
    }
  }
};

// check if it contains a whole word.
// time complexity: O(k), k = word length
Trie.prototype.contains = function(word) {
  var node = this.root;

  // for every character in the word
  for(var i = 0; i < word.length; i++) {
    // check to see if character node exists in children.
    if (node.children[word[i]]) {
      // if it exists, proceed to the next depth of the trie.
      node = node.children[word[i]];
    } else {
      // doesn't exist, return false since it's not a valid word.
      return false;
    }
  }

  // we finished going through all the words, but is it a whole word?
  return node.end;
};

// returns every word with given prefix
// time complexity: O(p + n), p = prefix length, n = number of child paths
Trie.prototype.find = function(prefix) {
  var node = this.root;
  var output = [];

  // for every character in the prefix
  for(var i = 0; i < prefix.length; i++) {
    // make sure prefix actually has words
    if (node.children[prefix[i]]) {
      node = node.children[prefix[i]];
    } else {
      // there's none. just return it.
      return output;
    }
  }

  // recursively find all words in the node
  findAllWords(node, output);

  return output;
};

// recursive function to find all words in the given node.
function findAllWords(node, arr) {
  // base case, if node is at a word, push to output
  if (node.end) {
    arr.unshift(node.getWord());
  }

  // iterate through each children, call recursive findAllWords
  for (var child in node.children) {
    findAllWords(node.children[child], arr);
  }
}
