var net = require( "net" );
var util = require( "util" );
var pkg = require( "./package.json" );
util.inherits( SDK, net.Socket );

var MAX_RECONNECTS = 3;

function SDK ( endpoint, port, account, apikey ) {
    net.Socket.call( this );
    port = port || 29001;
    var that = this;
    var write = this.write;
    var timelog = "COLRO SDK Connected to " + endpoint + ":" + port;
    var pending = [];
    var send;
    var reconnects = 0;

    console.log( "COLOR SDK Created. Version: " + pkg.version );

    connect();

    this.on( "error", function ( err ) {
        var isReconnect = [ "EPIPE", "ECONNREFUSED" ].indexOf( err.code ) != -1
        if ( isReconnect && reconnects < MAX_RECONNECTS ) {
            var count = reconnects + "/" + MAX_RECONNECTS;
            reconnects += 1;
            console.warn( "COLOR SDK Connection reset. Reconnecting. " + count );
            return connect();
        }
        console.error( "COLOR SDK" + err.stack );
    })

    this.on( "connect", function () {
        console.timeEnd( timelog );
        reconnects = 0;
        send = function( entry ) {
            try {
                var json = JSON.stringify( entry )
            } catch ( err ) {
                return that.emit( "error", err );
            }
            return write.call( that, json + "\n" );
        }
        pending.forEach( send );
        pending = [];
    })

    function connect() {
        console.time( timelog );
        console.log( "COLOR SDK Connecting to " + endpoint + ":" + port );
        that.connect( port, endpoint );
        send = pending.push.bind( pending );
        that.write = function ( type, obj ) {
            return send({ type: type, obj: obj, account: account, apikey: apikey });
        }

        that.remove = function ( type, id ) {
            return send({ type: type, obj: { id: id }, account: account, apikey: apikey, remove: true })
        }
    }
    
}

module.exports.SDK = SDK