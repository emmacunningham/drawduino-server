var line = 'scripts/line/';
var vendor = 'scripts/vendor/';
var libs = 'scripts/libs/';
require( [
    "jquery",
    line + "Canvas.js",
    line + "Playback.js",
    vendor + "dropdown.js",
    vendor + "prettify.js",
    vendor + "jquery-ui-1.9.2.custom.min.js",
    vendor + "processing-1.4.1.min.js",
    libs + 'Noduino.js',
    libs + 'Noduino.Socket.js',
    libs + 'Logger.HTML.js'
  ],
  function( $, Canvas, Playback, dropdown, prettify, ui, processing, NoduinoObj, Connector, Logger ) {

    var canvas, playback;

    // Set up UI.

    var UI = {
      TOOLBAR : '#toolbar',
      ERASE : '#erase',
      UNDO : '#undo',
      REDO: '#redo',
      PLAY_DEMO: '#playDemo'
    }

    var setupUi = function() {
      $(UI.ERASE).click( function() {
        shake();
        reset();
      });
       $(UI.UNDO).click( function() {
        canvas.undo();
      });
      $(UI.UNDO).mousedown( function() {
        canvas.startUndoing();
      });
      $(UI.UNDO).mouseup( function() {
        canvas.stopUndoing();
      });
      $(UI.UNDO).mouseout( function() {
        canvas.stopUndoing();
      });
      $(UI.REDO).click( function() {
        canvas.redo();
      });
      $(UI.REDO).mousedown( function() {
        canvas.startRedoing();
      });
      $(UI.REDO).mouseup( function() {
        canvas.stopRedoing();
      });
      $(UI.REDO).mouseout( function() {
        canvas.stopRedoing();
      });
      $(UI.PLAY_DEMO).click( function() {
        playDemo();
      });
      updateHistoryUi();
    }

    // Set up Noduino.

    var Noduino = null;
    var drawObjX;
    var drawObjY;

    var pollForBoard = function() {
      // Poll indefinitely so we can connect and disconnect at will.
      // To-do: Detect disconnection.
      var pollInterval = setInterval( function() {
        if (!Noduino || !Noduino.connected) {
          Noduino = new NoduinoObj({debug: true, host: 'http://localhost:8090', logger: {container: '#connection-log'}}, Connector, Logger);
          Noduino.connect(function(err, board) {
            // Listen to input.
            board.withAnalogInput( { pin: 'A0' }, createBoardInputHandler( drawObjX ) );
            board.withAnalogInput( { pin: 'A5' }, createBoardInputHandler( drawObjY ) );
            board.withRotaryInput( { pin: '2' }, rotaryHandler() );
            board.withRotaryInput( { pin: '3' }, rotaryHandler() );
          });
        }
      }, 1000 );
    }

    var INPUT_FACTOR = .25;

    var rotaryHandler = function(  ) {
      return function( err, RotaryInput ) {
        console.log('hey!');
      }
    }

    var createBoardInputHandler = function( drawObj ) {
      return function( err, AnalogInput ) {
        AnalogInput.on('change', function(a) {
          if ( !canvas.getIsPlayingHistory() ) {
            var potValue = AnalogInput.value;
            drawObj.cur = potValue;
            if ( drawObj.prev != undefined ) {
              drawObj.delta += ( drawObj.cur - drawObj.prev) * INPUT_FACTOR;
            }
            drawObj.prev = drawObj.cur;
          }
        });
      }
    }

    var showToolbar = function( show ) {
      if ( show ) $(UI.TOOLBAR).show();
      else $(UI.TOOLBAR).hide();
    }

    var onResize = function( e ) {
      canvas.updateSize();
    }

    var onCanvasChange_ = function( e ) {
      updateHistoryUi();
    }

    var onPlaybackStart_ = function() {
      showToolbar( false );
    }

    var onPlaybackStop_ = function() {
      showToolbar( true );
    }

    var shake = function() {
      $( 'body' ).effect( "shake", { direction: 'up', times: 3 }, 600 );
    }

    var reset = function() {
      canvas.reset();
      drawObjX = { prev : undefined, cur : undefined, delta : 0 };
      drawObjY = { prev : undefined, cur : undefined, delta : 0 };
    }

    var drawBuffer = function() {
      if ( drawObjX.delta != 0 || drawObjY.delta != 0 ) {
        canvas.drawLineBy( drawObjX.delta, drawObjY.delta );
        drawObjX.delta = drawObjY.delta = 0;
      }
    }

    var updateHistoryUi = function() {
      var undoHistory = canvas.getUndoHistory(), redoHistory = canvas.getRedoHistory();
      if ( undoHistory.length > 1 ) $(UI.UNDO).removeClass( 'disabled' );
      else $(UI.UNDO).addClass( 'disabled' );
      if ( redoHistory.length > 0 ) $(UI.REDO).removeClass( 'disabled' );
      else $(UI.REDO).addClass( 'disabled' );
    }

    // Testing.

    var testInput = function( drawObj, value ) {
      drawObj.cur = value;
      if ( drawObj.prev != undefined ) {
        drawObj.delta += ( drawObj.cur - drawObj.prev) * INPUT_FACTOR;
      }
      drawObj.prev = drawObj.cur;
    }

    var playDemo = function() {
      var testHistory = '{"min":{"x":458,"y":464.25},"max":{"x":713.75,"y":720},"line":[[0,0,0],[1000,-42,0],[101,42,0],[304,0.25,0],[507,-0.25,0],[1000,0,0.25],[1000,0,-36],[100,-0.25,35.75],[1000,-0.25,0],[807,-37.5,0],[101,37.5,0],[704,-0.75,0],[101,-3.5,0],[101,-3.25,0],[100,-1.5,-35.75],[100,-5.75,35.75],[101,-3,0],[1000,-1.25,0],[101,-1.25,0],[100,-5.75,0],[100,-4.5,0],[101,-4.75,0],[100,-4.25,0],[101,-1.25,0],[100,-0.75,0],[508,1,0],[103,3.75,0],[103,5,0],[101,-9.75,0],[203,19.75,0],[304,0.25,0.25],[1000,-20,-0.25],[100,20,0],[101,0,3.5],[101,0,4],[102,0,3.5],[101,0,2.75],[101,0,1.75],[102,-20,1],[101,20,-52.25],[101,0,52.75],[1000,-20,0],[100,19.75,0],[102,0.25,0],[101,0,0.25],[101,0,0.75],[101,0,2],[101,-1,5.75],[101,0,6.25],[101,-1.5,4.75],[101,-1.25,18.75],[100,-15,15],[104,12,13],[100,-1.5,7],[101,-1.75,13],[100,-1.75,11.5],[101,-1.5,18.25],[100,-0.75,7],[101,-6,19.25],[101,4,12],[100,-1,13],[101,-1.25,0],[101,0,17.5],[101,-1.5,14.5],[100,0,1],[1000,0,0.25],[1000,-0.25,0],[1000,0,-10.25],[100,0,-9],[101,0,-16.5],[100,0,-18],[104,0,-199.75],[99,0,154.25],[101,0,-22.75],[100,0,-22],[100,0,-18.75],[201,0,-9.25],[706,0,40],[101,0,18.5],[101,2,17],[101,2,17.5],[101,1.75,17],[101,1.75,12.25],[101,1,4],[101,1.75,4.5],[100,0.75,19.75],[101,0,-232],[101,1.25,0],[101,0.5,255],[102,1.75,-229.25],[101,0,230],[101,0.75,0],[101,1,0],[201,1,0],[202,0.75,0],[101,0.75,0],[101,0.75,0],[201,0.75,0],[101,0,-0.75],[100,0.5,-10.75],[101,0,-32.25],[101,0,-30],[100,-20.75,-26.75],[101,22,-21],[100,0.75,-21],[101,0.75,-17.25],[101,2.25,-14],[102,1.5,-12.75],[100,1.5,-10.25],[102,1.25,-6],[100,1.5,-1.75],[102,1.25,-1],[101,0.75,-1.25],[101,0.75,-1.25],[102,1.25,0],[201,-0.25,0],[104,0,-0.75],[604,1.25,-3],[101,2,-2.25],[101,2,-2.25],[100,1.5,-2.25],[101,0,-2.5],[101,3.5,-2.25],[101,1.5,-2.25],[101,1.75,-2.25],[101,1,-1],[101,2.75,-2.75],[101,12.75,-3.5],[101,12.25,-2.25],[101,15.25,-2.25],[101,13.75,-2.5],[101,6.25,-2.25],[100,19.75,-1],[101,13.75,-2.5],[100,13.5,-2],[100,14,-1.75],[101,14.5,-0.75],[101,12,-2.25],[101,13.25,-0.75],[101,12,0],[100,5,0],[102,9.5,0],[101,8,0],[100,4.5,0],[101,0.75,0],[101,0.75,0],[100,0.5,0],[202,1.25,0],[707,-250,0],[101,250,0],[101,-255.75,0],[101,255.75,0]]}';
      playback.play( testHistory );
    }

    // Init.

    $(document).ready(function(e) {
      canvas = new Canvas( document.getElementById( 'canvas' ) );
      canvas.addEventListener( Canvas.Event.CHANGE, onCanvasChange_ );
      playback = new Playback( canvas );
      playback.addEventListener( Playback.Event.START, onPlaybackStart_ );
      playback.addEventListener( Playback.Event.STOP, onPlaybackStop_ );

      // UI.
      reset();
      setupUi();
      setInterval( drawBuffer, 50 );
      pollForBoard();

      // Testing.
      canvas.$get().click( function( e ) {
        var range = 200;
        testInput( drawObjX, Math.round( Math.random() * range - range * .5 ) );
        testInput( drawObjY, Math.round( Math.random() * range - range * .5 ) );
      });

      $( document ).keypress( function( e ) {
        switch( e.keyCode ) {
          case 96:
            $('#connection-log').fadeToggle();
            break;
        }
      });

      $( window ).resize( onResize );
    });

  }
);