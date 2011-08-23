const _ = require("underscore");

var _queue = [];
var _working_on = [];
var _fn;
var _stopped = true;
var _limit_of_parallel = 3;

exports.create = _.once(function(fn, parallel) {
    _fn = fn;
    _limit_of_parallel = parallel || _limit_of_parallel;
})

exports.add = function(obj) {
    _queue = _queue.concat(obj);
    //console.log("quuu", _queue);
    start_jobs();
}

exports.start = function() {
    console.log("queue.start")
    if (_stopped == true) {
        console.log("queue.start+++++++")
        _stopped = false;
        start_jobs();
    } 
}

/*
const _ = require("underscore");
function x(obj,fn){     
    _.delay(function(){ 
        console.log("job", obj); 
        fn(true);  
    }, 1000);  
};
q = require("./queue.js")
q.create(x);
q.add([1,2,3]);
q.start();
*/
exports.stop = function() {
   console.log("queue.stop")
    _stopped = true;
}


function start_jobs() {
    //console.log("start_jobs", _queue, canStartNewJob())
    while(canStartNewJob()) {
        start_new_job();
    }
}

function start_new_job() {
    //console.log("start new job", _queue);
    
    var obj = _queue.shift();
    _working_on.push(obj);
    
    _fn(obj, function(b) {
        job_done(b, obj);
    });
}

function job_done(b, obj) {
    console.log("job done", b, obj);
    var index = _.indexOf(_working_on, obj);
    delete _working_on[index];
    _working_on = _.compact(_working_on);
    
    if (!b) _queue.push(obj);
 
    start_jobs();
}

function canStartNewJob() {
    return !_stopped 
            && _working_on.length < _limit_of_parallel
            && _working_on.length >= 0
            && _queue.length > 0;
}