var async = require('async');

exports.addRoutes = function (router, devices) {
   router.get('/spheros', function () {
      this.res.json(200, Object.keys(devices));
      console.error(this.res)
      this.res.end();
   });
   
   function sendToSphero(id, body, callback) {
      devices[id]._send(body.DID, body.CID, body.DATA, callback);
   }
   
   router.post('/spheros/:id/', function (id) {
      var req = this.req;
      var res = this.res;
      var body = req.body;
      if (!body.DID || !body.CID) {
         res.json(400, {message: 'Invalid body'});
      }
      body.DATA = new Buffer(body.data ? body.data : 0, 'base64');
      if (body.ACK) {
         sendToSphero(id, body, function (err, msg) {
            if (err) {
               res.json(400, {message: ''+err});
            }
            else {
               res.json(200, {
                  SOP2: msg.SOP2,
                  MRSP: msg.MRSP,
                  DATA: msg.DATA.toString('base64')
               });
            }
         })
      }
      else {
         sendToSphero(id, body);
      }
   });
   router.post('/spheros', function () {
      console.error('broadcast time')
      var req = this.req;
      var res = this.res;
      var body = req.body;
      var msgs = {};
      
      function done(err) {
         if (err) {
            res.json(400, {message: ''+err});
         }
         else {
            res.json(200, msgs);
         }
      }
      async.forEach(Object.keys(devices), function (name, next) {
         console.error('sending to ' + name)
         if (body.ACK) {
            sendToSphero(name, body, function (err, msg) {
               if (err) next(err);
               else {
                  msgs.push(msg);
                  next();
               }
            });
         }
         else {
            sendToSphero(name, body);
            next();
         }
      }, done)
   });
}