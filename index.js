var net = require( "net" );
var util = require( "util" );
util.inherits( SDK, net.Socket );

function SDK ( endpoint, port ) {
    net.Socket.call( this );

    this.connect( port || 29001, endpoint );

    this.on( "error", function ( err ) {
        console.error( err.stack );
    })

    var write = this.write;
    this.write = function ( type, obj ) {
        try {
            var json = JSON.stringify({ type: type, obj: obj })
        } catch ( err ) {
            return this.emit( "error", err );
        }
        
        return write.call( this, json );
    }
    
}

module.exports.SDK = SDK