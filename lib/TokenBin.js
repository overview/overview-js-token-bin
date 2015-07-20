'use strict';

/**
 * Returns the same String, but not leaking memory.
 *
 * See https://code.google.com/p/v8/issues/detail?id=2869
 */
function unleak(smallSubstringOfHugeString) {
  return (' ' + smallSubstringOfHugeString).substr(1);
}

function Token(name, nDocuments, frequency) {
  this.name = name;
  this.nDocuments = nDocuments;
  this.frequency = frequency;
}

Token.prototype.clone = function() {
  return new Token(this.name, this.nDocuments, this.frequency);
}

/**
 * Constructs a TokenBin from an Array of String tokens.
 */
function TokenBin(tokens) {
  if (tokens.length > 0 && typeof(tokens[0].name) == 'string') {
    // We're being called from within concat().
    this._tokens = tokens;
    this._tokensByName = arguments[1];
    this.nDocuments = arguments[2];
    this.nTokens = arguments[3];
  } else {
    this._tokens = [];
    this._tokensByName = {};
    this.nDocuments = 0;
    this.nTokens = 0;

    this.addTokens(tokens);
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
 * Adds an Array of String tokens to this token bin.
 *
 * We assume all these tokens form a single document. nDocuments will go up by
 * either 0 or 1 for each existing token.
 *
 * As this modifies the TokenBin, any value previously returned from the
 * TokenBin will be invalidated. That can make hard-to-debug errors. Prefer
 * `concat()` unless you need the raw speed.
 */
TokenBin.prototype.addTokens = function(tokens) {
  var thisDocumentTokens = {}; // Object mapping tokenName -> null

  for (var i = 0; i < tokens.length; i++) {
    var tokenName = tokens[i];

    var token;

    if (tokenName in this._tokensByName) {
      token = this._tokensByName[tokenName];
      token.frequency++;
    } else {
      token = this._tokensByName[tokenName] = new Token(unleak(tokenName), 0, 1);
      this._tokens.push(token);
    }

    if (!(tokenName in thisDocumentTokens)) {
      token.nDocuments++;
      thisDocumentTokens[tokenName] = null;
    }
  }

  this.nDocuments++;
  this.nTokens += tokens.length;
}

/*
 * Returns a new TokenBin that merges this TokenBin to the given argument.
 */
TokenBin.prototype.concat = function concat(rhs) {
  // Iterate over this._tokens, then rhs._tokens, building new tokens.
  var tokens = this._tokens.slice(0);
  var tokenIndexByName = {}; // Object mapping String token -> array index

  for (var i = 0; i < tokens.length; i++) {
    tokenIndexByName[tokens[i].name] = i;
  }

  // Okay, now add the second list. If a token appears in both lists, create a
  // new Token object to represent it, to keep the original Tokens unchanged.
  for (var j = 0; j < rhs._tokens.length; j++) {
    var token = rhs._tokens[j];

    if (token.name in tokenIndexByName) {
      var i = tokenIndexByName[token.name];
      var firstToken = tokens[i];
      tokens[i] = new Token(
        token.name,
        firstToken.nDocuments + token.nDocuments,
        firstToken.frequency + token.frequency
      )
    } else {
      tokenIndexByName[token.name] = tokens.length;
      tokens.push(token);
    }
  }

  var tokensByName = {};
  for (var i = 0; i < tokens.length; i++) {
    tokensByName[tokens[i].name] = token;
  }

  return new TokenBin(
    tokens,
    tokensByName,
    this.nDocuments + rhs.nDocuments,
    this.nTokens + rhs.nTokens
  );
};

function sortedTokens(tokens, sortByProperty) {
  return tokens.slice(0).sort(function(a, b) {
    return b[sortByProperty] - a[sortByProperty] || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
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
