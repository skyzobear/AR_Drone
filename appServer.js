var express = require('express'),
	io = require('socket.io').listen(server),
	bodyParser = require('body-parser'),
	app = express(),
	fs = require('fs'),
	path = require('path'),
	low = require('lowdb'),
	db = low('db.json'),
	arDrone = require('ar-drone'),
	PaVEParser = require('./lib/video/PaVEParser'),
	output = require('fs').createWriteStream('out/'+ Date.now() +'vid.h264'),
	video = arDrone.createClient().getVideoStream(),
	parser = new PaVEParser(),
	arDroneConstants = require('ar-drone/lib/constants'),
	server = app.listen(4000);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

var actionValue = new Array('Avancer', 'Reculer');
var actionList = new Array();

app.get('/form', function  (req, res) {
	res.sendFile(__dirname + "/form.html");
});

app.post('/formResult', function (req, res) {
	//console.log(actionValue.indexOf(req.body.action) !== undefined && req.body.action !== "");
	actionList.push({action: req.body.action, distance: req.body.distance});
	actionList.push({action2: req.body.action2, distance2: req.body.distance2});
	actionList.push({action3: req.body.action3, distance3: req.body.distance3}); 
	db("Itineraire").push({date: Date.now(), actionList: actionList});
	//actionList ajouter à un dernier élément 
});

app.get('/test', function (req, res) {
	// 1418156766430
	var database = db("Itineraire").find({date: 1418156766430}).value();
	console.log(database);
});

// stream

// Fetch configuration
try {
    var config = require('./config');
} catch (err) {
    console.log("Missing or corrupted config file. Have a look at config.js.example if you need an example.");
    process.exit(-1);
}

// Keep track of plugins js and css to load them in the view
var scripts = []
  , styles = []
  ;

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

// Connect and configure the drone
var client = new arDrone.createClient({timeout:4000});
client.config('general:navdata_demo', 'TRUE');
client.config('video:video_channel', '0');
client.config('general:navdata_options', navdata_options);

// Add a handler on navdata updates
var latestNavData;
client.on('navdata', function (d) {
    latestNavData = d;
});

// Signal landed and flying events.
client.on('landing', function () {
  console.log('LANDING');
  io.sockets.emit('landing');
});
client.on('landed', function () {
  console.log('LANDED');
  io.sockets.emit('landed');
});
client.on('takeoff', function() {
  console.log('TAKEOFF');
  io.sockets.emit('takeoff');
});
client.on('hovering', function() {
  console.log('HOVERING');
  io.sockets.emit('hovering');
});
client.on('flying', function() {
  console.log('FLYING');
  io.sockets.emit('flying');
});

// Process new websocket connection
io.set('log level', 1);
io.sockets.on('connection', function (socket) {
  socket.emit('event', { message: 'Welcome to cockpit :-)' });
});

// Schedule a time to push navdata updates
var pushNavData = function() {
    io.sockets.emit('navdata', latestNavData);
};
var navTimer = setInterval(pushNavData, 100);

// Prepare dependency map for plugins
var deps = {
    server: server
  , app: app
  , io: io
  , client: client
  , config: config
};


// Load the plugins
var dir = path.join(__dirname, 'plugins');
function getFilter(ext) {
    return function(filename) {
        return filename.match(new RegExp('\\.' + ext + '$', 'i'));
    };
}

config.plugins.forEach(function (plugin) {
    console.log("Loading " + plugin + " plugin.");

    // Load the backend code
    require(path.join(dir, plugin))(plugin, deps);

    // Add the public assets to a static route
    if (fs.existsSync(assets = path.join(dir, plugin, 'public'))) {
      app.use("/plugin/" + plugin, express.static(assets));
    }

    // Add the js to the view
    if (fs.existsSync(js = path.join(assets, 'js'))) {
        fs.readdirSync(js).filter(getFilter('js')).forEach(function(script) {
            scripts.push("/plugin/" + plugin + "/js/" + script);
        });
    }

    // Add the css to the view
    if (fs.existsSync(css = path.join(assets, 'css'))) {
        fs.readdirSync(css).filter(getFilter('css')).forEach(function(style) {
            styles.push("/plugin/" + plugin + "/css/" + style);
        });
    }
});

// Start the web server
server.listen(app.get('port'), function() {
  console.log('AR. Drone WebFlight is listening on port ' + app.get('port'));
});

 

