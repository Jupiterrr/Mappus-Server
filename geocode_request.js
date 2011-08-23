const _ = require("underscore");

var _redis;

exports.request = start;

function start(request_items, socket, redis) {
    _redis = redis;
    
    console.log("geo geo geo geo geo");
    
    get_cached(request_items, function(cached, uncached) {
        send_to_client("geocode", cached, socket);
        console.log("cached", cached);
        
        get_geocoded(uncached, function(result) {
            send_to_client("geocode", result, socket);
        });
    });
}

function get_cached(request_items, cb) {
    var not_in_db = [],
        in_db = [];
    
    var response = _.after(request_items.length, db_requests_finished);
    
    var json;
    _.each(request_items, function(request_item) {    
        _redis.get(request_item.address, function (err, reply) {
            if (reply === null) {
                not_in_db.push(request_item);
            } else {
                json = JSON.parse(reply);
                if (json instanceof Array) json = { locations: json };
                json["id"] = request_item.id;    
                
                in_db.push(json);
            }
            response();
        });
    });
    
    function db_requests_finished(){
        cb(in_db, not_in_db);
    }
}




var _queue = [],
    _over_limit = false,
    _coding = false;

function get_geocoded(request_items, cb) {
    var queue = require("./queue");
    queue.create(handler, 40);
    queue.add(request_items);
    queue.start();
    
    function handler(obj, bfn) {
        geocode(obj, function(r){
            response(obj, r, bfn);
        });
    }
    
    function response(obj, r, bfn) {
        if (r.status == "OVER_QUERY_LIMIT") {
            console.log("limit")
            queue.stop();
            bfn(false);
            _.delay(queue.start, 6000);
            return;
        }
        console.info("response: ", r.id, r);
        
        // cach response
        var json = JSON.stringify( r );
        _redis.set(obj.address, json);
        bfn(true);
        cb( r );
    }
}

// function get_geocoded(request_items, cb) {
//     // if not empty push to queue
//     if ( request_items.length !== 0 ) {
//         _queue.push({
//             cb: cb || function(){},
//             e: request_items,
//             r: []
//         }); 
//     }
//     
//     if (
//         _over_limit ||   // over limit
//         !_queue[0]  ||   // _queue empty
//         _coding          // working
//     ) return;
//     
//     
//     _coding = true;
//     var result = [], el;
//     
//     _.each(_queue[0].e, function(el){
//         if (_over_limit) return;
//         geocode(el, response);
//     });
//     
//     function response(r) {
//         if (r.status == "OVER_QUERY_LIMIT") {
//             console.log("limit", r)
//             reached_limt;
//             return;
//         }
//         
//         console.info("response: ", r);
//         // cach response
//         //var json = JSON.stringify( obj );
//         //_redis.set(request_item.address, json);
//         
//         var job = _queue[0];
//         
//         // move from r.e to r.r
//         job.r.push(r);
//         var index = _.indexOf(job.e, r);
//         delete job.e[index];
//         
//         next_job( job );
//     }
//     
//     function next_job( job ) {
//         if (job.e.length === 0) {
//             job.cb( job.r );
//             _queue.shift();
//             _coding = false;
//             get_geocoded(); // calls this function again
//         }
//     }
//     
//     function reached_limt() {
//         _over_limit = true;
//         
//         if (!_over_limit) {
//             _.delay(function(){
//                    _over_limit = false;
//                    _coding = false;
//                    get_geocoded();
//             },5000);
//         }; 
//     }
// }


function geocode(request_item, cb) {
    _cach();
    
    function _cach() {
        _redis.get(request_item.address, function (err, reply) {
            if (reply === null) {
                send_request( request_item );
            } else {
                var obj = JSON.parse( reply );
                obj["id"] = request_item.id;    
                cb( obj );
            }
        });
    }
     
    function send_request() {
        require("./geocoder").code(request_item.address, request_response);
    }
    
    function request_response(obj) {        
        //console.log("geocoded2: ", obj);
        obj["id"] = request_item.id;    
        
        cb( obj );
    }  

}

function send_to_client(type, response, socket) {
    var obj = {};
    obj[type] = response;
    
    var json = JSON.stringify( obj );

    socket.send(json);
}
