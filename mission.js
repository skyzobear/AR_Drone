var autonomy = require('ardrone-autonomy');
var mission  = autonomy.createMission();

mission.takeoff()
       .zero()       // Sets the current state as the reference
       .altitude(1)  // Climb to altitude = 1 meter
       .forward(1.75) 
       .cw(45)  
       .forward(1.2)
       .altitude(1)
       .ccw(45)
       .forward(1.7)

       //.cw(270)
       //.forward(3)
       //.ctrl.go({x:0, y:0});
       .land();

mission.run(function (err, result) {
    if (err) {
        console.trace("Oops, something bad happened: %s", err.message);
        mission.client().stop();
        mission.client().land();
    } else {
        console.log("Mission success!");
        process.exit(0);
    }
});