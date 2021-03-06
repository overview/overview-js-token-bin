expect = require('chai').expect;

TokenBin = require('../lib/TokenBin');

describe('TokenBin', function() {
  it('should make tokens unique', function() {
    var bin = new TokenBin([ 'token', 'beep', 'beep' ]);
    expect(bin.getTokens().map(function(t) { return t.name; }))
      .to.deep.eq([ 'token', 'beep' ]);
  });

  it('should count frequencies', function() {
    var bin = new TokenBin([ 'token', 'beep', 'beep' ]);
    expect(bin.getTokens().map(function(t) { return t.frequency; }))
      .to.deep.eq([ 1, 2 ]);
  });

  it('should work for empty input', function() {
    var bin = new TokenBin([]);
    expect(bin.getTokens()).to.deep.eq([]);
  });

  it('should not modify the input', function() {
    var arr = [ 'token', 'beep', 'token' ];
    new TokenBin(arr);
    expect(arr).to.deep.eq([ 'token', 'beep', 'token' ]);
  });

  it('should set nDocuments=1 and nTokens', function() {
    var bin = new TokenBin([ 'a', 'b', 'a' ]);
    expect(bin.nDocuments).to.eq(1);
    expect(bin.nTokens).to.eq(3);
  });

  describe('concat', function() {
    it('should not modify either input', function() {
      var bin1 = new TokenBin([ 'beep', 'token', 'beep' ]);
      var bin2 = new TokenBin([ 'token', 'beep', 'new' ]);
      bin1.concat(bin2);
      expect(bin1.getTokens().map(function(t) { return t.frequency; }))
        .to.deep.eq([ 2, 1 ]);
      expect(bin2.getTokens().map(function(t) { return t.frequency; }))
        .to.deep.eq([ 1, 1, 1 ]);
    });

    it('should set nDocuments', function() {
      var bin = new TokenBin([ 'a', 'b' ])
        .concat(new TokenBin([ 'a', 'b' ]))
        .concat(new TokenBin([ 'a', 'b' ])); // So we get a 2+1, not just 1+1
      expect(bin.nDocuments).to.eq(3);
    });

    it('should set nTokens', function() {
      var bin = new TokenBin([ 'a', 'b' ])
        .concat(new TokenBin([ 'a', 'b' ]))
        .concat(new TokenBin([ 'a', 'b' ])); // So we get a 4+2, not just 2+2
      expect(bin.nTokens).to.eq(6);
    });

    it('should merge names, frequencies and nDocuments', function() {
      var bin = new TokenBin([ 'a', 'b', 'b', 'c' ])
        .concat(new TokenBin([ 'b', 'c', 'd', 'd' ]));
      var tokens = bin.getTokens();

      expect(tokens.map(function(t) { return t.name; }))
        .to.deep.eq([ 'a', 'b', 'c', 'd' ]);
      expect(tokens.map(function(t) { return t.frequency; }))
        .to.deep.eq([ 1, 3, 2, 2 ]);
      expect(tokens.map(function(t) { return t.nDocuments; }))
        .to.deep.eq([ 1, 2, 2, 1 ]);
    });
  });

  describe('addTokens', function() {
    it('should set nDocuments', function() {
      var bin = new TokenBin([ 'a', 'b' ]).concat(new TokenBin([ 'a', 'b' ]));
      bin.addTokens([ 'a', 'b' ]);
      expect(bin.nDocuments).to.eq(3);
    });

    it('should set nTokens', function() {
      var bin = new TokenBin([ 'a', 'b' ]).concat(new TokenBin([ 'a', 'b' ]));
      bin.addTokens([ 'a', 'b' ]);
      expect(bin.nTokens).to.eq(6);
    });

    it('should merge names, frequencies and nDocuments', function() {
      var bin = new TokenBin([ 'a', 'b', 'b', 'c' ]);
      bin.addTokens([ 'b', 'c', 'd', 'd' ]);

      var tokens = bin.getTokens();

      expect(tokens.map(function(t) { return t.name; }))
        .to.deep.eq([ 'a', 'b', 'c', 'd' ]);
      expect(tokens.map(function(t) { return t.frequency; }))
        .to.deep.eq([ 1, 3, 2, 2 ]);
      expect(tokens.map(function(t) { return t.nDocuments; }))
        .to.deep.eq([ 1, 2, 2, 1 ]);
    });
  });

  describe('getTokensByFrequency', function() {
    it('should sort by frequency', function() {
      var bin = new TokenBin([ 'a', 'b', 'b' ]);
      expect(bin.getTokensByFrequency().map(function(t) { return t.name; }))
        .to.deep.eq([ 'b', 'a' ]);
    });

    it('should sort by name in the case of a tie', function() {
      var bin = new TokenBin([ 'a', 'b', 'c' ]);
      expect(bin.getTokensByFrequency().map(function(t) { return t.name; }))
        .to.deep.eq([ 'a', 'b', 'c' ]);
    });
  });

  describe('getTokensByNDocuments', function() {
    it('should sort by nDocuments', function() {
      var bin = new TokenBin([ 'a', 'a', 'a', 'b' ]).concat(new TokenBin([ 'b' ]));
      expect(bin.getTokensByNDocuments().map(function(t) { return t.name; }))
        .to.deep.eq([ 'b', 'a' ]);
    });

    it('should sort by name in the case of a tie', function() {
      var bin = new TokenBin([ 'a', 'b', 'c' ]);
      expect(bin.getTokensByNDocuments().map(function(t) { return t.name; }))
        .to.deep.eq([ 'a', 'b', 'c' ]);
    });
  });
});
