#!/usr/bin/env node

var fs = require('fs');
var TokenBin = require('../index');

console.log('Loading and tokenizing some documents');

var t1 = new Date();

function filenameToTokens(filename) {
  return fs.readFileSync(filename, 'utf-8').split(/[^\w]+/g)
}

var rawInputDocuments = [
  filenameToTokens(__filename),
  filenameToTokens(__dirname + '/TokenBinSpec.js'),
  filenameToTokens(__dirname + '/../README.md'),
  filenameToTokens(__dirname + '/../LICENSE'),
  filenameToTokens(__dirname + '/../package.json'),
  filenameToTokens(__dirname + '/../lib/TokenBin.js')
];

// Rather than include the complete works of Shakespeare, let's just copy the
// documents a few times

var documents = [];

for (var i = 0; i < 10000; i++) {
  documents.push(rawInputDocuments[i % rawInputDocuments.length]);
}

console.log('Loaded %d documents in %dms. (This is not what we are optimizing)', documents.length, new Date() - t1);

console.log('Creating %d bins...', documents.length);

t1 = new Date();

var bins = documents.map(function(tokenStream) {
  return new TokenBin(tokenStream);
});

console.log('Created %d bins in %dms', documents.length, new Date() - t1);

console.log('Concatenating %d times', documents.length);

t1 = new Date();

var totalBin = bins.reduce(function(agg, bin) {
  return agg.concat(bin);
}, new TokenBin([]));

console.log('Concatenated %d times in %dms. %d tokens.', documents.length, new Date() - t1, totalBin._tokens.length);

console.log('Now, "streaming" one document at a time, dereferencing TokenBins as we create them...');

bins = [];
t1 = new Date();
totalBin = documents.reduce(function(agg, tokenStream) {
  return agg.concat(new TokenBin(tokenStream));
}, new TokenBin([]));

console.log('Created and concatenated %d bins in %dms. %d tokens.', documents.length, new Date() - t1, totalBin._tokens.length);
