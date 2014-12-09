var autonomy = require('ardrone-autonomy');
var mission  = autonomy.createMission();


//circuit
mission.takeoff()
       .zero()       // Sets the current state as the reference
       .altitude(1)  // Climb to altitude = 1 meter

       .forward(1.7) 
       .cw(50)  
       .forward(0.8)
       .altitude(2)
       .ccw(50)
       .forward(1.5)
       .ccw(90)
       .forward(2.5)
       .altitude(1)
       .ccw(100)
       .forward(1.3)
       .cw(20)
       .go({x:0, y:0})
       .ccw(180)
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