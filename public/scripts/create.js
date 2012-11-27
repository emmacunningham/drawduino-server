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

    // Set up UI buttons.

    // History vars.
    var history = [];
    var startTime;

    var storeHistory = function() {
      var t = new Date();
      var time = t.getTime() - startTime;
      startTime = t.getTime();
      time = Math.min( time, 1000 );
      history.push( [ time, x, y ] );
      console.log(history)
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
      canvas = document.getElementById( "etchasketch" );
      ctx = canvas.getContext( '2d' );
      processing = new Processing( canvas );
      processing.size( w, h );
      erase();
      setLine( Math.round( w * .5 ), Math.round( h * .5 ) );

      // Testing.
      $( document ).click( function( e ) {
        var range = 50;
        moveLine( Math.round( Math.random() * range - range * .5 ), Math.round( Math.random() * range - range * .5 ) );
      });
    });
  }
);