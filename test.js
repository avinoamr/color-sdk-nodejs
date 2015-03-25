var color = require( "./index" );
var sdk = new color.SDK( process.argv[ 2 ] );

sdk.write( "install", { user: 15, device: "iPhone" } );
sdk.write( "install", { user: 16, device: "Android" } );
sdk.write( "install", { user: 17, device: "iPad" } );
sdk.end();
