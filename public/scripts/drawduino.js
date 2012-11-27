var pv = 'scripts/vendor/';
var pl = 'scripts/libs/';
require(["jquery", pv + "dropdown.js", pv + "prettify.js", pl + 'Noduino.js', pl + 'Noduino.Socket.js', pl + 'Logger.HTML.js'], function($, dd, p, NoduinoObj, Connector, Logger) {
  var Noduino = null;


  // Setup Arduino board inputs and outputs.
  // Here, tell it what pins our knobs are on.
  var createObjects = function(board) {
    console.log(board)

    board.withAnalogInput({pin:  'A0'}, function(err, AnalogInput) {

      console.log("go");

      AnalogInput.on('change', function(a) {
        console.log(AnalogInput.value);
      });
    });

  };

  $(document).ready(function(e) {
    $('#connect').click(function(e) {
      e.preventDefault();
      if (!Noduino || !Noduino.connected) {
        Noduino = new NoduinoObj({debug: true, host: 'http://localhost:8090', logger: {container: '#connection-log'}}, Connector, Logger);
        Noduino.connect(function(err, board) {
          console.log("connected")
          createObjects(board);
        });
      }
    });
  });
});