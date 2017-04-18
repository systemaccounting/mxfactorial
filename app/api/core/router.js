module.exports = function(router){

    router.use(function (err, req, res, next) {
      if(err)
        console.error(err);
      res.status(500).send(err.response || 'Something broke!');
    });
    
    router.get('/', function(req,res){
      res.send('Hello.')
    });

    require('../account/route.account.js')(router);

};