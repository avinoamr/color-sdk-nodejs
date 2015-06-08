# color-sdk-nodejs

#### Installation

```
$ npm install git+https://github.com/avinoamr/color-sdk-nodejs.git
```

#### Usage

```javascript
var color = require( "color-sdk-nodejs" );
var conn = new color.SDK( "192.168.0.1", 29001, "ACCOUNTNAME", );

conn.write( "install", { user: "123", device: "iPad", user_ip: "1.2.3.4" } )

```

#### API

The `SDK` class extends Node's [net.Socket](http://nodejs.org/api/net.html#net_class_net_socket) class. Therefor each instance is a separate socket connection.

###### SDK( endpoint [, port] )

Opens the socket connection to the Color server. 

* **endpoint** is an ip or hostname string
* **port** default 29001

###### .write( type, obj )

Immediately writes an arbitrary object to the Color database. 

* **type** is a string representing the event type or collection of the object
* **obj** is a simple javascript object. Do not use nested objects or non-primitive data types.


###### .remove( type, id )

Removes a row from the database

* **type** is a string representing the event type or collection of the object
* **id** is the id of the row you wish to remove

