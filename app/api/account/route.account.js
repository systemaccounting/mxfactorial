module.exports = function(router){
    
    var Account = require('./control.account.js');
    
    router.route('/account')
        .post(function(req, res){
            var data=req.body;
            Account.createUser(data, function(err,result){
                if (err)
                    res.send(err);
                else
                    res.send(result);
            });
        })
        
    router.route('/account/all')
        .get(function(req, res){
            Account.getAll(function(err,result){
                if (err)
                    res.send(err);
                else
                    res.send(result);
            });
        })
        .delete(function(req,res){
            Account.deleteAll(function(err,result){
                if (err)
                    res.send(err);
                else
                    res.send(result);
            });
        })
}