var sphero = require('../');

process.on('uncaughtException', function (e) {
   console.error(e.stack)
   if (king) {
      king.close();
   }
   subjects.forEach(function (subject) {
      subject.close();
   });
   setTimeout(function () {process.exit(2);}, 10 * 1000)
})

var king;
var subjects = [];
var used = [];
var state = {
   speed: 0,
   heading: 0 
}
sphero.ls(function (devs) {
   if (devs.length < 1) {
      console.log('There are no spheros.');
      return;
   }
   subjugate();
});

function annoint(king) {
   king.setRGB(255,255,0);
   king.setBackLED(128);
   king.setDataStreaming([
      king.sensors.imu_yaw,
      king.sensors.imu_roll,
      king.sensors.imu_pitch,
      king.sensors.accelerometer_z,
      king.sensors.accelerometer_y,
      king.sensors.accelerometer_x
   ], 10, 1);
   orient();
   var origin_p = null;
   var origin_r = null;
   var origin_y = null;
   king.on('notification', function (msg) {
      if (msg.ID_CODE === 3) {
         var p = msg.DATA.readInt16BE(0);
         var r = msg.DATA.readInt16BE(2);
         var y = msg.DATA.readInt16BE(4);
         var za = msg.DATA.readInt16BE(6) / 4096;
         var ya = msg.DATA.readInt16BE(8) / 4096;
         var xa = msg.DATA.readInt16BE(10) / 4096;
         console.error('yaw', y)
         console.error('roll', r);
         console.error('pitch', p);
         console.error('accel z', za)
         console.error('accel y', ya)
         console.error('accel x', xa)
         if (origin_p === null) {
            origin_p = p;
         }
         if (origin_r === null) {
            origin_r = r;
         }
         if (origin_y === null) {
            origin_y = y;
         }
         var adjusted_p = (p + 180) % 360;//(origin_p - p) | 0;
         var adjusted_y = y;//(origin_y - y) | 0;
         var adjusted_r = -r;//(origin_r - r) | 0;
         function getHeading () {
            var value = (ya * 180 + 360) % 360;
            console.error('HEADING', value)
            return value;
         }
         function getSpeed () {
            var value = (ya * ya + xa * xa) * 255;
            console.error('SPEED', value)
            return value;
         }
         if (xa < -0.25 && xa > -1) {
            console.error('GO')
            subjects.forEach(function (subject) {
               subject.roll(getSpeed(), getHeading());
            });
         }
         else if (xa < 0.15 && xa > -1) {
            console.error('TURN')
            subjects.forEach(function (subject) {
               subject.setHeading(getHeading());
            });
         }
         else {
            console.error('STOP')
            subjects.forEach(function (subject) {
               subject.roll(0, 0);
            });
         }
      }
   });
}

function orient(callback) {
   king.setStabilization(true, function () {});
   setTimeout(function () {
      king.setStabilization(false, callback);
   }, 1000);
}

function subjugate() {
   sphero.ls(function (spheros) {
      try {
         spheros.forEach(function (dev) {
            if (!king) {
               try {
                  king = new sphero.Sphero(dev);
                  used.push(dev);
                  annoint(king);
               }
               catch (e) {}
               return;
            }
            if (used.indexOf(dev) === -1) {
               var subject = new sphero.Sphero(dev);
               subjects.push(subject);
               subject.setRGB(255, 0, 0);
               subject.setBackLED(128);
               used.push(dev);
               subject.on('end', function () {
                  var index = subjects.indexOf(subject);
                  if (index !== -1) {
                     subjects.splice(index, 1);
                  }
                  index = used.indexOf(subject);
                  if (index !== -1) {
                     used.splice(index, 1);
                  }
               });
            }
         });
      }
      catch (e) {
         console.error(e);
      }
   });
}
setInterval(function () {console.log('I am alive', Date.now())}, 1000)
setInterval(subjugate, 10000)