var express = require('express'),
    app = express(),
    path = require('path'), 
    //On lance le serveur web
    server = require('http').createServer(app),
    //On crée le serveur websocket
    io = require('socket.io')(server),
    mu = require('mu2'), 
    low = require('lowdb'),
	db = low('./data/db.json'), 
    util = require('util'),
    md5 = require('MD5'), 
    Utilisateur = require('./class/Utilisateur.js'),
    video = require('./video.js'),
    bodyParser = require('body-parser');
    drone = require("./lib/server");
var autonomy = require('ardrone-autonomy');
var mission = autonomy.createMission();
//Dossier statique
app.use('/assets', express.static('assets'));

app.use(require('body-parser')());

exports.lancerVideo = false;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'mustache');

app.get('/', function(req, res) {
    require("fs").createReadStream(__dirname + "/views/index.html").pipe(res);
});

mu.root = __dirname + '/views';

//Utilisateur par défaut : 
//login : test
//mdp : test

app.get('/', function(req, res) {
    var stream = mu.compileAndRender('index.html');
    util.pump(stream, res);
});

app.get('/home', function(req, res) {
    var stream = mu.compileAndRender('home.html');
    util.pump(stream, res);
});

/*app.get('/', function(req, res) {
    var stream = mu.compileAndRender('testsream.html');
    util.pump(stream, res);
});*/

app.get('/connexion', function(req, res) {
    var stream = mu.compileAndRender('connexion.html');
    util.pump(stream, res);
});
app.post('/connexion', function(req, res) {
    var utilisateur = new Utilisateur(0, req.param('login'), req.param('mdp'));
    if(utilisateur.connexion()) {
        res.redirect('/');
    }
    else {
        res.redirect('/connexion?erreur=1&email='+utilisateur.email);
    }
    
});

mission.client().on('navdata', function(data) {
    io.emit('navdata', data);
});
io.on('connection', function(socket){
    socket.on('lancementDrone', function(actions) {
        video.lancerVideo = true;
        var temp,
            action,
            ancienneAction = null,
            angle = 0, 
            altitude = 0,
            x = 0,
            y = 0;;
        mission.takeoff();
        mission.zero();
        for(temp in actions) {
            action = actions[temp];
            mission.zero();
            if(ancienneAction !== null && action.rotation !== ancienneAction.rotation) {
                console.log(action.rotation);
                mission.zero();
                mission.go({x:0, y:0, z:0, yaw:Number(action.rotation)});
            }
            if(action.distance !== 0) {
                
                if(action.angle !== 0) {
                    if(!action.contreHoraire) {
                        angle = Number(action.angle);
                    }
                    else {
                        angle = Number(action.angle)*(-1);
                    }
                    mission.zero();
                    mission.go({x: 0, y:0, z:0, yaw: angle});
                }
                mission.zero();
                mission.go({x:action.distance, y: 0});
            }
            
            if(ancienneAction !== null && action.altitude !== ancienneAction.altitude) {
                console.log('test');
                altitude = ancienneAction.altitude - action.altitude;
                mission.zero();
                mission.go({x:0, y:0, z:Number(action.altitude)});
            }
            ancienneAction = action;
        }
        mission.land();
        mission.run(function (err, result) {
            if (err) {
                console.trace("Oops, something bad happened: %s", err.message);
                mission.client().stop();
                mission.client().land();
            } else {
                console.log("Mission success!");
            }
        });
    });
    socket.on('arretDrone', function(message) {
        mission.taskSync(mission.control().disable());
        mission.taskSync(mission.client().stop());
        mission.taskSync(mission.client().land());
        video.lancerVideo = 1;
    });
});


drone.listen(server);
server.listen(8080);