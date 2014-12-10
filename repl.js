var arDrone = require('ar-drone'),
    express = require('express'),
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
    bodyParser = require('body-parser'),
    client  = arDrone.createClient();

app.use(require('body-parser')());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'mustache');


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

server.listen(3000);
app.listen(8080);


/*
client.land();
client.takeoff(function() {
    console.log(client);
    client.stop();
    client.land();
});*/
/*
client.up(0.1);
client.front(0.1);
client.animateLeds('blinkOrange', 5, 2);

setTimeout(function() {
    client.animateLeds('blinkRed', 5, 2);
    client.stop();
    client.land();
}, 3000);*/
  