var net = require( "net" );
var util = require( "util" );
util.inherits( SDK, net.Socket );

function SDK ( endpoint, port ) {
    net.Socket.call( this );
    this.connect( endpoint, port || 29001 );
}

SDK.prototype.write = function ( type, obj ) {
    return net.Socket.prototype.write.call( this, JSON.stringify({
        type: type,
        obj: obj 
    }));
}