const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        trim:true,
        unique:true
    },
    password:{
        type:String
    },
    imageURl:{
        type:String
    },
    description:{
        type:String
    },
    join:{
        type:Date
    },
    residence:{
        type:String
    },
    screams:[{
        type:mongoose.Schema.Types.ObjectId
    }],
    friends:[{
        type:mongoose.Schema.Types.ObjectId
    }],
    friendRequests:[{
        userId:{
            type:mongoose.Schema.Types.ObjectId
        },
        condition:{
            type:Boolean
        }
    }],
    notifications:[{
        flag:Number,
        userId:{
            type:mongoose.Schema.Types.ObjectId
        },
        screamId:{
            type:mongoose.Schema.Types.ObjectId
        },
        checked:{Type:
            Boolean
        }
    }]
});

module.exports = mongoose.model("Users",userSchema);