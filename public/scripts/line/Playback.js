define(['scripts/lfl/events/Dispatcher.js', './Canvas.js'], function( Dispatcher, Canvas ) {

  function Playback( canvas ) {
    Dispatcher.call(this);

    this.canvas_ = canvas;
    this.line_, this.min_, this._max_, this.width_, this.height_;
    this.timeout_;

    this.speed_ = 2;
  };
  Playback.prototype = new Dispatcher();

  Playback.Event = {};
  Playback.Event.START = "Playback.Event.START";
  Playback.Event.STOP = "Playback.Event.STOP";

  Playback.prototype.play = function( lineStr ) {
    var data = JSON.parse( lineStr );
    this.line_ = data.line;
    this.min_ = data.min;
    this.max_ = data.max;
    this.width_ = this.max_.x - this.min_.x;
    this.height_ = this.max_.y - this.min_.y;
    this.canvas_.setIsPlayingHistory( true );
    this.stepTo_( 0 );
    this.dispatch( Playback.Event.START );
  }

  Playback.prototype.stepTo_ = function( index ) {
    // Data structure is [ time, x, y ]
    var data = this.line_[ index ];
    var x = data[ 1 ] - this.min_.x + ( this.canvas_.getWidth() - this.width_ ) * .5;
    var y = data[ 2 ] - this.min_.y + ( this.canvas_.getHeight() - this.height_ ) * .5;
    if ( index == 0 ) this.canvas_.setLineAt( x, y );
    else this.canvas_.drawLineTo( x, y );
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
    clearTimeout( this.timeout_ );
    this.canvas_.setIsPlayingHistory( false );
    this.canvas_.draw( this.canvas_.getUndoHistory() );
    this.dispatch( Playback.Event.STOP );
  }

  return Playback;
});

