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
    bodyParser = require('body-parser');
    drone = require("./lib/server");
var autonomy = require('ardrone-autonomy');
var mission = autonomy.createMission();

//Dossier statique
app.use('/assets', express.static('assets'));

app.use(require('body-parser')());

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

app.get('/puissant', function(req, res) {
    var stream = mu.compileAndRender('powa.html');
    util.pump(stream, res);
});

app.get('/script', function(req, res) {
    res.sendFile(__dirname+'/public/javascript/script.js');
});
app.get('/point', function(req, res) {
    res.sendFile(__dirname+'/public/javascript/Point.js');
});
app.get('/style', function(req, res) {
    res.sendFile(__dirname+'/public/css/style.css');
});
app.get('/jquery', function(req, res) {
    res.sendFile(__dirname+'/public/javascript/jquery.js');
});

app.post('/drone', function(req, res) {
    var mission  = autonomy.createMission();
    var actions = req.param('actions'),
        temp,
        action,
        x = 0,
        y = 0;;
    mission.takeoff();
    mission.zero();
    console.log(actions);
    for(temp in actions) {
        action = actions[temp];
        
        if(action.angle !== 0) {
            if(action.contreHoraire) {
                mission.cw(Number(action.angle));
            }
            else {
                mission.ccw(Number(action.angle));
            }
        }
        mission.zero();
        mission.go({x:1, y: 0});
    }
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
    res.send('coucou');
});
mission.client().on('navdata', function(data) {
    io.emit('navdata', data);
});
io.on('connection', function(socket){
    socket.on('lancementDrone', function(message) {
        //Placer ici le lancement du drone les copains
    });
    socket.on('arretDrone', function(message) {
        //Placer ici l'arret du drone
    });
});


drone.listen(server);
server.listen(8080);