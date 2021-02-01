 var jwt = require('jsonwebtoken');

 exports.verify= function(req,res,next){
    console.log("request",req);
    if(!req.headers.authorization){
        return res.status(401).send("unauthorized request");
    }
    console.log(req.headers.authorization);
    let token = req.headers.authorization.split(' ')[1];
    console.log("Token is available:",token);
    if(token==null)
    {
        res.status(401).send("Invalid Token");
    }
    jwt.verify(token,'my-secret-key',(error,payload)=>{
        console.log("payload :",payload);
        if(error) 
          {
              console.log("message:",error.message);
              res.status(401).send("Token error message");
          }
        else
        next();

    })
}