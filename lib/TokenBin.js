'use strict';

function Token(name, nDocuments, frequency) {
  this.name = name;
  this.nDocuments = nDocuments;
  this.frequency = frequency;
}

Token.prototype.clone = function() {
  return new Token(this.name, this.nDocuments, this.frequency);
}

function tokenStreamToTokens(tokenStream) {
  // sort() is faster than localeCompare(), and we don't care *what* the
  // ordering is, so long as it's consistent.
  var tokenNameStream = tokenStream.slice(0).sort();

  var curTokenName; // Token from the stream
  var tokens = [];
  var curToken = null;

  for (var i = 0; i < tokenNameStream.length; i++) {
    curTokenName = tokenNameStream[i];
    if (curToken === null || curToken.name !== curTokenName) {
      curToken = new Token(curTokenName, 1, 1);
      tokens.push(curToken);
    } else {
      curToken.frequency += 1;
    }
  }

  return tokens;
}

/*
 * Constructs a TokenBin from an Array of String tokens.
 */
function TokenBin(tokens) {
  if (tokens.length > 0 && typeof(tokens[0].name) == 'string') {
    // Assume we're calling this from within concat().
    this._tokens = tokens;
  } else {
    this._tokens = tokenStreamToTokens(tokens);
  }
}

/*
 * Returns all Token objects in this TokenBin, in undefined order.
 *
 * A Token is an Object with `name`, `nDocuments` and `frequency`.
 */
TokenBin.prototype.getTokens = function getTokens() {
  return this._tokens;
};

/*
 * Returns a new TokenBin that merges this TokenBin to the given argument.
 */
TokenBin.prototype.concat = function concat(rhs) {
  // Assume lists are sorted. Merge them.
  var as = this._tokens;
  var bs = rhs._tokens;
  var ai = 0, bi = 0; // Indices into as and bs.
  var a, b; // Values: as[ai] and bs[bi].
  var tokens = [];

  while (ai < as.length || bi < bs.length) {
    if (ai == as.length) {
      tokens.push(bs[bi]);
      bi++;
    } else if (bi == bs.length) {
      tokens.push(as[ai]);
      ai++;
    } else {
      a = as[ai];
      b = bs[bi];

      if (a.name === b.name) {
        tokens.push(new Token(a.name, a.nDocuments + b.nDocuments, a.frequency + b.frequency));
        ai++;
        bi++;
      } else if (a.name < b.name) {
        tokens.push(a);
        ai++;
      } else {
        tokens.push(b);
        bi++;
      }
    }
  }

  return new TokenBin(tokens);
};

function sortedTokens(tokens, sortByProperty) {
  return tokens.slice(0).sort(function(a, b) {
    return b[sortByProperty] - a[sortByProperty] || (a < b ? -1 : a > b ? 1 : 0);
  });
}

/*
 * Returns an Array of {name,frequency,nDocuments} Tokens, sorted from most
 * frequent to least frequent.
 *
 * You may modify the returned Array, but you must not modify the Token objects
 * within.
 */
TokenBin.prototype.getTokensByFrequency = function getTokensByFrequency() {
  return sortedTokens(this._tokens, 'frequency');
};

/*
 * Returns an Array of {name,frequency,nDocuments} Tokens, sorted from most
 * documents to fewest documents.
 *
 * You may modify the returned Array, but you must not modify the Token objects
 * within.
 */
TokenBin.prototype.getTokensByNDocuments = function getTokensByNDocuments() {
  return sortedTokens(this._tokens, 'nDocuments');
};

module.exports = TokenBin;