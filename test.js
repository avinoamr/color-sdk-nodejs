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
    
    sdk.write( "sdktest", { user: 15, device: "iPhone" } )
    process.stdout.write( "Data sent. Send more [Y/n]? " );
})

function help () {
    var cmd = process.argv[ 0 ] + " " + process.argv[ 1 ] + " HOSTNAME";
    console.log( cmd );
    process.exit();
}