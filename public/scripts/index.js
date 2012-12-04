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

    var INPUT_FACTOR = 5  ;
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
      var testHistory = '{"min":{"x":458,"y":464.25},"max":{"x":713.75,"y":720},"line":[[0,500,500],[1000,458,500],[101,500,500],[304,500.25,500],[507,500,500],[1000,500,500.25],[1000,500,464.25],[100,499.75,500],[1000,499.5,500],[807,462,500],[101,499.5,500],[704,498.75,500],[101,495.25,500],[101,492,500],[100,490.5,464.25],[100,484.75,500],[101,481.75,500],[1000,480.5,500],[101,479.25,500],[100,473.5,500],[100,469,500],[101,464.25,500],[100,460,500],[101,458.75,500],[100,458,500],[508,459,500],[103,462.75,500],[103,467.75,500],[101,458,500],[203,477.75,500],[304,478,500.25],[1000,458,500],[100,478,500],[101,478,503.5],[101,478,507.5],[102,478,511],[101,478,513.75],[101,478,515.5],[102,458,516.5],[101,478,464.25],[101,478,517],[1000,458,517],[100,477.75,517],[102,478,517],[101,478,517.25],[101,478,518],[101,478,520],[101,477,525.75],[101,477,532],[101,475.5,536.75],[101,474.25,555.5],[100,459.25,570.5],[104,471.25,583.5],[100,469.75,590.5],[101,468,603.5],[100,466.25,615],[101,464.75,633.25],[100,464,640.25],[101,458,659.5],[101,462,671.5],[100,461,684.5],[101,459.75,684.5],[101,459.75,702],[101,458.25,716.5],[100,458.25,717.5],[1000,458.25,717.75],[1000,458,717.75],[1000,458,707.5],[100,458,698.5],[101,458,682],[100,458,664],[104,458,464.25],[99,458,618.5],[101,458,595.75],[100,458,573.75],[100,458,555],[201,458,545.75],[706,458,585.75],[101,458,604.25],[101,460,621.25],[101,462,638.75],[101,463.75,655.75],[101,465.5,668],[101,466.5,672],[101,468.25,676.5],[100,469,696.25],[101,469,464.25],[101,470.25,464.25],[101,470.75,719.25],[102,472.5,490],[101,472.5,720],[101,473.25,720],[101,474.25,720],[201,475.25,720],[202,476,720],[101,476.75,720],[101,477.5,720],[201,478.25,720],[101,478.25,719.25],[100,478.75,708.5],[101,478.75,676.25],[101,478.75,646.25],[100,458,619.5],[101,480,598.5],[100,480.75,577.5],[101,481.5,560.25],[101,483.75,546.25],[102,485.25,533.5],[100,486.75,523.25],[102,488,517.25],[100,489.5,515.5],[102,490.75,514.5],[101,491.5,513.25],[101,492.25,512],[102,493.5,512],[201,493.25,512],[104,493.25,511.25],[604,494.5,508.25],[101,496.5,506],[101,498.5,503.75],[100,500,501.5],[101,500,499],[101,503.5,496.75],[101,505,494.5],[101,506.75,492.25],[101,507.75,491.25],[101,510.5,488.5],[101,523.25,485],[101,535.5,482.75],[101,550.75,480.5],[101,564.5,478],[101,570.75,475.75],[100,590.5,474.75],[101,604.25,472.25],[100,617.75,470.25],[100,631.75,468.5],[101,646.25,467.75],[101,658.25,465.5],[101,671.5,464.75],[101,683.5,464.75],[100,688.5,464.75],[102,698,464.75],[101,706,464.75],[100,710.5,464.75],[101,711.25,464.75],[101,712,464.75],[100,712.5,464.75],[202,713.75,464.75],[707,463.75,464.75],[101,713.75,464.75],[101,458,464.75],[101,713.75,464.75]]}';
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