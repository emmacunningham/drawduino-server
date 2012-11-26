console.log("JS INIT!!");

define(function() {
  function Example2() {
    this.board = null;
    this.led = null;
    console.log("Example 2 initing");
  }
  
  Example2.handle = function() {
    var that = this;
    console.log("Attempting to connect!")
    require(['scripts/libs/Noduino.js', 'scripts/libs/Noduino.Socket.js', 'scripts/libs/Logger.js'], function(NoduinoObj, Connector, Logger) {
      console.log("Require loaded");
      var Noduino = new NoduinoObj({debug: true, host: 'http://localhost:8090'}, Connector, Logger);
      console.log("Noduino",Noduino);
      Noduino.connect(function(err, board) {
        $('#e2-exampleConnection .alert').addClass('hide'); 
        if (err) {
          $('#e2-exampleConnection .alert-error').removeClass('hide'); 
          console.log("Error!")
        } else {
          $('#e2-exampleConnection .alert-success').removeClass('hide'); 
          console.log("Success!")
          that.board = board;
        }
      });
    });
    
  };
  
  Example2.stop = function() {
    this.led.stopBlinking();
  };
  
  Example2.start = function(pin, interval) {
    var that = this;
    if (!that.led) {
      this.board.withLED({pin: pin}, function(err, LED) {
        if (err) { return console.log(err); }
        
        that.led = LED;
        that.led.blink(interval);
        that.led.on('change', function(data) {
          if (data.mode == '000') {
            $('#e2-status').removeClass('label-success');
            $('#e2-status').html('OFF');
          } else {
            $('#e2-status').addClass('label-success');
            $('#e2-status').html('ON');
          }
        });
      });
    } else {
      that.led.blink(interval);
    }
  };
  
  return Example2;
});