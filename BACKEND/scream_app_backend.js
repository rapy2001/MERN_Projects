const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
mongoose.connect("mongodb://127.0.0.1:27017/scream_app",{useNewUrlParser:true,useUnifiedTopology:true});
mongoose.connection.once("open",function(){
    console.log("connection established");
});
const User = require("./Models/User");
const Scream  = require("./Models/Scream");
const Notification = require("./Models/Notification");

const app =express();
app.use(express.json());
app.use(cors());
const seed = require("./Seed/Seed");
seed();

app.post("/api/user/register",function(req,res){
    let flg = 0;
    User.find({})
    .then((users)=>{
        for(let i = 0; i<users.length; i++)
        {
            if(users[i].username === req.body.user.username)
            {
                res.status(200).json({
                    flag:-1
                });
                flg= 1;
                break;
            }
        }
        if(flg === 0)
        {
            bcrypt.hash(req.body.user.password,saltRounds)
            .then((hash)=>{
                let newUser = {
                    username:req.body.user.username,
                    password:hash,
                    imageUrl:req.body.user.imageUrl,
                    description:req.body.user.description,
                    join:new Date(),
                    residence:req.body.user.residence,
                    friends:[],
                    notification:[]
                }
                User.create(newUser)
                .then((user)=>{
                    console.log("User Registered");
                    res.status(200).json({
                        flag:1
                    })
                })
                .catch((err)=>{
                    console.log("Error while creating the user");
                    res.status(500).json(err);
                })
            })
            .catch((err)=>{
                console.log("Error while creating the password hash");
                res.status(500).json(err);
            })
        }
    })
    .catch((err)=>{
        console.log("Error while finding the users in from the database");
        res.status(500).json(err);
    })
});

app.post("/api/user/login",function(req,res){
    let flg = 1;
    User.find({})
    .then((users)=>{
        for(let i = 0; i<users.length; i++)
        {
            if(users[i].username === req.body.user.username)
            {
                flg = 0;
                if(bcrypt.compareSync(req.body.user.password,users[i].password))
                {
                    // console.log("working");
                    res.status(200).json({
                        user:{
                            userId:users[i]._id,
                            username:users[i].username
                        },
                        flag:1
                    })
                }
                else
                {
                    // console.log("working here");
                    res.status(200).json({
                        flag:0
                    })
                }

            }
        }
        if(flg === 1)
        {
            // console.log("working here present");
            res.status(200).json({
                flag:-1
            })
        }
    })
    .catch((err)=>{
        console.log("Error while finding the users during Log in");
        res.status(500).json(err);
    });
});

app.post("/api/user/:id/sendFriendRequest",function(req,res){
    User.findById(req.body.userId)
    .then((user)=>{
        let notif = {
            flag:1,
            requestedUserId:req.params.id,
            screamId:"",
            checked:false,
            userId:user._id
        }
        Notification.create(notif)
        .then((notif)=>{
            user.notifications.push(notif._id);
            user.save()
            .then(()=>{
                res.status(200).json({
                    flag:1
                })
            })
            .catch((err)=>{
                console.log("Error while saving the user during friend Request");
            })
        })
        .catch((err)=>{
            console.log("Error while creating the notification for friend Request");
            res.status(500).json(err);
        })
    })
    .catch((err)=>{
        console.log("Error while sending the friend Requrest");
        res.status(500).json(err);
    })
});


app.post("/api/user/:id/scream/create",function(req,res){
    if(req.body.crntUser.userId === req.params.id)
    {
        let newScream  = {
            text:req.body.scream.text,
            createdAt:new Date(),
            imageUrl:req.body.scream.imageUrl,
            userDetails:{
                userId:req.params.id,
                username:req.body.crntUser.username
            },
            likes:0
        }
        Scream.create(newScream)
        .then((scream)=>{
            console.log("Scream Created");
            User.findById(req.params.id)
            .then((user)=>{
                for(let i = 0; i<user.friends.length; i++)
                {
                    User.findById(user.friends[i])
                    .then((friend)=>{
                        let notif = {
                            flag:1,
                            requestedUserId:"",
                            screamId:scream._id,
                            checked:false,
                            userId:friend._id
                        }
                        Notification.create(notif)
                        .then((notif)=>{
                            friend.notifications.push(notif._id);
                            friend.save()
                            .then(()=>{
                                if( i === user.friends.length)
                                {
                                    user.screams.push(scream._id);
                                    user.save()
                                    .then(()=>{
                                        res.status(200).json({
                                            flag:1
                                        })
                                    })
                                    .catch((err)=>{
                                        console.log("Error while saving the scream to user");
                                        res.status(500).json(err);
                                    })
                                }
                            })
                            .catch((err)=>{
                                console.log("Error while saving scream notification to user friend");
                                res.status(500).json(err);
                            })
                        })
                        .catch((err)=>{
                            console.log("Error while creating the notification");
                            res.status(500).json(err);
                        })
                        
                    })
                    .catch((err)=>{
                        console.log("Error while finding a friend of the user during sending new scream notification");
                        res.status(500).json(err);
                    })
                }
            })
            .catch((err)=>{
                console.log("Error while finding the user during scream creation");
                res.status(500).json(err);
            })
            
        })
        .catch((err)=>{
            console.log("Error while creating the scream");
            res.status(500).json(err);
        })
    }
    else
    {
        console.log("Unauthorized trial of scream creation for another user account");
    }
});


app.listen(5000,function(){
    console.log("Server Started at Port 5000 ...");
});