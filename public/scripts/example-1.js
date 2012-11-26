define(function() {
  function Example() {
    
  }
  
  Example.handle = function() {
    require(['scripts/libs/Noduino.js', 'scripts/libs/Noduino.Socket.js', 'scripts/libs/Logger.js'], function(NoduinoObj, Connector, Logger) {
      var Noduino = new NoduinoObj({debug: false, host: 'http://localhost:8090'}, Connector, Logger);
      Noduino.connect(function(err, board) {
        console.log("Connecting to board!!");
        $('#e1-exampleConnection .alert').addClass('hide'); 
        if (err) {
          $('#e1-exampleConnection .alert-error').removeClass('hide');
          console.log("Error!!");
        } else {
          $('#e1-exampleConnection .alert-success').removeClass('hide');
          console.log("Success!");
        }
      });
    });
  };
  
  return Example;
});