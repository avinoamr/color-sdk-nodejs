var url = require( "url" );
var util = require( "util" );
var http = require( "http" );
var https = require( "https" );
var events = require( "events" );
var qs = require( "querystring" );
var pkg = require( "./package.json" );

var MAXSIZE = 1024 * 250; // 200kib
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
    this.flushid = 0;
    this.eventscnt = 0;

    log( "Created. Version: " + pkg.version );
    log( "Queue URL: ", this.qurl );

    this.on( "error", function ( err ) {
        log( "ERROR #" + err.id + ":", err );
    })

    this.on( "send", function ( data ) {
        log( "Sending #" + data.id + ":", "tries: " + data.tries + " ,", 
            data.count, "events", 
            "(" + data.size + " / " + data.fullsize + " bytes)",
            this.flushcnt, "flushes remaining",
            this._buffer.length, "buffer size"
        );
    })

    this.on( "flush", function ( data ) {
        log( "Sent Successfuly #" + data.id + ":", 
            data.count, "events", 
            "(" + data.size + " / " + data.fullsize + " bytes)",
            "in", data.t + "s",
            this.flushcnt, "flushes remaining",
            this._buffer.length, "buffer size"
        );
    })

    this.on( "empty", function () {
        this.flushcnt = 0;
        log( "Empty" );
    })
}

SDK.prototype.write = function ( table, data ) {
    data = copy( data );
    data.__table = table;
    this._buffer += JSON.stringify( data ) + "\n";
    this.eventscnt += 1;

    if ( this._buffer.length > MAXSIZE ) {
        this.flush(); // max size is exceeded, flush immediately
    } else if ( !this._timeout ) {
        // flush something after the flush timeout 
        this._timeout = setTimeout( this.flush.bind( this ), FLUSH_TIMEOUT );
    }

    return this;
}

SDK.prototype.flush = function () {
    clearTimeout( this._timeout );
    this._timeout = null;
    if ( !this._buffer.length ) {
        if ( !this.flushcnt ) {
            this.emit( "empty" )
        }
        return
    }

    var that = this;
    var done = false;
    var retries = 3;
    var count = this.eventscnt;
    var buffer = this._buffer;
    var flushid = ++this.flushid;
    var size = buffer.length;

    this.eventscnt = 0;
    this.flushcnt += 1;
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
        "MessageAttribute.2.Value.StringValue": this.apisecret,
        "MessageAttribute.3.Name": "sdk",
        "MessageAttribute.3.Value.DataType": "String",
        "MessageAttribute.3.Value.StringValue": pkg.name + "-" + pkg.version,
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

    var t;
    var tries = 0;
    request();

    function request() {
        t = new Date().getTime();
        that.emit( "send", { 
            id: flushid, 
            count: count, 
            size: size, 
            fullsize: body.length,
            tries: ++tries 
        });
        var req = https.request( options, function ( res ) {
            if ( res.statusCode < 200 || res.statusCode > 300 ) {
                var code = res.statusCode;
                var err = "";
                return res
                    .on( "data", function ( d ) { err += d } )
                    .on( "end", function () {
                        err = code + ": " + http.STATUS_CODES[ code ] + " " + err;
                        onerror( new Error( err ) );
                    })
                    .on( "error", onerror )
            }
            
            onend();
        })
        .on( "error", onerror )
        req.setTimeout( 300 * 1000 );
        req.end( body );
    }

    function onerror ( err ) {
        err.id = flushid;
        that.emit( "error", err );
        if ( done ) return;
        if ( retries-- > 0 ) {
            log( "Retrying after error, in 2s. Remaining: ", retries );
            return setTimeout( request, 2000 );
        }
        if ( --that.flushcnt <= 0 && !that._buffer ) { 
            that.emit( "empty" ) 
        }
        done = true;
    }

    function onend() {
        t = ( new Date().getTime() - t ) / 1000;
        that.emit( "flush", { 
            id: flushid, 
            count: count, 
            size: size, 
            fullsize: body.length,
            t: t 
        });
        if ( done ) return;
        if ( --that.flushcnt <= 0 && !that._buffer ) { 
            that.emit( "empty" ) 
        }
        done = true;
    }

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
