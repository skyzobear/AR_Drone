/*jshint node:true*/
/*
 * Sets up a real stream + attaches it to a server
 */
 var output = require('fs').createWriteStream('out/'+ Date.now() +'vid.h264');
module.exports.attach = function droneStream(server, options) {
    'use strict';
    var WebSocketServer = require('ws').Server,
        wss = new WebSocketServer({server: server, path: '/dronestream'}),
        sockets = [],
        Parser = require('./PaVEParser'),
        PaVEParser = require('./video/PaVEParser'),
        arDrone = require('ar-drone');

    options = options || {};
    options.timeout = options.timeout || 4000;

    function init() {

        var tcpVideoStream, parser;

        if (!options.tcpVideoStream) {
            tcpVideoStream = new arDrone.Client.PngStream.TcpVideoStream(
                options
            );

            console.log(
                "Connecting to drone on %s", options.ip || "192.168.1.1"
            );

            tcpVideoStream.connect();
            tcpVideoStream.on('error', function (err) {
                console.log('There was an error: %s', err.message);
                tcpVideoStream.end();
                tcpVideoStream.emit("end");
                init();
            });
        } else {
            tcpVideoStream = options.tcpVideoStream;
        }

        parser = new Parser();
        var parseurAEmmerde = new PaVEParser();
        parseurAEmmerde
    .on('data', function(data) {
        output.write(data.payload);
    })
    .on('end', function() {
        output.end();
    });



        tcpVideoStream.on('data', function (data) {
            parser.write(data);
        });
        tcpVideoStream.pipe(parseurAEmmerde);

        parser.on('data', function (data) {
            sockets.forEach(function (socket) {
                socket.send(data, {binary: true});
            });
        });
    }
    init();

    wss.on('connection', function (socket) {
        sockets.push(socket);

        socket.on("close", function () {
            console.log("Closing socket");
            sockets = sockets.filter(function (el) {
                return el !== socket;
            });
        });
    });
};
