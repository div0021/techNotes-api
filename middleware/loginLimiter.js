const rateLimit = require('express-rate-limit');
const  {logEvents} = require('./logger');

const loginLimiter = rateLimit({
    windowMs:60*1000, //one min
    max:5, // Limit each Ip to 5 login requests per 'window per min'
    message:{message:'Too many login attempts from this IP, please try again after 60s.'},
    handler:(req,res,next,options) => {
        logEvents(`Too Many Requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,errLog.log)
        res.status(options.statusCode).send(options.message);
    }, 
    standardHeaders:true, // Return rate limit info in the RateLimit -* headers
    legacyHeaders:false, // Disable the X-RateLimit-* header
})

module.exports=loginLimiter;