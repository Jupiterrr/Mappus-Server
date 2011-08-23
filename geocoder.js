const _ = require("underscore");
const url_pattern = _.template("http://maps.google.com/maps/api/geocode/json?address=<%= q %>&sensor=false");


exports.code = request;


function request(query, cb) {
    
    var encoded = encodeURI( query );
    var url = url_pattern( {q: encoded} ); 
    
    const options = {
      host: 'www.google.com',
      port: 80,
      path: url
    };

    require("http").get(options, function(r) {
        var body = "";
        r.on('data', function(chunk) {
            body += chunk;
        });

        r.on("end", function() {
            //console.log(body);
            parse( JSON.parse(body), cb );
        });

    });
}


function parse(r, cb) {
    
    //console.log("parse: ", r);
    if (r.status != "OK") {
        cb({status : r.status})
        return;
    }
    
    var out = {
        status: r.status,
        locations: []
    }
    
    if (!r.results instanceof Array) {
        console.warn("not an Array: ", r);
        return;
    }

    for(var key in r.results) {
        out.locations.push({
            address: r.results[key]["formatted_address"], 
            cord: r.results[key]['geometry']['location'] 
        });
    }
    
    cb( out ); 
}

