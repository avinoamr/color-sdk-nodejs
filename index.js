var net = require( "net" );
var util = require( "util" );
var pkg = require( "./package.json" );
util.inherits( SDK, net.Socket );

function SDK ( endpoint, port ) {
    net.Socket.call( this );
    port = port || 29001;
    var that = this;
    var write = this.write;

    console.log( "COLOR SDK Created. Version: " + pkg.version );

    connect();

    this.on( "error", function ( err ) {
        if ( err.code == "EPIPE" ) {
            console.warn( "COLOR SDK Connection reset. Reconnecting." );
            return connect();
        }
        console.error( "COLOR SDK" + err.stack );
    })

    function connect() {
        var timelog = "COLRO SDK Connected to " + endpoint + ":" + port;

        console.time( timelog );
        console.log( "COLOR SDK Connecting to " + endpoint + ":" + port );
        that.connect( port, endpoint, console.timeEnd.bind( console, timelog ) );
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