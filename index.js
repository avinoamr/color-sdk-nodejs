var url = require( "url" );
var util = require( "util" );
var http = require( "http" );
var https = require( "https" );
var crypto = require( "crypto" );
var events = require( "events" );
var qs = require( "querystring" );
var pkg = require( "./package.json" );

var MAXSIZE = 1024 * 200; // 200kib
var FLUSH_TIMEOUT = 10 * 1000; // 10 seconds

module.exports.SDK = SDK;

util.inherits( SDK, events.EventEmitter );
function SDK ( apikey, apisecret ) {
    events.EventEmitter.call( this );

    // api-key: ACCOUNT/RAND1
    // api-secret: BASE64( RAND2/UUID/AWSACCOUNT/REGION )
    // queue: sdk-ACCOUNT-RAND2
    var account = apikey.split( "/" )[ 0 ];
    var decoded = new Buffer( apisecret, "base64" ).toString().split( "/" );
    var rand = decoded[ 0 ];
    var awsaccount = decoded[ 2 ];
    var region = decoded[ 3 ];

    this.apikey = apikey;
    this.apisecret = apisecret;
    this._buffer = "";
    this._timeout = null;

    this.qurl = [
        "https://sqs." + region + ".amazonaws.com",
        awsaccount,
        "sdk-" + account + "-" + rand
    ].join( "/" );

    this.flushcnt = 0;
    this.eventscnt = 0;

    log( "Created. Version: " + pkg.version );
    log( "Queue URL: ", this.qurl );

    this.on( "error", function ( err ) {
        log( "ERROR:", err );
    })

    this.on( "flush", function ( cnt ) {
        log( cnt, "Flushed Successfully" );
    })

    this.on( "empty", function () {
        log( "Empty" );
    })
}

SDK.prototype.write = function ( table, data ) {
    data = copy( data );
    data.__table = table;
    this._buffer += JSON.stringify( data ) + "\n";

    if ( this._buffer.length > MAXSIZE ) {
        this.flush(); // max size is exceeded, flush immediately
    } else if ( !this._timeout ) {
        // flush something after the flush timeout 
        this._timeout = setTimeout( this.flush.bind( this ), FLUSH_TIMEOUT );
    }

    this.eventscnt += 1;
    return this;
}

SDK.prototype.flush = function ( callback ) {
    clearTimeout( this._timeout );
    this._timeout = null;
    callback || ( callback = function () {} );
    if ( !this._buffer.length ) {
        callback();
        if ( !this.flushcnt ) {
            this.emit( "empty" )
        }
        return
    }

    var eventscnt = this.eventscnt;
    this.eventscnt = 0;
    this.flushcnt += 1;
    var buffer = this._buffer;
    this._buffer = "";

    var time = new Date().toISOString();
    var body = qs.stringify({
        Action: "SendMessage",
        MessageBody: buffer,
        "MessageAttribute.1.Name": "key",
        "MessageAttribute.1.Value.DataType": "String",
        "MessageAttribute.1.Value.StringValue": this.apikey,
        "MessageAttribute.2.Name": "secret",
        "MessageAttribute.2.Value.DataType": "String",
        "MessageAttribute.2.Value.StringValue": this.apisecret
    });

    var parsedurl = url.parse( this.qurl )
    var options = {
        port: 443,
        method: "POST",
        path: parsedurl.path,
        hostname: parsedurl.hostname,
        headers: {
            "Content-Length": body.length,
            "Content-Type": "application/x-www-form-urlencoded"
        }
    }

    var req = https.request( options, function ( res ) {
        if ( res.statusCode < 200 || res.statusCode > 300 ) {
            var code = res.statusCode;
            var err = "";
            return res
                .on( "data", function ( d ) { err += d } )
                .on( "end", function () {
                    err = code + ": " + http.STATUS_CODES[ code ] + " " + err;
                    req.emit( "error", new Error( err ) );
                })
                .on( "error", req.emit.bind( req, "error" ) )
        } else {
            req.emit( "end" );
        }
    }.bind( this ) )
    .on( "error", function ( err ) {
        console.log( body );
        this.emit( "error", err );
    }.bind( this ) )
    .once( "error", function ( err ) {
        callback( err );
        this.emit( "error", err );
        if ( !--this.flushcnt && !this._buffer ) { this.emit( "empty" ) }
    }.bind( this ) )
    .once( "end", function () {
        callback();
        this.emit( "flush", eventscnt );
        if ( !--this.flushcnt && !this._buffer ) { this.emit( "empty" ) }
    }.bind( this ) );
    
    req.end( body );

    return this;
}

function copy ( obj ) {
    return JSON.parse( JSON.stringify( obj ) );
}

function log() {
    var args = [].slice.call( arguments );
    args = [ new Date().toISOString(), "COLOR-SDK" ].concat( args );
    console.log.apply( console, args );
}
