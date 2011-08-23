var _ = require("underscore");


var Mappus = function() {
    this.server = null;
    
    var redis = require("redis");
    this.redis = redis.createClient();
    this.redis.on("error", function (err) {
        console.log("Error " + err);
    });
    
    
}

Mappus.prototype.start_server = function() {
    // var net = require('net');
    // var that = this;
    // 
    // this.server = net.createServer(function (socket) {
    //     console.log("new connection");
    //     //socket.write("Mappus server started being awesome.\r\n");
    //     
    //     
    //     // that.onMessage('{"geocode":[{"id":5,"address":"Wallau"}]}', function(obj) {
    //     //     that.routing(obj, socket);
    //     // });
    //     //socket.pipe(socket);
    //     socket.on("data", function(msg) {
    //         console.log("msg: ", "#" + msg + "#");
    //         socket.write("jojojo.\r\n");
    //         // that.onMessage(msg, socket, function(obj) {
    //         //                 that.routing(obj, socket);
    //         //             });
    //     });
    // });
    // 
    // this.server.listen(1337, "127.0.0.1");
    
    var http = require('http'),  
        io = require('socket.io'), // for npm, otherwise use require('./path/to/socket.io') 

    server = http.createServer(function(req, res){ 
     // your normal server code 
     res.writeHead(200, {'Content-Type': 'text/html'}); 
     res.end('<h1>Hello world</h1>'); 
    });
    server.listen(1337, "jupiterrr.dyndns.org");

    var that = this;
    
    // socket.io 
    var socket = io.listen(server); 
    socket.on('connection', function(socket){ 
        console.log("new client is here!")
        
        socket.on('message', function(msg){  
            socket.send("hallo hallo hallo");
            //console.log("msg: ", msg, typeof msg);
            
            if (msg instanceof Object) that.routing(msg, socket);

        }) 
        //client.on('disconnect', function(){ … }) 
    });
    
}


Mappus.prototype.routing = function(obj, socket) {
    if ("geocode" in obj) require("./geocode_request").request(obj.geocode, socket, this.redis);
};



var mappus = new Mappus();
mappus.start_server();

