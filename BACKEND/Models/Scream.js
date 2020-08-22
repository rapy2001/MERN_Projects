const mongoose = require("mongoose");

const screamSchema  = new mongoose.Schema({
    text:{
        type:String
    },
    createdAt:{
        type:Date
    },
    imageUrl:{
        type:String
    },
    userDetails:{
        userId:{
            type:mongoose.Schema.Types.ObjectId
        },
        username:{
            type:String
        }
    },
    likes:[{
        type:mongoose.Schema.Types.ObjectId
    }]
});

module.exports = mongoose.model("Scream",screamSchema);