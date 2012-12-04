define(['scripts/lfl/events/Dispatcher.js', './Canvas.js'], function( Dispatcher, Canvas ) {

  function Playback( canvas ) {
    Dispatcher.call(this);

    this.canvas_ = canvas;
    this.line_;
    this.timeout_;
    this.isPlaying_ = false;

    // Warning: speeding up playback also speeds up the preserved history.
    // So repeatedly saving a playback and replaying it again will end up with a super-sped-up drawing.
    this.speed_ = 1;
  };
  Playback.prototype = new Dispatcher();

  Playback.Event = {};
  Playback.Event.START = "Playback.Event.START";
  Playback.Event.STOP = "Playback.Event.STOP";

  Playback.prototype.play = function( lineStr ) {
    // To do: Save a current drawing so we don't lose work by playing back another drawing.
    var data = JSON.parse( lineStr );
    this.line_ = data.line;
    if ( this.line_.length > 2 ) {
      this.canvas_.reset();
      this.stepTo_( 0 );
      this.isPlaying_ = true;
      this.dispatch( Playback.Event.START );
    }
  }

  Playback.prototype.stepTo_ = function( index ) {
    // Data structure is [ time, x, y ]
    var data = this.line_[ index ];
    if ( index == 0 ) this.canvas_.moveLineTo( data[ 1 ], data[ 2 ] );
    else this.canvas_.drawLineTo( data[ 1 ], data[ 2 ] );
    if ( index < this.line_.length - 1 ) {
      var self = this;
      this.timeout_ = setTimeout( function() {
        self.stepTo_( index + 1 );
      }, data[ 0 ] / this.speed_ );
    } else {
      this.stop();
    }
  }

  Playback.prototype.stop = function() {
    this.isPlaying_ = false;
    clearTimeout( this.timeout_ );
    this.dispatch( Playback.Event.STOP );
  }

  Playback.prototype.getIsPlaying = function() {
    return this.isPlaying_;
  }

  return Playback;
});

