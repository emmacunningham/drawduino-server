/**
* Adapted from Erik Karlsson's class, www.nonobtrusive.com
*/

define(function() {

  var lfl = lfl || {};

  lfl.Dispatcher = function(){
    this.eventTypes = {};
  }

  lfl.Dispatcher.prototype.addEventListener = function( type, listener, scope ) {
    this.eventTypes[ type ] = this.eventTypes[ type ] || [];
    if ( listener == undefined ) throw new Error( 'Event listener is undefined.' );
    var callbacks = this.eventTypes[ type ];
    for ( var i = callbacks.length - 1; i >= 0; --i ) {
      if ( callbacks[ i ].listener == listener ) {
        return; // Disallow multiple identical listeners.
      }
    }
    var callback = {};
    callback.listener = listener;
    callback.execute = function( params ) {
      return listener.call( scope, params );
    }
    callbacks.push( callback );
  }

  lfl.Dispatcher.prototype.removeEventListener = function( type, listener ) {
    if ( this.eventTypes[ type ] ) {
      var callbacks = this.eventTypes[ type ];
      for ( var i = callbacks.length - 1; i >= 0; --i ) {
        if ( callbacks[ i ].listener === listener ) {
          callbacks.splice( i, 1 );
          return true;
        }
      }
    }
    return false;
  }

  lfl.Dispatcher.prototype.dispatch = function( type, payload ) {
    if ( this.eventTypes[ type ] ) {
      payload = payload || {};
      payload.type = type;
      var callbacks = this.eventTypes[ type ], len = callbacks.length;
      while ( len-- ) {
        callbacks[ len ].execute.call( this, payload );
      }
    }
  }

  return lfl.Dispatcher;
});