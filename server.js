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
const session       = require('express-session');
const check         = require('type-check').typeCheck;


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

// Conf session
const EXPRESS_SID_VALUE = 'Secret Keyboard DarkTerra Cat';
const sessionMiddleware = session({
  secret              : EXPRESS_SID_VALUE,
  resave              : false,
  saveUninitialized   : true,
  // store               : new MongoStore({ mongooseConnection: mongoose.connection })
});

// Conf port
const port = 18000;

// Controller
const logger      = require('./logger');


// Conf app
app.use(compression({filter: shouldCompress}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(sessionMiddleware);
app.use(require('morgan')("combined", { "stream": logger.stream }));

app.use(express.static(path.join(__dirname)));


// Variables
let io  = socketio(http);
let tab = [];
    
// Configuration de Socket.IO pour pouvoir avoir accès au sessions
io.use(function(socket, next) {
	sessionMiddleware(socket.request, socket.request.res, next);
});


/***********************************************************************************
*														Initialisation des variables												   *
***********************************************************************************/
// Ouverture de la socket
io.on('connection', function (socket) {
  
  console.log('Client Connecté');
  
  socket.on('needHelp', function(data) {
  	socket.emit('info', `Bravo ! Tu es connecté sur le serveur global
tu peux utiliser l'emit "sendUpdate" pour envoyer une MAJ de tes données, l'émit "deleteService" pour supprimer le service (groupe) et l'ensemble des projets
tu peux ecouter sur "projectUpdated" pour recevoir l'ensemble de tous les projets de tous les services (groupes), tu peux aussi écouter "errorOnProjectUpdate" pour savoir si il y a eu une erreur lors d'une MAJ`);
  });
	
	socket.on('sendUpdate', function(data) {
    checkObject(data, function(err, result) {
      if (err) {
        socket.emit('errorOnProjectUpdate', `Error : ${err}`);
      }
      else {
        var element = tab.find(x => x.nameService === data.nameService);
        if (element) {
          tab.splice(tab.indexOf(element), 1);
        }
        tab.push(result);
        socket.emit('projectUpdated', tab);
      }
    });
  });
  socket.on('deleteService', function(data) {
    console.log('Delete the Project: ', data);
    var element = tab.find(x => x.nameService === data.nameService);
    if (element) {
      tab.splice(tab.indexOf(element), 1);
    }
    else {
      socket.emit('errorOnProjectUpdate', `Error : Project not found...`);
    }
  });
	
	
	// ----------------------- Décompte uniquement des User Connecté ----------------------- //
	socket.on('disconnect', function() {
		console.log('Client Disconnect');
	});
});


let templateObject = `{
    nameService : String, 
    projects :
    [
      {
        name : String,
        desc : String,
        daysOff : { M : Boolean, T : Boolean,  W : Boolean, T : Boolean, F : Boolean, S : Boolean, S : Boolean },
        workingHours : { start : Number, end : Number },
        task : [{ id : Number, name : String, desc : String, percentageProgress : Number, linkedTask : Array, ressources : Array }],
        groupTask : [{ name : String, start : Number, end : Number }],
        resources : [{ name : String, cost : Number, type : String }],
        milestones : [{ name : String, date : Number }]
      }
    ]
  }`

function checkObject (data, callback) {
  if (check(templateObject, data)) {
    callback(undefined, data);
  }
  else {
    callback(`Type de l'objet incorrect...\nVoici le template de vérification, vérifiez que vous envoyer un objet ayant la même strucure :\n${templateObject}`);
  }
}

/***********************************************************************************
*												Différentes possibilité d'émissions											   *
***********************************************************************************/
/*
// send to current request socket client
socket.emit('message', "this is a test");

// sending to all clients, include sender
io.sockets.emit('message', "this is a test");

// sending to all clients except sender
socket.broadcast.emit('message', "this is a test");

// sending to all clients in 'game' room(channel) except sender
socket.broadcast.to('game').emit('message', 'nice game');

// sending to all clients in 'game' room(channel), include sender
io.sockets.in('game').emit('message', 'cool game');

// sending to individual socketid
io.sockets.socket(socketid).emit('message', 'for your eyes only');
*/

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