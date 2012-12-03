/**
 * RotaryInput.js – Basic RotaryInput Controller0
 * This file is part of noduino (c) 2012 Sebastian Müller <c@semu.mp>
 *
 * @package     noduino
 * @author      Sebastian Müller <c@semu.mp>
 * @license     MIT License – http://www.opensource.org/licenses/mit-license.php 
 * @url         https://github.com/semu/noduino
 */

define(function() {
  
  function RotaryInput(options, Connector) {
    if (false === (this instanceof RotaryInput)) {
      return new RotaryInput(options); }  
    
    this.c      = Connector;
    this.pin    = this.c.normalizePin(options.pin);
    this.pushed = false;
    this.events = {};
    this.value  = null;
    this.tolerance  = 3;  
    
    this.watch();
  }

  RotaryInput.prototype.watch = function() {
    this.c.watchRotaryIn(this);
  }
  
  /**
   * Run binded events for given event
   * @param string event
   */
  RotaryInput.prototype.emit = function(event) {
    if (!this.events[event]) {
      return; }
    for (var i = 0; i < this.events[event].length; i++) {
      this.events[event][i](this);
    }
  };
  
  /**
   * Bind event to RotaryInput
   * @param string event name of event
   * @param function callback
   */
  RotaryInput.prototype.on = function(event, callback) {
    if (!this.events[event]) {
      this.events[event] = []; }
    this.events[event].push(callback);
  };

  /**
   * Update value of RotaryInput 
   * @param integer value
   * @param function callback
   */
  RotaryInput.prototype.set = function(value) {
    var tmp = this.value - value;
    if (tmp > (-1 * this.tolerance) && tmp < this.tolerance) {
      return; }
          
    if (this.value != value) {
      this.value = value; 
      this.emit('change');
    }
  };
  



  return RotaryInput;
});