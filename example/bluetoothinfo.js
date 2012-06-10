var sphero = require('../');
sphero.ls(function (devs) {
   devs.forEach(function(dev) {
      try {
      var bot = new sphero.Sphero(dev);
      //bot.on('open', function () {
         console.log('open');
         bot.ping(function () {
             console.log('PING')
         });
         bot.getBluetoothInfo(function (err, msg) {
            var index = [].slice.call(msg.DATA, 0, 16).indexOf(0)
             console.log(msg.DATA.slice(0, index > 0 ? index <= 16 ? index : 16 : 16).toString())
         });
      //});
      } catch (e) {}
   });
})
