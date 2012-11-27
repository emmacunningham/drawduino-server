var vendor = 'scripts/vendor/';
var libs = 'scripts/libs/';
require( [
  "jquery",
    vendor + "dropdown.js",
    vendor + "prettify.js",
    vendor + "processing-1.4.1.min.js",
    libs + 'Noduino.js',
    libs + 'Noduino.Socket.js',
    libs + 'Logger.HTML.js'
  ],
  function( $, dropdown, prettify, processing, NoduinoObj, Connector, Logger ) {

    // Setup Arduino board inputs and outputs.
    // Here, tell it what pins our knobs are on.
    var Noduino = null;

    var INPUT_FACTOR = .25;
    var drawObjX = { prev : undefined, cur : undefined, delta : 0 };
    var drawObjY = { prev : undefined, cur : undefined, delta : 0 };

    var createObjects = function(board) {
      // Potentiometer X
      board.withAnalogInput( { pin: 'A0' }, createInputHandlerFor( drawObjX ) );
      board.withAnalogInput( { pin: 'A5' }, createInputHandlerFor( drawObjY ) );
    };

    var createInputHandlerFor = function( drawObj ) {
      return function( err, AnalogInput ) {
        AnalogInput.on('change', function(a) {
          var potValue = AnalogInput.value;
          drawObj.cur = potValue;
          if ( drawObj.prev != undefined ) {
            drawObj.delta += ( drawObj.cur - drawObj.prev) * INPUT_FACTOR;
          }
          drawObj.prev = drawObj.cur;
        });
      }
    }

    var drawBuffer = function() {
      if ( drawObjX.delta != 0 || drawObjY.delta != 0 ) {
        moveLine( drawObjX.delta, drawObjY.delta );
        drawObjX.delta = drawObjY.delta = 0;
      }
    }

    // To-do: Set up UI buttons.
    var setupUi = function() {
      $('#connect').click(function(e) {
        e.preventDefault();
        if (!Noduino || !Noduino.connected) {
          Noduino = new NoduinoObj({debug: true, host: 'http://localhost:8090', logger: {container: '#connection-log'}}, Connector, Logger);
          Noduino.connect(function(err, board) {
            createObjects(board);
          });
        }
      });
    }

    // History vars.
    var history = [];
    var startTime;

    var storeHistory = function() {
      var t = new Date();
      var time = t.getTime() - startTime;
      startTime = t.getTime();
      time = Math.min( time, 1000 );
      history.push( [ time, x, y ] );
      //console.log(history)
    }

    // Drawing vars.
    var canvas, ctx, processing;
    var w = 1000, h = 1000;
    var x = 0, y = 0;

    var moveLine = function( nx, ny ) {
      processing.stroke( 100 );
      processing.line( x, y, x + nx, y + ny );
      x += nx;
      y += ny;
      storeHistory();
    }

    var setLine = function( nx, ny ) {
      x = nx;
      y = ny;
      storeHistory();
    }

    var erase = function() {
      processing.background( 250 );
      history = [];
      var d = new Date();
      startTime = d.getTime();
    }

    var takeSnapshot = function() {
      return canvas.toDataURL();
    }

    $(document).ready(function(e) {
      // Set up processing.
      canvas = document.getElementById( "etchasketch" );
      ctx = canvas.getContext( '2d' );
      processing = new Processing( canvas );
      processing.size( w, h );
      erase();
      setLine( Math.round( w * .5 ), Math.round( h * .5 ) );

      // UI,
      setupUi();

      // Drawing timer.
      setInterval( drawBuffer, 100 );

      // Testing.
      $( document ).click( function( e ) {
        var range = 50;
        moveLine( Math.round( Math.random() * range - range * .5 ), Math.round( Math.random() * range - range * .5 ) );
      });
    });

  }
);