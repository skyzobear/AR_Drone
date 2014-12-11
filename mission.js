var autonomy = require('ardrone-autonomy');
var mission  = autonomy.createMission();


//circuit
mission.takeoff();
mission.zero();
mission.go({x: 1, y:0});
mission.cw(45);
mission.zero();
mission.go({x: 1, y:0});
       /*.altitude(1)  
       .forward(1.5) 
       .cw(45)  
       .forward(0.8)
       .altitude(1.5)
       .ccw(45)
       .forward(1.5)
       .ccw(90)
       .forward(2.5)
       .altitude(1)
       .ccw(100)
       .forward(1.3)
       .cw(20)
       .go({x:0, y:0})
       .ccw(180)
       .altitude(0.1)*/
mission.land();

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