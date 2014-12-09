var arDrone = require('ar-drone');
var client = arDrone.createClient();

client.takeoff();



client
  .after(5000, function() {
    this.front(0.2);
    this.left(0.01);
  })

  /*.after(1800, function() {
    this.stop();
  })

 .after(5000, function() {
     this.up(0.9);
   })

 .after(1700, function() {
    this.stop();
  })

   .after(3000, function() {
     this.front(0.2);
     this.left(0.05);
   })

.after(1800, function() {
    this.stop();
  })

  .after(4000, function() {
     this.counterClockwise(0.9);
   })*/

  .after(2000, function() {
    this.stop();
  })

 

  .after(2000, function() {
    this.stop();
    this.land();
  });