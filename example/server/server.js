var http = require('http');
var union = require('union');
var director = require('director');
var ecstatic = require('ecstatic');

var manager = require('./manager').createManager();
var myDevices = {};
var mapping = {};
manager.on('device', function (device) {
   device.on('notification', function(msg) {
      io.sockets.in('notifications').send(msg)
   })
   device.getBluetoothInfo(function (err, msg) {
      var index = [].slice.call(msg.DATA, 0, 16).indexOf(0)
      console.error(msg.DATA)
      var name = msg.DATA.slice(0, index >= 0 ? index <= 16 ? index : 16 : 16).toString();
      console.error('mapping', msg, name)
      myDevices[name] = device;
      mapping[device.origin] = name;
   });
});
manager.on('undevice', function (device) {
   if (mapping[device.origin]) {
      var name = mapping[device.origin];
      if (myDevices[name]) {
         delete myDevices[name];
      }
      delete mapping[device.origin];
   }
});

var router = new director.http.Router();
require('./routes.js').addRoutes(router, myDevices);

//
// Server
//

var server = union.createServer({
  before: [
   function (req, res) {
      console.error(req.method, req.url)
      res.emit('next');
   },
   function (req, res) {
      var found = router.dispatch(req, res);
      if (!found) {
         res.emit('next');
      }
   },
   ecstatic(__dirname + '/public')
  ]
});
server.listen(1337);

//
// Event Feed
//

var io = require('socket.io').listen(server);
io.sockets.on('connection', function (socket) {
   socket.join('notifications');
});

//
// Exports for debugging
//
exports.server = server;
exports.io = io;