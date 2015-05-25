var host = process.argv[ 2 ];
if ( !host ) {
    console.log( "HOSTNAME is missing" );
    help()
}

var color = require( "./index" );
var sdk = new color.SDK( host );

process.stdin.setEncoding( "utf8" );
console.log( "CONNECTED." );
console.log( "Continue?" );
process.stdin.on( "data", function ( chunk ) {
    chunk = chunk.trim().toLowerCase();
    if ( chunk == "n" || chunk == "no" ) {
        sdk.end();
        process.exit();
    }
    
    var data = generate( 10 );
    for ( var i = 0 ; i < data.length ; i += 1 ) {
        sdk.write( "sdktest", data[ i ] )
    }
    
    process.stdout.write( "Data sent. Send more [Y/n]? " );
})

function help () {
    var cmd = process.argv[ 0 ] + " " + process.argv[ 1 ] + " HOSTNAME";
    console.log( cmd );
    process.exit();
}

function generate( n ) {
    var data = [];
    for ( var i = 0 ; i < n ; i += 1 ) {
        data.push({
            user: Math.floor( Math.random() * 10000 ),
            device: "iPhone",
            name: "בדיקה",
            age: Math.floor( Math.random() * 100 )
        })
    }
    return data;
}