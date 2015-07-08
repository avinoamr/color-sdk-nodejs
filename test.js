
var KEY = "color/ael0q6qa0jm7vi";
var SECRET = "ZGttNWJ1dnZhZzg1eHcyOS8wMDNhMTRiMi05NzI0LTQxM2YtYTcxMi05ODdlMjNhYjUxMzEvMDM3MzM1OTk5NTYyL3VzLWVhc3QtMQ==";
// queue: sdk-color-dkm5buvvag85xw29

var color = require( "./index" );
var sdk = new color.SDK( KEY, SECRET )

function start() {
    process.stdout.write( "Send data [Y/n]? " );
    process.stdin.on( "data", function ( chunk ) {
        chunk = chunk.toString().trim().toLowerCase();
        if ( chunk == "n" || chunk == "no" ) {
            process.stdin.removeListener( "data", arguments.callee );
            return sdk.on( "empty", function () {
                console.log( "Empty buffer, safe to exit" );
                process.exit();
            })
            .flush();
        }
        
        var data = generate( 10000 );
        for ( var i = 0 ; i < data.length ; i += 1 ) {
            sdk.write( "sdktest", data[ i ] )
        }

        sdk.flush();
        
        process.stdout.write( data.length + " entries sent. Send more [Y/n]? " );
    })
}


function generate( n ) {
    var data = [];
    for ( var i = 0 ; i < n ; i += 1 ) {
        // data.push({"item_id":"54912f037b454f0800401b15","title":"מתקן דשא לייבוש בקבוקים. מצב מעולה. שולחת.","type":"product","category_ids":["5255a37a5d97e502000003a8","5254673251e7500200000052"],"pickup_location_ids":["5255a21897119302000010a5","524c16b6c07b2502000002a3","5255a22497119302000010a7"],"delivery_location_ids":["5249de14a4e6cb02000002e8"],"cost":100,"coin_symbol":"MMZHRT","created_at":"2014-12-17T07:21:39.214Z","seller_id":"516154746687e30200000823","state":"closed","auto_accept_quantity":0,"auto_accept_limit":0,"is_wish":false,"privacy":"public","last_expiration_reset":"2014-12-18T07:16:01.762Z","ext_cost":0,"closed_reason":"","has_photo":true,"id":"54912f037b454f0800401b15_MMZHRT","event_created_at":"2015-06-14T08:42:51.925Z"});
        // continue;
        data.push({
            user: Math.floor( Math.random() * 10000 ),
            device: "iPhone",
            name: "Name",
            age: Math.floor( Math.random() * 100 )
        })
    }
    return data;
}

module.start = start;
module.sdk = sdk;
module.generate = generate;

if ( require.main === module ) {
    start();
}


