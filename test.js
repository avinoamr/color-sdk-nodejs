var color = require( "./index" );
var sdk = new color.SDK( process.argv[ 2 ] );

sdk.write( "install", { user: 15, device: "iPhone" } );
