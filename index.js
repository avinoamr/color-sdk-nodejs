var net = require( "net" );
var util = require( "util" );
util.inherits( SDK, net.Socket );

function SDK ( endpoint, port ) {
    net.Socket.call( this );
    port = port || 29001;
    var that = this;
    var write = this.write;

    connect();

    this.on( "error", function ( err ) {
        if ( err.code == "EPIPE" ) return connect();
        console.error( err.stack );
    })

    function connect() {
        that.connect( port, endpoint );
        that.write = function ( type, obj ) {
            try {
                var json = JSON.stringify({ type: type, obj: obj })
            } catch ( err ) {
                return that.emit( "error", err );
            }
            
            return write.call( that, json + "\n" );
        }
    }
    
}

module.exports.SDK = SDK