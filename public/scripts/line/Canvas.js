define(['scripts/lfl/events/Dispatcher.js'], function( Dispatcher ) {

  function Canvas( el ) {
    Dispatcher.call(this);

    this.el_ = el;
    this.$canvas_ = $( this.el_ );
    this.context_ = this.el_.getContext( '2d' );
    this.processing_ = new Processing( this.el_ );

    // Spatial.
    this.size_ = { w : 0, h : 0 };
    this.center_ = { x : 0, y : 0 };
    //this.prevPos_ = { x: 0, y: 0 };
    this.pos_ = { x: 0, y: 0 };
    this.min_ = { x: 0, y: 0 };
    this.max_ = { x: 0, y: 0 };
    this.width_ = 0; this.height_ = 0;

    // History.
    this.undoHistory_ = [];
    this.redoHistory_ = [];
    this.startTime_, this.historyTimeout_;
    this.undoInterval_, this.redoInterval_;
    this.replayHistory_;
    this.isPlayingHistory_ = false;

    // Turtle.
    this.$turtle_ = $( '#turtle' );
    this.turtleSize_ = { w: this.$turtle_.width(), h: this.$turtle_.height() };

    // Init.
    this.updateSize();
  };
  Canvas.prototype = new Dispatcher();

  Canvas.Event = {};
  Canvas.Event.CHANGE = "Canvas.Event.CHANGE";

  Canvas.prototype.reset = function() {
    //this.prevPos_.x = this.pos_.x;
    //this.prevPos_.y = this.pos_.y;
    this.processing_.background( 250 );
    this.undoHistory_ = [];
    this.redoHistory_ = [];
    var d = new Date();
    this.startTime_ = d.getTime();
    this.updateHistory();
    this.updateSize();
  }

  /***** Updating *****/

  Canvas.prototype.updateSize = function() {
    this.$canvas_.height( $(window).height() - this.$canvas_.offset().top - 25 );
    this.size_.w = this.$canvas_.width();
    this.size_.h = this.$canvas_.height();
    this.center_.x = this.size_.w * .5;
    this.center_.y = this.size_.h * .5;
    this.processing_.size( this.size_.w, this.size_.h );
    this.updateMinMax_();
    this.updateTurtle();
    this.trace_( this.undoHistory_ );
  }

  Canvas.prototype.updateMinMax_ = function() {
    var undoData = Canvas.findMinMax( this.undoHistory_ );
    var redoData = Canvas.findMinMax( this.redoHistory_ );
    this.min_.x = Math.min( undoData.min.x, redoData.min.x );
    this.min_.y = Math.min( undoData.min.y, redoData.min.y );
    this.max_.x = Math.max( undoData.max.x, redoData.max.x );
    this.max_.y = Math.max( undoData.max.y, redoData.max.y );
    this.width_ = this.max_.x - this.min_.x;
    this.height_ = this.max_.y - this.min_.y;
  }

  Canvas.prototype.updateTurtle = function() {
    var x = this.center_.x + this.$canvas_.offset().left + this.pos_.x - this.turtleSize_.w * .5;
    var y = this.center_.y + this.$canvas_.offset().top + this.pos_.y - this.turtleSize_.h * .5;
    this.$turtle_.offset( { left: x, top: y  } );
  }

  Canvas.prototype.updateHistory = function() {
    var t = new Date();
    var time = t.getTime() - this.startTime_;
    this.startTime_ = t.getTime();
    time = Math.min( time, 1000 );
    var x = this.pos_.x;
    var y = this.pos_.y;
    this.undoHistory_.push( [ time, x, y ] );
    this.redoHistory_ = [];
    this.dispatchChange();
  }

  Canvas.prototype.dispatchChange = function() {
    this.dispatch( Canvas.Event.CHANGE );
  }

  /***** Drawing *****/

  Canvas.prototype.trace_ = function( line ) {
    this.processing_.background( 250 );
    var data, prevData;
    var x = this.center_.x;
    var y = this.center_.y;
    this.processing_.stroke( 30, 60 );
    for ( var index = 1; index < line.length; index ++ ) {
      data = line[ index ];
      prevData = line[ index - 1 ];
      this.processing_.line( x + prevData[ 1 ], y + prevData[ 2 ], x + data[ 1 ], y + data[ 2 ] );
    }
  }

  Canvas.prototype.drawLineTo = function( nx, ny ) {
    this.processing_.stroke( 30, 60 );
    this.processing_.line(
        this.center_.x + this.pos_.x,
        this.center_.y + this.pos_.y,
        this.center_.x + nx,
        this.center_.y + ny
      );
    this.pos_.x = nx;
    this.pos_.y = ny;
    this.updateTurtle();
    this.updateHistory();
  }

  /***** Turtle *****/

  Canvas.prototype.centerTurtle = function() {
    this.pos_.x = Math.round( this.size_.w * .5 );
    this.pos_.y = Math.round( this.size_.h * .5 );
    this.updateTurtle();
  }

  /***** Undoing/redoing *****/

  Canvas.prototype.undo = function() {
      if ( this.undoHistory_.length > 1 ) {
        this.redoHistory_.push( this.undoHistory_.pop() );
        this.pos_.x = this.undoHistory_[ this.undoHistory_.length - 1 ][ 1 ];
        this.pos_.y = this.undoHistory_[ this.undoHistory_.length - 1 ][ 2 ];
        this.updateTurtle();
        this.trace_( this.undoHistory_ );
        this.dispatchChange();
      }
    }

  Canvas.prototype.redo = function() {
    if ( this.redoHistory_.length > 0 ) {
      this.undoHistory_.push( this.redoHistory_.pop() );
      this.pos_.x = this.undoHistory_[ this.undoHistory_.length - 1 ][ 1 ];
      this.pos_.y = this.undoHistory_[ this.undoHistory_.length - 1 ][ 2 ];
      this.updateTurtle();
      this.trace_( this.undoHistory_ );
      this.dispatchChange();
    }
  }

  Canvas.prototype.startUndoing = function() {
    var self = this;
    this.undoInterval_ = setInterval( function(){ self.undo() }, 100 );
  }

  Canvas.prototype.stopUndoing = function() {
    clearInterval( this.undoInterval_ );
  }

  Canvas.prototype.startRedoing = function() {
    var self = this;
    this.redoInterval_ = setInterval( function(){ self.redo() }, 100 );
  }

  Canvas.prototype.stopRedoing = function() {
    clearInterval( this.redoInterval_ );
  }

   /***** Utility *****/

  Canvas.findMinMax = function( line ) {
    var min = { x: 100000, y: 1000000 };
    var max = { x: 0, y: 0 };
    var data;
    for ( var i = 0; i < line.length; i++ ) {
      data = line[ i ];
      if ( data[ 1 ] < min.x ) min.x = data[ 1 ];
      if ( data[ 2 ] < min.y ) min.y = data[ 2 ];
      if ( data[ 1 ] > max.x ) max.x = data[ 1 ];
      if ( data[ 2 ] > max.y ) max.y = data[ 2 ];
    }
    return { min: min, max: max };
  }

  /***** Setters *****/

  Canvas.prototype.setIsPlayingHistory = function( val ) {
    this.isPlayingHistory_ = val;
  }

  /***** Getters *****/

  Canvas.prototype.$get = function() {
    return this.$canvas_;
  }

  Canvas.prototype.getX = function() {
    return this.pos_.x;
  }

  Canvas.prototype.getY = function() {
    return this.pos_.y;
  }

  Canvas.prototype.getWidth = function() {
    return this.size_.w;
  }

  Canvas.prototype.getHeight = function() {
    return this.size_.h;
  }

  Canvas.prototype.getUndoHistory = function() {
    return this.undoHistory_;
  }

  Canvas.prototype.getRedoHistory = function() {
    return this.redoHistory_;
  }

  Canvas.prototype.getHistoryString = function() {

    var minX = 100000, minY = 1000000;
    var maxX = -100000, maxY = -1000000;
    var data;

    // Get mins and maxes.
    for ( var i = 0; i < this.undoHistory_.length; i++ ) {
      data = this.undoHistory_[ i ];
      minX = Math.min( data[ 1 ], minX );
      minY = Math.min( data[ 2 ], minY );
      maxX = Math.max( data[ 1 ], maxX );
      maxY = Math.max( data[ 2 ], maxY );
    }
    // Subtract offsets from each position to get centered position.
    var offsetX = minX - ( this.size_.w - ( maxX - minX ) ) * .5;
    var offsetY = minY - ( this.size_.h - ( maxY - minY ) ) * .5;
    for ( var i = 0; i < this.undoHistory_.length; i++ ) {
      data = this.undoHistory_[ i ];
      data[ 1 ] -= offsetX;
      data[ 2 ] -= offsetY;
    }
    // Find relation of each point to center of screen.
    for ( var i = 0; i < this.undoHistory_.length; i++ ) {
      data = this.undoHistory_[ i ];
      data[ 1 ] = data[ 1 ] - this.center_.x;
      data[ 2 ] = data[ 2 ] - this.center_.y;
    }

    var line = [];
    for ( var i = 0; i < this.undoHistory_.length; i++ ) {
      line.push( [ this.undoHistory_[ i ][ 0 ], this.undoHistory_[ i ][ 1 ], this.undoHistory_[ i ][ 2 ] ] );
    }
    var data = { 'min' : this.min_, 'max' : this.max_, 'line' : line };
    return JSON.stringify( data );
  }

  Canvas.prototype.getImageString = function() {
    return canvas.toDataURL();
  }

  Canvas.prototype.getIsPlayingHistory = function() {
    return this.isPlayingHistory_;
  }

  return Canvas;
});

