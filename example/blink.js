var sphero = require('../');
sphero.ls(function (devs) {
   devs.forEach(function(dev) {
      var bot = new sphero.Sphero(dev);
      //bot.on('open', function () {
         console.log('open');
         bot.ping(function () {
             console.log('PING')
         });
         bot.setRGB(200,200,200, false, function () {
             console.log('RGB')
         });
      //});
   });
})
