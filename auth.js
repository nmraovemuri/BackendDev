const jwt = require('jsonwebtoken');

// Ensuring Authorization
exports.ensureToken = function (req, res, next){
    console.log(req.headers);
    const bearerHeader = req.headers["authorization"];
    if(typeof bearerHeader !== 'undefined' ){
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1]
        jwt.verify(bearerToken, 'my-secret-key', function (err, data){
            if(err){
                res.status(403).json({
                    status: "failed",
                    error:"Invalid Authorization"
                });
            }
        });
        next();
    }else{
        return res.status(403).json({
            status: "failed",
            error:"Forbidden"
        });
    }
}