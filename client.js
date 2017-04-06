/**
 * @file server.js
 * @desc Serveur permettant de partager les projets des différents services
 * 
 * @version Alpha 1.1.0
 * 
 * @author Jérémy Young            <darkterra01@gmail.com>
 * 
 */

'use strict';

// Requires
const express       = require('express');
const app           = express();
const compression   = require('compression');
const http          = require('http').Server(app);
const cookieParser  = require('cookie-parser');
const bodyParser    = require('body-parser');
const colors        = require('colors');
const os            = require('os');
const moment        = require('moment');
const socketio      = require('socket.io');
const path          = require('path');


// Server Events
let EventEmitter  = require('events').EventEmitter;
let ServerEvent		= new EventEmitter();



// Conf color
colors.setTheme({
  silly   : 'rainbow',
  input   : 'grey',
  verbose : 'cyan',
  prompt  : 'grey',
  info    : 'green',
  data    : 'grey',
  help    : 'cyan',
  warn    : 'yellow',
  debug   : 'blue',
  error   : 'red'
});


// Conf port
const port = process.env.PORT || 3000;

const logger      = require('./logger');


// Conf app
app.use(compression({filter: shouldCompress}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(require('morgan')("combined", { "stream": logger.stream }));

app.use(express.static(path.join(__dirname)));


// Socket io

let io  = socketio(http);



// var client = require('socket.io-client')('http://server-global-youngjeremy.c9users.io');
// var client = require('socket.io-client')('http://darkterra.fr:3000');
var client = require('socket.io-client')('37.163.137.178:1021');
// socket.emit('ping');
client.on('connect', function(data) {
	console.log('data: ', data);
	
	client.emit('ping');
});

client.emit('ping');

client.on('pong', function(data) {
	console.log('data: ', data);
});

// Functions
function shouldCompress(req, res) {
  if (req.headers['x-no-compression']) {
    // don't compress responses with this request header 
    return false;
  }
  // fallback to standard filter function 
  return compression.filter(req, res);
}

// Log Error
ServerEvent.on('error', (err) => {
  console.log(err);
});


// Création du serveur
http.listen(port, () => {
  console.log(`\nServer global at 127.0.0.1:${port}`.verbose);
  console.log('La plateforme fonctionne depuis : '.data + colors.warn(moment.duration((os.uptime().toFixed(0))*1000).humanize()));
});