window.socket = io('127.0.0.1:3000');
var i = 0;
window.socket.on('navdata', function(msg) {
    if(i === 0) {
        console.log(msg);
        console.log(msg.altitude);
    }
    document.querySelector('#batterie').innerHTML = msg.demo.batteryPercentage;
    document.querySelector('#altitude').innerHTML = msg.demo.altitudeMeters;
    document.querySelector('#velocity').innerHTML = msg.demo.velocity.x;
    //document.querySelector('#test').innerHTML = JSON.stringify(msg.kalmanPressure.estimated);
    document.querySelector('#test').innerHTML = JSON.stringify(msg.pwm);
    i++;
});