const allowedOrigins=require("./allowedOrigin");

const corsOptions={ // this is the third party middle ware.//lookup object.
    origin:(origin,callback)=>{ 
        if(allowedOrigins.indexOf(origin) !== -1 || !origin){
            // no origin means that if we test it in postmen or thunder client, they don't have origin.
            callback(null,true) 
            // callback syntax: - callback(error,allow or not);

        }else{
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials:true,
    optionsSuccessStatus:200

}

module.exports=corsOptions;