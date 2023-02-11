const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

//login ,route: POST /auth , access PUBLIC
const login = async (req,res) =>{
   const {username,password} = req.body;

   if(!username || !password){
    return res.status(400).json({message:'All fields are required'});

   }

   const foundUser = await User.findOne({username}).exec();
   
   if(!foundUser || !foundUser.active){
    return res.status(401).json({message:'unauthorized'});
   }

   const match= await bcrypt.compare(password,foundUser.password);
    
   // If password don't match
   if(!match) return res.status(401).json({message:'unauthorized'});
   
   const accessToken = jwt.sign(
    {
        'UserInfo':{
            'username':foundUser.username,
            'roles':foundUser.roles
        }
    },
    process.env.ACCESS_TOKEN_SECRET,
    {expiresIn:'15m'}
   )

   const refreshToken = jwt.sign(
    {'username':foundUser.username},
    process.env.REFRESH_TOKEN_SECRET,
    {expiresIn: '7d'}
   )

   // Create secure cookie with refresh token

   res.cookie('jwt',refreshToken,{
    httpOnly:true,//accessible only by web server
     secure:true,//https
    sameSite:'None',//cross-site cookie
    maxAge:7*24*60*60*1000 // cookie expiry: set to match
   })

   //send accessToken containing username and roles
   res.json({accessToken});

}

// Refresh, route: GET /auth/refresh, access PUBLIC because access token has expired

const refresh = (req,res) =>{

    const cookies= req.cookies;
    // console.log(cookies);
    if(!cookies?.jwt) return res.status(401).json({message:'1Unauthorized'});

    const refreshToken = cookies.jwt;

    // verify token

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        asyncHandler(async (err,decoded)=>{
            if(err){ 
                console.log(err);
                return res.status(403).json({message:'Forbidden'});
        }

            const foundUser =  await User.findOne({username:decoded.username});

            if(!foundUser) return res.status(401).json({message:'2Unauthorized'});

            const accessToken = jwt.sign(
                {
                    'UserInfo':{
                        'username': foundUser.username,
                        'roles':foundUser.roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn:'15m'}
            )

            res.json({accessToken})
        })
    )

}

// logout , route POST /auth/logout , access PUBLIC  just to clear cookie if exists

const logout = (req,res) =>{

    const cookies = req.cookies;
    if(!cookies?.jwt) return res.sendStatus(204) // No content
    res.clearCookie('jwt',{httpOnly:true,sameSite:'None'
    ,secure:true
})
    res.json({message:'Cookie cleared'})

}
module.exports = {
    login,refresh,logout
}