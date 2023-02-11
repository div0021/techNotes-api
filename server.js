require('dotenv').config();// to use .env file u need this.
require('express-async-errors');
const express=require('express');
const path=require('path');
const {logger,logEvents} =require('./middleware/logger')
const app=express();

const errorHandler=require("./middleware/errorHandler")
const cookieParser=require('cookie-parser');
const cors=require('cors');
const corsOptions=require('./config/corsOptions')
const connectDB=require("./config/dbConn");
const mongoose=require('mongoose');
mongoose.set('strictQuery', true);

const PORT=process.env.PORT || 3500;


connectDB();

// custom made middleware
app.use(logger);
//middleware
app.use(cors(corsOptions)); // this is used so that we can test our api on google and allowing google to make request on our api
app.use(express.json()); // this is used to process json in application. This also lead to recive parse json data.

app.use(cookieParser());
app.use("/",express.static(path.join(__dirname,'public')));
app.use('/',require('./routes/root'))

app.use('/auth',require('./routes/authRoutes'));
app.use('/users',require('./routes/userRoutes'))
app.use('/notes',require('./routes/noteRoutes'));


// Note: app.use(express.static('public')); This is relative to server.js this  will work fine but to ensure all thing we will use above..



app.all("*",(req,res)=>{
    res.status(404);
    if(req.accepts('html')){
        res.sendFile(path.join(__dirname,'views','404.html'))
    }else if(req.accepts('json')){
        res.json({message:'404 Not found'});
    }else{
        res.type('txt').send('404 Not found!!')
    }
})















app.use(errorHandler)

mongoose.connection.once('open',()=>{ // this will listen for open event
    console.log('Connected to mongodb');

app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
})
})

mongoose.connection.on('error',err=>{ // this will listen for error.
    console.log(err);
    logEvents(`${err.no}:${err.code}\t${err.syscall}\t${err.hostname}`,'mongoErrLog.log');
})

