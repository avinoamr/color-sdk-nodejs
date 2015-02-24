var color = require( "./index" );
var sdk = new color.SDK( "52.1.209.206" );

sdk.write( "install", { user: 15, device: "iPhone" } );