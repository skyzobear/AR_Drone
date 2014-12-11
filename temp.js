var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io')(server),
    arDrone = require('ar-drone'),
    client = arDrone.createClient();
client.config('general:navdata_demo', 'FALSE');


app.use('/public', express.static('public'));
    
    
app.get('/', function(req, res) {
    res.sendFile(__dirname+'/views/index.html');
});

client.takeoff();
client.after(1500, function() {
    client.up(0.1);
    client.after(3000, function() {
        this.stop();
        this.land();
    });
});


client.on('navdata', function(data) {
    io.emit('navdata', data);
});

server.listen(3000);
app.listen(8080);