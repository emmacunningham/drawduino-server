var line = 'scripts/line/';
var vendor = 'scripts/vendor/';
var libs = 'scripts/libs/';
require( [
    "jquery",
    line + "Canvas.js",
    line + "Playback.js",
    line + "Stash.js",
    vendor + "dropdown.js",
    vendor + "prettify.js",
    vendor + "jquery-ui-1.9.2.custom.min.js",
    vendor + "processing-1.4.1.min.js",
    libs + 'Noduino.js',
    libs + 'Noduino.Socket.js',
    libs + 'Logger.HTML.js'
  ],
  function( $, Canvas, Playback, Stash, dropdown, prettify, ui, processing, NoduinoObj, Connector, Logger ) {

    var canvas, playback, stash;

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
          var rotaryValue = RotaryInput.value;
          console.log(RotaryInput.value);
          drawObj.cur = rotaryValue;
          if ( drawObj.prev != undefined ) {
            drawObj.delta += ( drawObj.cur - drawObj.prev) * INPUT_FACTOR;
          }
          drawObj.prev = drawObj.cur;
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

    var doTestInput = function() {
      var range = 40;
      testInput( drawObjX, Math.round( Math.random() * range - range * .5 ) );
      testInput( drawObjY, Math.round( Math.random() * range - range * .5 ) );
    }

    var testInput = function( drawObj, value ) {
      drawObj.cur = value;
      if ( drawObj.prev != undefined ) {
        drawObj.delta += ( drawObj.cur - drawObj.prev) * INPUT_FACTOR;
      }
      drawObj.prev = drawObj.cur;
    }

    var testImage = function() {
      var img = new Image();
      img.src = canvas.getImageString();
      document.body.appendChild(img);
    }

    var playDemo = function() {
      // This data is based off the center as the origin.
      var demoLineString = '{"line":[[2,-72.375,-56.625],[3,-85.875,-92.125],[5,-85.875,-92.125],[2,-127.875,-92.125],[5,-85.875,-92.125],[5,-85.625,-92.125],[126,-85.875,-92.125],[14,-85.875,-91.875],[40,-85.875,-127.875],[66,-86.125,-92.125],[127,-86.375,-92.125],[128,-123.875,-92.125],[14,-86.375,-92.125],[126,-87.125,-92.125],[104,-90.625,-92.125],[14,-93.875,-92.125],[89,-95.375,-127.875],[14,-101.125,-92.125],[14,-104.125,-92.125],[14,-105.375,-92.125],[14,-106.625,-92.125],[14,-112.375,-92.125],[128,-116.875,-92.125],[14,-121.625,-92.125],[14,-125.875,-92.125],[13,-127.125,-92.125],[14,-127.875,-92.125],[14,-126.875,-92.125],[14,-123.125,-92.125],[14,-118.125,-92.125],[65,-127.875,-92.125],[15,-108.125,-92.125],[14,-107.875,-91.875],[15,-127.875,-92.125],[26,-107.875,-92.125],[41,-107.875,-88.625],[127,-107.875,-84.625],[15,-107.875,-81.125],[14,-107.875,-78.375],[14,-107.875,-76.625],[14,-127.875,-75.625],[14,-107.875,-127.875],[14,-107.875,-75.125],[15,-127.875,-75.125],[14,-108.125,-75.125],[14,-107.875,-75.125],[126,-107.875,-74.875],[15,-107.875,-74.125],[14,-107.875,-72.125],[13,-108.875,-66.375],[14,-108.875,-60.125],[14,-110.375,-55.375],[13,-111.625,-36.625],[14,-126.625,-21.625],[14,-114.625,-8.625],[15,-116.125,-1.625],[15,-117.875,11.375],[15,-119.625,22.875],[14,-121.125,41.125],[15,-121.875,48.125],[14,-127.875,67.375],[14,-123.875,79.375],[14,-124.875,92.375],[14,-126.125,92.375],[14,-126.125,109.875],[15,-127.625,124.375],[14,-127.625,125.375],[14,-127.625,125.625],[13,-127.875,125.625],[14,-127.875,115.375],[128,-127.875,106.375],[127,-127.875,89.875],[127,-127.875,71.875],[14,-127.875,-127.875],[15,-127.875,26.375],[14,-127.875,3.625],[14,-127.875,-18.375],[13,-127.875,-37.125],[14,-127.875,-46.375],[14,-127.875,-6.375],[14,-127.875,12.125],[27,-125.875,29.125],[90,-123.875,46.625],[13,-122.125,63.625],[14,-120.375,75.875],[14,-119.375,79.875],[14,-117.625,84.375],[14,-116.875,104.125],[14,-116.875,-127.875],[14,-115.625,-127.875],[15,-115.125,127.125],[13,-113.375,-102.125],[15,-113.375,127.875],[14,-112.625,127.875],[15,-111.625,127.875],[13,-110.625,127.875],[14,-109.875,127.875],[14,-109.125,127.875],[26,-108.375,127.875],[27,-107.625,127.875],[14,-107.625,127.125],[21,-107.125,116.375],[27,-107.125,84.125],[14,-107.125,54.125],[14,-127.875,27.375],[14,-105.875,6.375],[13,-105.125,-14.625],[15,-104.375,-31.875],[14,-102.125,-45.875],[15,-100.625,-58.625],[14,-99.125,-68.875],[14,-97.875,-74.875],[13,-96.375,-76.625],[14,-95.125,-77.625],[14,-94.375,-78.875],[14,-93.625,-80.125],[15,-92.375,-80.125],[13,-92.625,-80.125],[15,-92.625,-80.875],[14,-91.375,-83.875],[27,-89.375,-86.125],[15,-87.375,-88.375],[77,-85.875,-90.625],[15,-85.875,-93.125],[14,-82.375,-95.375],[14,-80.875,-97.625],[14,-79.125,-99.875],[14,-78.125,-100.875],[14,-75.375,-103.625],[14,-62.625,-107.125],[15,-50.375,-109.375],[15,-35.125,-111.625],[15,-21.375,-114.125],[14,-15.125,-116.375],[15,4.625,-117.375],[14,18.375,-119.875],[14,31.875,-121.875],[14,45.875,-123.625],[14,60.375,-124.375],[14,72.375,-126.625],[14,85.625,-127.375],[14,97.625,-127.375],[14,102.625,-127.375],[15,112.125,-127.375],[15,120.125,-127.375],[14,124.625,-127.375],[13,125.375,-127.375],[14,126.125,-127.375],[15,126.625,-127.375],[14,127.875,-127.375],[14,-122.125,-127.375],[13,127.875,-127.375],[28,-127.875,-127.375],[90,127.875,-127.375]]}';
      stash.store( canvas.getLineString() );
      playback.play( demoLineString );
    }

    // Init.

    $(document).ready(function(e) {
      canvas = new Canvas( document.getElementById( 'canvas' ) );
      canvas.addEventListener( Canvas.Event.CHANGE, onCanvasChange_ );
      playback = new Playback( canvas );
      playback.addEventListener( Playback.Event.START, onPlaybackStart_ );
      playback.addEventListener( Playback.Event.STOP, onPlaybackStop_ );
      stash = new Stash();

      // UI.
      reset();
      setupUi();
      setInterval( drawBuffer, 50 );
      pollForBoard();

      // Testing.
      canvas.$get().click( function( e ) {
        if ( playback.getIsPlaying() ) {
          playback.stop();
          canvas.load( stash.retrieveAndClear() );
        } else {
          doTestInput();
        }

        //testImage();
        //doTestInput();

        //console.log(canvas.getLineString());

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