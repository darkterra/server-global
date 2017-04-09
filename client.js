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


// Conf port
const port = process.env.PORT || 3000;

const logger = require('./logger');


// Conf app
app.use(compression({filter: shouldCompress}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(require('morgan')("combined", { "stream": logger.stream }));

app.use(express.static(path.join(__dirname)));


// Socket io

let io  = socketio(http);

let tab = [];

// var client = require('socket.io-client')('http://server-global-youngjeremy.c9users.io');
// var client = require('socket.io-client')('http://darkterra.fr:3000');
const socket = require('socket.io-client');
let client = socket.connect('https://c9.seefox.fr', {reconnect: true});

client.on('connect', () => {
  console.log('connected')

  // client.emit('needHelp');
  // client.emit('sendUpdate', testObjectTMP);
  // client.emit('sendUpdate', testObjectTMP);
});

// client.on('sendUpdate', function(data) {
//   checkObject(data, function(err, result) {
//     if (err) {
//       socket.emit('errorOnProjectUpdate', `Error : ${err}`);
//     }
//     else {
//       // TODO Check si le tableau contient déjà le service, si oui, maj de l'occurence, si non push
//       var element = tab.find(x => x.nameService === data.nameService);
//       if (element) {
//         tab.splice(tab.indexOf(element), 1);
//       }
//       tab.push(result);
//       client.emit('projectUpdated', tab)
//     }
//   })
// });
// client.on('deleteProject', function(data) {
//   console.log('read pung event: ', data);
// });

client.on('info', function(data) {
  console.log('read info event: ', data);
});

client.on('projectUpdated', function(data) {
  console.log('read projectUpdated event: ', JSON.stringify(data));
});

client.on('errorOnProjectUpdate', function(data) {
  console.log(data);
});

client.emit('deleteService', 'DemoJY');

// Functions
function shouldCompress(req, res) {
  if (req.headers['x-no-compression']) {
    // don't compress responses with this request header 
    return false;
  }
  // fallback to standard filter function 
  return compression.filter(req, res);
}

var testObjectTMP = {
 nameService : "DemoJY",
 projects : [
{ 
   name : "projet de test", 
   desc : "Description du projet, blablabla...", 
   daysOff : { Mo : true, Tu : true,  We : true, Th : true, Fr : true, Sa : false, Su : false }, 
   workingHours : { start : 8, end : 18 }, 
   task : [{ id : 0, name : "tache 1", desc : "Init du projet", start : 1491673387558, end : 1491680626329, percentageProgress : 100, color  : "#fc0202", linkedTask : [
     {
       to : "tache 2"
     }
   ], ressources : ["Jérémy", "PC Razer A"] },
   { id : 1, name : "tache 2", desc : "Réalisation du serveur central", start : 1491680626329, end : 1491684607029, percentageProgress : 100, color  : "#fc0202", linkedTask : [
     {
       from : "tache 1"
     },
     {
       to : "tache 3"
     }
   ], ressources : ["Jérémy"] },
   { id : 2, name : "tache 3", desc : "Calcul des prochains numéro du loto", start : 1491684607029, end : 1491691847051, percentageProgress : 50, color  : "#fc0202", linkedTask : [
     {
       from : "tache 2"
     },
     {
       to : "tache 4"
     },
     {
       to : "tache x"
     }
   ], ressources : ["Jérémy", "PC Razer B"] }], 
   groupTask : [{ name : "optional", start : Date.now(), end : Date.now() }], 
   resources : [{ name : "Jérémy", cost : 500, type : "humain" }, { name  : "PC Razer A", cost  : 1000, type  : "materiel"}, { name  : "PC Razer B", cost  : 8000000000, type  : "materiel"}], 
   milestones : [{ name : "jalon °1 (tirage du loto)", date : 1491697544976 }]
  } 
 ] 
};

let templateObject = `{
    nameService : String, 
    projects :
    [
      {
        name : String,
        desc : String,
        daysOff : { Mo : Boolean, Tu : Boolean,  We : Boolean, Th : Boolean, Fr : Boolean, Sa : Boolean, Su : Boolean },
        workingHours : { start : Number, end : Number },
        task : [{ id : Number, name : String, desc : String, start : Number, end : Number, percentageProgress : Number, color : String, linkedTask : Array, ressources : Array }],
        groupTask : [{ name : String, start : Number, end : Number }],
        resources : [{ name : String, cost : Number, type : String }],
        milestones : [{ name : String, date : Number }]
      }
    ]
  }`;

// checkObject(testObjectTMP, function(err, result) {
//   console.log(`err: ${err}, result: ${result}`);
// });

function checkObject (data, callback) {
  if (check(templateObject, data)) {
    callback(undefined, data);
  }
  else {
    callback(`Type de l'objet incorrect...\nVoici le template de vérification, vérifiez que vous envoyer un objet ayant la même strucure :\n${templateObject}`);
  }
}

// Log Error
ServerEvent.on('error', (err) => {
  console.log(err);
});


// Création du serveur
http.listen(port, () => {
  console.log(`\nClient at 127.0.0.1:${port}`.verbose);
  console.log('La plateforme fonctionne depuis : '.data + colors.warn(moment.duration((os.uptime().toFixed(0))*1000).humanize()));
});




module.exports = {
  connect: (app, url) => {
    let client = socket.connect(url, {
      reconnect: true
    });
    let server = io(app);

    //-----
    //Client of WebSocket Server Central
    //-----
    client.on('connect', () => {
      console.log('connected on WebSocket Central Server')
      client.emit('needHelp');
      client.on('info', (info)=>{
        console.log(info)
      });
      client.on('projectUpdated', (groupes)=>{
        console.log(groupes)
      });
      client.on('errorOnProjectUpdate', (msg)=>{
        console.log(msg);
      });
    });
    
    //-----
    //Server of WebSocket of MNM.JS
    //-----
    server.on('connection', (socket)=>{
      socket.on('connectProject', (id, nickname)=>{
        socket.join(id);
        console.log(nickname+' a rejoint la discussion du projet '+id);
        models.messages.find({project: id}, null, {sort: "-created_at"}, (err, messages)=>{
          socket.emit('exchanges', messages)
        })
      })
      socket.on('leaveProject', (id, nickname)=>{
        socket.leave(id);
        console.log(nickname+' a quitté la discussion du projet '+id);
      })
      socket.on('chat', (msg, userId, projectId)=>{
        models.create({message: msg, author: userId, project: projectId}, (err, message)=>{
          if(err){
            console.log(err);
            throw err;
          }else{
            socket.broadcast.emit("newMessage", message);
          }
        })
      })
    })
  }
}