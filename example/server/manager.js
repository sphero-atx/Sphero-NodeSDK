var sphero = require('../..');

exports.createManager = function createManager() {
   var gaveHeartbeat = {};
   var ee = new (require('events')).EventEmitter();
   var devices = ee.devices = {};
   function collect() {
      if (!collectInterval) return;
      sphero.ls(function (deviceChannels) {
         if (deviceChannels) deviceChannels.forEach(function (deviceChannel) {
            //
            // Don't try to connect twice
            //
            if (devices[deviceChannel]) {
               if (gaveHeartbeat) {
                  gaveHeartbeat[deviceChannel] = false;
                  devices[deviceChannel].ping(function () {
                     gaveHeartbeat[deviceChannel] = true;
                  });
               }
               //
               // No heartbeat, try to reconnect
               //
               else {
                  devices[deviceChannel].close();
               }
            }
            
            try {
               var device = new sphero.Sphero(deviceChannel);
            }
            catch (e) {
               return;
            }
            gaveHeartbeat[deviceChannel] = true;
            devices[deviceChannel] = device;
            device.on('close', function () {
               ee.emit('undevice', device);
            });
            ee.emit('device', device);
         });
      });
   }
   var collectInterval = setInterval(collect, 30 * 1000);
   ee.on('close', function () {
      clearInterval(collectInterval);
      Object.keys(devices).forEach(function (devName) {
         if (devices[devName]) devices[devName].close();
         delete devices[devName];
      })
   });
   collect();
   return ee;
}