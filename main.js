var _ = require("underscore");
var redis = require("redis");
var http = require('http');  
var io = require('socket.io');

var server = null;


redis = redis.createClient();
redis.on("error", function (err) {
    console.log("Error " + err);
});


server = http.createServer(httpRequest);
server.listen(80, "jupiterrr.dyndns.org");


function httpRequest(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'}); 
    setTimeout(function(){
        res.end('<h1>Hello world</h1>');
    }, 5000)
}



// // socket.io 
// var socket = io.listen(server); 
// socket.on('connection', function(socket){ 
//     console.log("new client is here!")
//     
//     socket.on('message', function(msg){  
//         socket.send("hallo hallo hallo");
//         //console.log("msg: ", msg, typeof msg);
//         
//         if (msg instanceof Object) that.routing(msg, socket);
// 
//     }) 
//     //client.on('disconnect', function(){ … }) 
// });