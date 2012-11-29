define(function() {

  function Canvas( el ) {
    this.el_ = el;
    this.$canvas_ = $( this.el_ );
    this.context_ = this.el_.getContext( '2d' );
    this.processing_ = new Processing( this.el_ );

    // Spatial.
    this.size_ = { w : 0, h : 0 }, this.pos_ = { x: 0, y: 0 };

    // History.
    this.history_ = [];
    this.redoHistoryArr_ = [];
    this.startTime_, this.historyTimeout_;
    this.replayHistory_;
    this.isPlayingHistory_ = false;

  // Drawing.

  var drawObjX;
  var drawObjY;
  var canvas, ctx, processing;
  var WIDTH = 900, HEIGHT = 700;
  var x = 0, y = 0;

    // Init.
    this.updateCanvasSize();
  };

  Canvas.prototype.reset = function() {
    this.processing_.background( 250 );
    this.history_ = [];
    this.redoHistoryArr_ = [];
  }

  /***** Updating *****/

  Canvas.prototype.updateCanvasSize = function() {
    this.$canvas_.height( $(window).height() - this.$canvas_.offset().top - 25 );
    this.size_.w = this.$canvas_.width();
    this.size_.h = this.$canvas_.height();
    this.processing_.size( this.size_.w, this.size_.h );
    this.draw_( this.history_ );
  }

  /***** Drawing *****/

  Canvas.prototype.draw_ = function( line ) {
    this.processing_.background( 250 );
    var data;
    for ( var index = 0; index < line.length; index ++ ) {
      data = line[ index ];
      if ( index == 0 ) this.setLineAt_( data[ 1 ], data[ 2 ] );
      else this.drawLineTo_( data[ 1 ], data[ 2 ] );
    }
  }

  Canvas.prototype.setLineAt_ = function( nx, ny ) {
    this.pos_.x = nx;
    this.pos_.y = ny;
  }

  Canvas.prototype.drawLineTo_ = function( nx, ny ) {
    this.processing_.stroke( 30, 60 );
    this.processing_.line( this.pos_.x, this.pos_.y, nx, ny );
    this.pos_.x = nx;
    this.pos_.y = ny;
    //var canvasX = this.$canvas_.offset().left;
    //var canvasY = this.$canvas_.offset().top;
    //$turtle.offset( { left: canvasX + x - turtleSize.width * .5, top: canvasY + y - turtleSize.height * .5 } );
  }



  /***** Using history *****/

  Canvas.prototype.undoHistory = function() {
      if ( history.length > 1 ) {
        redoHistoryArr.push( history.pop() );
        drawHistory( history );
        updateHistoryUi();
      }
    }

  Canvas.prototype.redoHistory = function() {
    if ( redoHistoryArr.length > 0 ) {
      history.push( redoHistoryArr.pop() );
      drawHistory( history );
      updateHistoryUi();
    }
  }

  Canvas.prototype.storeHistory = function() {
    var t = new Date();
    var time = t.getTime() - startTime;
    startTime = t.getTime();
    time = Math.min( time, 1000 );
    var data = [ time, x, y ];
    history.push( data );
    redoHistoryArr = [];
    updateHistoryUi();
  }

  Canvas.prototype.getSerializedHistory = function() {
    return JSON.stringify( history );
  }


  Canvas.prototype.updateHistoryUi = function() {
    if ( history.length > 1 ) $(UI.UNDO).removeClass( 'disabled' );
    else $(UI.UNDO).addClass( 'disabled' );
    if ( redoHistoryArr.length > 0 ) $(UI.REDO).removeClass( 'disabled' );
    else $(UI.REDO).addClass( 'disabled' );
  }

  var undoInterval;
  Canvas.prototype.startUndoing = function() {
    undoInterval = setInterval( undoHistory, 100 );
  }
  Canvas.prototype.stopUndoing = function() {
    clearInterval( undoInterval );
  }

  var redoInterval;
  Canvas.prototype.startRedoing = function() {
    redoInterval = setInterval( redoHistory, 100 );
  }
  Canvas.prototype.stopRedoing = function() {
    clearInterval( redoInterval );
  }

  // Replaying history.

  Canvas.prototype.playHistory = function( serializedHistory ) {
    replayHistory = JSON.parse( serializedHistory );
    isPlayingHistory = true;
    showToolbar( false );
    playHistoryStep( 0 );
  }

  Canvas.prototype.playHistoryStep = function( index ) {
    // Data structure is [ time, x, y ]
    var data = replayHistory[ index ];
    if ( index == 0 ) setLine( data[ 1 ], data[ 2 ] );
    else moveLineTo( data[ 1 ], data[ 2 ] );
    if ( index < replayHistory.length - 1 ) {
      historyTimeout = setTimeout( function() {
        playHistoryStep( index + 1 );
      }, data[ 0 ]);
    } else {
      stopPlayingHistory();
    }
  }

  Canvas.prototype.stopPlayingHistory = function() {
    clearTimeout( historyTimeout );
    isPlayingHistory = false;
    showToolbar( true );
    drawHistory( history );
  }

  Canvas.prototype.moveLine = function( nx, ny ) {
    processing.stroke( 30, 60 );
    processing.line( x, y, x + nx, y + ny );
    x += nx;
    y += ny;
    storeHistory();
    var canvasX = $canvas.offset().left;
    var canvasY = $canvas.offset().top;
    $turtle.offset( { left: canvasX + x - turtleSize.width * .5, top: canvasY + y - turtleSize.height * .5 } );
  }


  Canvas.prototype.drawBuffer = function() {
    if ( drawObjX.delta != 0 || drawObjY.delta != 0 ) {
      moveLine( drawObjX.delta, drawObjY.delta );
      drawObjX.delta = drawObjY.delta = 0;
    }
  }

  Canvas.prototype.setLogger = function() {
  };

  return Canvas;
});

