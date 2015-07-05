# color-sdk-nodejs

#### Installation

```
$ npm install git+https://github.com/avinoamr/color-sdk-nodejs.git
```

#### Usage

```javascript
var color = require( "color-sdk-nodejs" );
var conn = new color.SDK( "APIKEY", "APISECRET" );

conn.write( "install", { user: "123", device: "iPad", user_ip: "1.2.3.4" } )

```

#### API

The `SDK` class extends Node's [EventEmitter](https://nodejs.org/api/events.html#events_class_events_eventemitter) class. Therefor, it may emit "error" events that you should catch and handle.

###### SDK( apikey, apisecret )

Opens the socket connection to the Color server. 

###### .write( type, obj )

Immediately writes an arbitrary object to the Color database. 

* **type** is a string representing the event type or collection of the object
* **obj** is a simple javascript object. Do not use non-primitive data types.

