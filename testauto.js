var df = require('dateformat')
  , autonomy = require('ardrone-autonomy')
  , mission  = autonomy.createMission()
  , arDrone = require('ar-drone')
  , arDroneConstants = require('ar-drone/lib/constants')
  , mission  = autonomy.createMission()
  ;

/////////////traitement vidéo
var date = Date.now();


var arDrone = require('ar-drone');
var PaVEParser = require('./lib/video/PaVEParser');
var output = require('fs').createWriteStream('out/'+ date +'vid.h264');
var video = arDrone.createClient().getVideoStream();
var parser = new PaVEParser();

function navdata_option_mask(c) {
  return 1 << c;
}

// From the SDK.
var navdata_options = (
    navdata_option_mask(arDroneConstants.options.DEMO)
  | navdata_option_mask(arDroneConstants.options.VISION_DETECT)
  | navdata_option_mask(arDroneConstants.options.MAGNETO)
  | navdata_option_mask(arDroneConstants.options.WIFI)
);

// Land on ctrl-c
var exiting = false;
process.on('SIGINT', function() {
    if (exiting) {
        process.exit(0);
    } else {
        console.log('Got SIGINT. Landing, press Control-C again to force exit.');
        exiting = true;
        mission.control().disable();
        mission.client().land(function() {
            process.exit(0);
        });
    }
});

// Connect and configure the drone
mission.client().config('general:navdata_demo', true);
mission.client().config('general:navdata_options', navdata_options);
mission.client().config('video:video_channel', 0);
mission.client().config('detect:detect_type', 12);

// Log mission for debugging purposes
mission.log("mission-" + df(new Date(), "yyyy-mm-dd_hh-MM-ss") + ".txt");



parser
  .on('data', function(data) {
    output.write(data.payload);
  })
  .on('end', function() {
    output.end();
  });

video.pipe(parser);


// Plan mission
mission.takeoff()
       .zero() 
       .altitude(1)  
       .forward(1) 
       .cw(45)  
       .forward(0.5)
       .altitude(1.5)
       .ccw(45)
       .forward(1)
       .ccw(90)
       .forward(1.5)
       .altitude(1)
       .ccw(100)
       .forward(0.8)
       .cw(20)
       .go({x:0, y:0})
       .ccw(180)
       .land();

// Execute mission
mission.run(function (err, result) {
    video.end();
    if (err) {
        console.trace("Oops, something bad happened: %s", err.message);
        mission.client().stop();
        mission.client().land();
    } else {
        console.log("We are done!");
        process.exit(0);
    }
});