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
    
    this.watch();
  }

  RotaryInput.prototype.watch = function() {
    this.c.watchRotaryIn(this);
  }
/*
  RotaryInput.prototype.setOn = function(callback) {
    this.pushed = true;
    this.emit('push');
    this.emit('change');    
  };

  RotaryInput.prototype.push = function(callback) {
    this.setOn();
  };

  RotaryInput.prototype.setOff = function(callback) {
    this.pushed = false;
    this.emit('release');
    this.emit('change');
  };

  RotaryInput.prototype.release = function(callback) {
    this.setOff();
  };
  
  RotaryInput.prototype.isOn = function() {
    return this.pushed;
  };

  RotaryInput.prototype.on = function(event, callback) {
    if (!this.events[event]) {
      this.events[event] = []; }
    this.events[event].push(callback);
  };

  RotaryInput.prototype.emit = function(event, callback) {
    if (!this.events[event]) {
      return; }
    for (var i = 0; i < this.events[event].length; i++) {
      this.events[event][i](this);
    }
  };
*/
  return RotaryInput;
});