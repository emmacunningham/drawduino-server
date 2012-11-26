define(['./Board.js'], function (objBoard) {
  /** 
   * Create Noduini object for handling general access
   * @param object options
   */
  function Noduino(options, Connector, Logger) { 
    console.log("Connector: ",Connector)
    if (false === (this instanceof Noduino)) {
      return new Noduino(options); }
      
    this.c            = new Connector(options)
    console.log("Connector (c) : ",this.c)
    this.logger       = new Logger(options);
    this.options      = options;    
    this.options.type = this.c.connection;
    this.connected    = false;    
    
    this.setLoggerOptions();
    this.setLogger();
  };
  
  Noduino.prototype.setLoggerOptions = function() {
    if (!this.options.logger) {
      return; }
    for (var n in this.options.logger) {
      this.logger.setOption(n, this.options.logger[n]); }
  };

  Noduino.prototype.setLogger = function() {
    this.c.setLogger(this.logger);
  };

  Noduino.prototype.log = function(level, msg) {
    this.c.log(level, msg);
  }

  Noduino.prototype.write = function(data) {
    this.c.write(data);
  }
  
  Noduino.prototype.digitalRead = function(pin) {
    this.c.digitalRead(pin);
  }

  Noduino.prototype.watchAnalogIn = function(pin, callback) {
    this.c.watchAnalogIn(pin, callback);
  }
  
  Noduino.prototype.watchDigitalIn = function(pin, callback) {
    this.c.watchDigitalIn(pin, callback);
  }

  Noduino.prototype.connect = function(options, callback) {
    console.log('connecting to noduino');
    
    if (!callback) {
      callback = options; options = {}; }
    var that = this;
    this.c.connect(options, function(err, board) {
      if (err) { 
        console.log("@Noduino: Error!!")
        return callback(err); 
      }    
      console.log("@Noduino: Success")
      that.connected = true;
      callback(null, new objBoard(options, that.c));
    });
  }
  
  return Noduino;
});