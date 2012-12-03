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
            // Listen to rotary input.
            // Specify which interrupt pin is attached to the rotary encoder.
            // For drawObjX, make sure right pin is attached to interrupt.
            // For drawObjY, make sure left pin is attached to interrupt.
            board.withRotaryInput( { pin: '3' }, createBoardInputHandler( drawObjX )  );
            board.withRotaryInput( { pin: '2' }, createBoardInputHandler( drawObjY ) );
          });
        }
      }, 1000 );
    }

    var INPUT_FACTOR = 5;
    var createBoardInputHandler = function( drawObj ) {
      return function( err, RotaryInput ) {
        RotaryInput.on('change', function(a) {
          if ( !canvas.getIsPlayingHistory() ) {
            var rotaryValue = RotaryInput.value;
            console.log(RotaryInput.value);
            drawObj.cur = rotaryValue;
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
      // This data is based off the center as the origin.
      var testHistory = '{"min":{"x":0,"y":0},"max":{"x":0,"y":0},"line":[[0,-72.375,-56.625],[2,-85.875,-92.125],[2,-85.875,-92.125],[3,-127.875,-92.125],[2,-85.875,-92.125],[250,-85.625,-92.125],[27,-85.875,-92.125],[78,-85.875,-91.875],[129,-85.875,-127.875],[253,-86.125,-92.125],[253,-86.375,-92.125],[27,-123.875,-92.125],[252,-86.375,-92.125],[204,-87.125,-92.125],[27,-90.625,-92.125],[177,-93.875,-92.125],[26,-95.375,-127.875],[27,-101.125,-92.125],[27,-104.125,-92.125],[27,-105.375,-92.125],[27,-106.625,-92.125],[253,-112.375,-92.125],[26,-116.875,-92.125],[27,-121.625,-92.125],[27,-125.875,-92.125],[27,-127.125,-92.125],[27,-127.875,-92.125],[26,-126.875,-92.125],[27,-123.125,-92.125],[129,-118.125,-92.125],[27,-127.875,-92.125],[28,-108.125,-92.125],[26,-107.875,-91.875],[53,-127.875,-92.125],[79,-107.875,-92.125],[252,-107.875,-88.625],[26,-107.875,-84.625],[27,-107.875,-81.125],[27,-107.875,-78.375],[27,-107.875,-76.625],[28,-127.875,-75.625],[27,-107.875,-127.875],[27,-107.875,-75.125],[27,-127.875,-75.125],[27,-108.125,-75.125],[251,-107.875,-75.125],[27,-107.875,-74.875],[27,-107.875,-74.125],[27,-107.875,-72.125],[27,-108.875,-66.375],[27,-108.875,-60.125],[26,-110.375,-55.375],[27,-111.625,-36.625],[27,-126.625,-21.625],[28,-114.625,-8.625],[28,-116.125,-1.625],[28,-117.875,11.375],[27,-119.625,22.875],[28,-121.125,41.125],[26,-121.875,48.125],[28,-127.875,67.375],[27,-123.875,79.375],[26,-124.875,92.375],[26,-126.125,92.375],[27,-126.125,109.875],[27,-127.625,124.375],[27,-127.625,125.375],[26,-127.625,125.625],[27,-127.875,125.625],[252,-127.875,115.375],[252,-127.875,106.375],[251,-127.875,89.875],[27,-127.875,71.875],[28,-127.875,-127.875],[27,-127.875,26.375],[27,-127.875,3.625],[26,-127.875,-18.375],[26,-127.875,-37.125],[26,-127.875,-46.375],[27,-127.875,-6.375],[52,-127.875,12.125],[177,-125.875,29.125],[26,-123.875,46.625],[26,-122.125,63.625],[27,-120.375,75.875],[28,-119.375,79.875],[27,-117.625,84.375],[26,-116.875,104.125],[27,-116.875,-127.875],[28,-115.625,-127.875],[27,-115.125,127.125],[26,-113.375,-102.125],[27,-113.375,127.875],[28,-112.625,127.875],[27,-111.625,127.875],[26,-110.625,127.875],[27,-109.875,127.875],[51,-109.125,127.875],[53,-108.375,127.875],[27,-107.625,127.875],[38,-107.625,127.125],[52,-107.125,116.375],[27,-107.125,84.125],[27,-107.125,54.125],[26,-127.875,27.375],[27,-105.875,6.375],[26,-105.125,-14.625],[28,-104.375,-31.875],[27,-102.125,-45.875],[26,-100.625,-58.625],[26,-99.125,-68.875],[27,-97.875,-74.875],[26,-96.375,-76.625],[27,-95.125,-77.625],[26,-94.375,-78.875],[27,-93.625,-80.125],[27,-92.375,-80.125],[26,-92.625,-80.125],[27,-92.625,-80.875],[52,-91.375,-83.875],[29,-89.375,-86.125],[152,-87.375,-88.375],[28,-85.875,-90.625],[26,-85.875,-93.125],[27,-82.375,-95.375],[27,-80.875,-97.625],[27,-79.125,-99.875],[27,-78.125,-100.875],[27,-75.375,-103.625],[28,-62.625,-107.125],[28,-50.375,-109.375],[27,-35.125,-111.625],[26,-21.375,-114.125],[28,-15.125,-116.375],[27,4.625,-117.375],[26,18.375,-119.875],[27,31.875,-121.875],[26,45.875,-123.625],[26,60.375,-124.375],[27,72.375,-126.625],[27,85.625,-127.375],[27,97.625,-127.375],[28,102.625,-127.375],[27,112.125,-127.375],[27,120.125,-127.375],[27,124.625,-127.375],[26,125.375,-127.375],[27,126.125,-127.375],[26,126.625,-127.375],[27,127.875,-127.375],[27,-122.125,-127.375],[53,127.875,-127.375],[178,-127.875,-127.375],[27,127.875,-127.375]]}';
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
        var range = 40;
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