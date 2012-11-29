define(['scripts/lfl/events/Dispatcher.js'], function( Dispatcher ) {

  function Canvas( el ) {
    Dispatcher.call(this);

    this.el_ = el;
    this.$canvas_ = $( this.el_ );
    this.context_ = this.el_.getContext( '2d' );
    this.processing_ = new Processing( this.el_ );

    // Spatial.
    this.size_ = { w : 0, h : 0 }, this.pos_ = { x: 0, y: 0 };

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
    this.centerTurtle();
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
    this.updateHistory();
  }

  /***** Updating *****/

  Canvas.prototype.updateSize = function() {
    this.$canvas_.height( $(window).height() - this.$canvas_.offset().top - 25 );
    this.size_.w = this.$canvas_.width();
    this.size_.h = this.$canvas_.height();
    this.processing_.size( this.size_.w, this.size_.h );
    this.draw_( this.undoHistory_ );
  }

  Canvas.prototype.updateTurtle = function() {
    var x = this.$canvas_.offset().left + this.pos_.x - this.turtleSize_.w * .5;
    var y = this.$canvas_.offset().top + this.pos_.y - this.turtleSize_.h * .5;
    this.$turtle_.offset( { left: x, top: y  } );
  }

  Canvas.prototype.updateHistory = function() {
    var t = new Date();
    var time = t.getTime() - this.startTime_;
    this.startTime_ = t.getTime();
    time = Math.min( time, 1000 );
    var data = [ time, this.pos_.x, this.pos_.y ];
    this.undoHistory_.push( data );
    this.redoHistory_ = [];
    this.dispatchChange();
  }

  Canvas.prototype.dispatchChange = function() {
    this.dispatch( Canvas.Event.CHANGE );
  }

  /***** Drawing *****/

  Canvas.prototype.draw_ = function( line ) {
    this.processing_.background( 250 );
    var data;
    for ( var index = 0; index < line.length; index ++ ) {
      data = line[ index ];
      if ( index == 0 ) this.setLineAt( data[ 1 ], data[ 2 ] );
      else this.drawLineTo( data[ 1 ], data[ 2 ] );
    }
  }

  Canvas.prototype.setLineAt = function( nx, ny ) {
    this.pos_.x = nx;
    this.pos_.y = ny;
  }

  Canvas.prototype.drawLineTo = function( nx, ny ) {
    this.processing_.stroke( 30, 60 );
    this.processing_.line( this.pos_.x, this.pos_.y, nx, ny );
    this.pos_.x = nx;
    this.pos_.y = ny;
    this.updateTurtle();
  }

  Canvas.prototype.drawLineBy = function( nx, ny ) {
    this.processing_.stroke( 30, 60 );
    this.processing_.line( this.pos_.x, this.pos_.y, this.pos_.x + nx, this.pos_.y + ny );
    this.pos_.x += nx;
    this.pos_.y += ny;
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
        this.draw_( this.undoHistory_ );
        this.dispatchChange();
      }
    }

  Canvas.prototype.redo = function() {
    if ( this.redoHistory_.length > 0 ) {
      this.undoHistory_.push( this.redoHistory_.pop() );
      this.draw_( this.undoHistory_ );
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
    return JSON.stringify( history );
  }

  Canvas.prototype.getImageString = function() {
    return canvas.toDataURL();
  }

  Canvas.prototype.getIsPlayingHistory = function() {
    return this.isPlayingHistory_;
  }

  return Canvas;
});

