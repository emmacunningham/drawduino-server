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
    this.pos_ = { x: 0, y: 0 };

    // History.
    this.undoHistory_ = [];
    this.redoHistory_ = [];
    this.startTime_, this.historyTimeout_;
    this.undoInterval_, this.redoInterval_;
    this.replayHistory_;

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
    this.processing_.background( 250 );
    this.undoHistory_ = [];
    this.redoHistory_ = [];
    var d = new Date();
    this.startTime_ = d.getTime();
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
    this.updateTurtle();
    this.trace_( this.undoHistory_ );
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

  /***** Loading *****/

  Canvas.prototype.load = function( lineStr ) {
    var data = JSON.parse( lineStr );
    this.undoHistory_ = data.line;
    this.updateChange_();
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

  Canvas.prototype.drawLineBy = function( nx, ny ) {
    this.drawLineTo( this.pos_.x + nx, this.pos_.y + ny );
  }

  Canvas.prototype.moveLineTo = function( nx, ny ) {
    this.pos_.x = nx;
    this.pos_.y = ny;
    this.updateTurtle();
    this.updateHistory();
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

  /***** Undoing/redoing *****/

  Canvas.prototype.undo = function() {
      if ( this.undoHistory_.length > 1 ) {
        this.redoHistory_.push( this.undoHistory_.pop() );
        this.updateChange_();
      }
    }

  Canvas.prototype.redo = function() {
    if ( this.redoHistory_.length > 0 ) {
      this.undoHistory_.push( this.redoHistory_.pop() );
      this.updateChange_();
    }
  }

  Canvas.prototype.updateChange_ = function() {
    this.pos_.x = this.undoHistory_[ this.undoHistory_.length - 1 ][ 1 ];
    this.pos_.y = this.undoHistory_[ this.undoHistory_.length - 1 ][ 2 ];
    this.updateTurtle();
    this.trace_( this.undoHistory_ );
    this.dispatchChange();
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

  Canvas.prototype.getMin = function() {
    var obj = { x: 1000000, y: 1000000 };
    for ( var i = 0; i < this.undoHistory_.length; i++ ) {
      obj.x = Math.min( obj.x, this.undoHistory_[ i ][ 1 ] );
      obj.y = Math.min( obj.y, this.undoHistory_[ i ][ 2 ] );
    }
    return obj;
  }

  Canvas.prototype.getMax = function() {
    var obj = { x: -1000000, y: -1000000 };
    for ( var i = 0; i < this.undoHistory_.length; i++ ) {
      obj.x = Math.max( obj.x, this.undoHistory_[ i ][ 1 ] );
      obj.y = Math.max( obj.y, this.undoHistory_[ i ][ 2 ] );
    }
    return obj;
  }

  Canvas.prototype.getLineString = function() {
    var line = [];
    for ( var i = 0; i < this.undoHistory_.length; i++ ) {
      line.push( [ this.undoHistory_[ i ][ 0 ], this.undoHistory_[ i ][ 1 ], this.undoHistory_[ i ][ 2 ] ] );
    }
    // Get mins and maxes.
    var min = this.getMin();
    var max = this.getMax();
    // Subtract offsets from each position to get centered position.
    var offsetX = min.x - ( this.size_.w - ( max.x - min.x ) ) * .5;
    var offsetY = min.y - ( this.size_.h - ( max.y - min.y ) ) * .5;
    for ( var i = 0; i < line.length; i++ ) {
      data = line[ i ];
      data[ 1 ] -= offsetX;
      data[ 2 ] -= offsetY;
      // Set each position to be relative to center of screen.
      data[ 1 ] = data[ 1 ] - this.center_.x;
      data[ 2 ] = data[ 2 ] - this.center_.y;
    }
    var obj = { 'line' : line };
    return JSON.stringify( obj );
  }

  Canvas.prototype.getImageString = function() {
    // Get mins and maxes.
    var min = this.getMin();
    var max = this.getMax();
    // Reorient relative to top left corner.
    min.x += this.center_.x;
    max.x += this.center_.x;
    min.y += this.center_.y;
    max.y += this.center_.y;
    // Make copy canvas.
    var copy = document.createElement('canvas');
    copy.width = max.x - min.x;
    copy.height = max.y - min.y;
    var copyContext = copy.getContext('2d');
    copyContext.drawImage( this.el_, min.x, min.y, copy.width, copy.height, 0, 0, copy.width, copy.height );
    return copy.toDataURL();
  }

  return Canvas;
});

