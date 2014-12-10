var autonomy = require('ardrone-autonomy');
var mission  = autonomy.createMission();
var http = require("http"),
    drone = require("./lib/server");

// a voir pour lerenomage de la variable server
//gestion stream
var server = http.createServer(function(req, res) {
  require("fs").createReadStream(__dirname + "/index.html").pipe(res);
});

drone.listen(server);
server.listen(5555);


var date = Date.now();


var arDrone = require('ar-drone');
var PaVEParser = require('./lib/video/PaVEParser');
var output = require('fs').createWriteStream('out/'+ date +'vid.h264');
var video = arDrone.createClient().getVideoStream();
var parser = new PaVEParser();

parser
  .on('data', function(data) {
    output.write(data.payload);
  })
  .on('end', function() {
    output.end();
  });

video.pipe(parser);


//circuit
mission.takeoff()
       .zero() 
       .altitude(1)  
       .forward(1) 
     /*.cw(45)  
       .forward(0.6)
       .altitude(1.5)
       .ccw(45)
       .forward(1.2)
       .ccw(90)
       .forward(2)
       .altitude(1)
       .ccw(100)
       .forward(1.1)
       .cw(20)
       .go({x:0, y:0})
       .ccw(180)*/
       .land();

mission.run(function (err, result) {
  video.end();
    if (err) {
        console.trace("Oops, something bad happened: %s", err.message);
        mission.client().stop();
        mission.client().land();
    } else {
        console.log("Mission success!");
        process.exit(0);
    }
});