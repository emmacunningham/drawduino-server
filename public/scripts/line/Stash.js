define( function() {

  function Stash() {
    this.lineStr_ = null;
  };

  Stash.prototype.store = function( lineStr ) {
    this.lineStr_ = lineStr;
  }

  Stash.prototype.retrieveAndClear = function() {
    return this.lineStr_;
  }

  return Stash;
});

