var color = require( "./index" );
var sdk = new color.SDK( "192.168.0.1" );

sdk.write( "install", { user: 15, device: "iPhone" } );