Token Bin
=========

_The math behind word clouds_

The problem
-----------

You want to perform statistical analysis of some text. You've divided all your
data into documents, and each document into tokens.

You need to be memory-efficient: no stray Objects lying around.

Usage
-----

This library pairs very well with
[overview-js-tokenizer](https://www.npmjs.com/package/overview-js-tokenizer),
which converts a String of text into a bunch of tokens. Assuming you already
have the tokens, go about your project like this:

First, `npm install --save overview-js-token-bin`.

Then, count tokens like so...

**The immutable way: a bit slow, values never change**

```javascript
var documents = [
  [ 'Array', 'of', 'tokens' ],
  [ 'Array', 'tokens', 'tokens', 'tokens', 'beep' ],
  [ 'Array', 'tokens' ],
  [ 'Array', 'beep', 'beep' ]
];

var tokenBins = documents.map(function(tokens) {
  return new TokenBin(tokens);
});

var totalBin = documents.reduce(function(aggBin, bin) {
  return aggBin.concat(bin);
}, new TokenBin([]));

console.log(totalBin.nDocuments); // 4
console.log(totalBin.nTokens); // 13, the total number of tokens

// Each token returned is an Object with "name", "frequency" and "nDocuments"

console.log(totalBin.getTokens()); // [ <Array,4,4>, <beep,3,2>, <of,1,1>, <tokens,5,3> ]

console.log(totalBin.getTokensByNDocuments()); // [ <Array,4,4>, <tokens,5,3>, <beep,3,2>, <of,1,1> ]

console.log(totalBin.getTokensByFrequency()); // [ <tokens,5,3>, <Array,4,4>, <beep,3,2>, <of,1,1> ]
```

**The mutable way: faster, but the value changes**

```javascript
var documents = [
  [ 'Array', 'of', 'tokens' ],
  [ 'Array', 'tokens', 'tokens', 'tokens', 'beep' ],
  [ 'Array', 'tokens' ],
  [ 'Array', 'beep', 'beep' ]
];

var totalBin = new TokenBin([]);

documents.forEach(function(tokens) {
  totalBin.addTokens(tokens);
});

// totalBin will be equivalent, with fewer sorts and fewer object allocations.
```

The mutable way is around three times faster (with Node 0.12.6). The downside:
if you call `var x = bin.getTokensByNDocuments(); bin.addTokens(...);`, the
`addTokens()` will change the values in `x`.

Memory
------

This library is designed to handle 100k unique tokens (average length 6 bytes)
in ~2MB of RAM, with most operations being O(1) and the rest taking <100ms on a
midrange 2015 computer. It should easily scale to 10M documents.

A "Token" looks like this:

```json
{
  "name": "beep",
  "frequency": 3,
  "nDocuments": 2
}
```

A token bin is an `Array` of `Token` objects.

Test for yourself: a sort of 100k such objects will take <100ms on our target
computers. Sorting is by far the slowest operation. So we can predict some
running times:

* *Create a token bin*: Builds an Array and an Object. O(n).
* *Concatente two token bins*: Adds to the Array and Object. O(n).
* *Find top tokens*: copies the internal Array and sorts it. O(n lg n), 100ms.

Sounds easy, right? Well, it took a lot of thought and experimentation. And
it's certainly particular to JavaScript, which has lightning-fast Arrays and
very-slow everything else.

Developing
----------

Clone the repo and `npm install`. Run `mocha -w`, edit some stuff in the `test`
directory, make it pass in the `lib` directory, and submit a pull request.

If you want to make this library more performant, work to make
`test/performance.js` perform more quickly. Of course, ensure `mocha` is still
all-green after your edits.
