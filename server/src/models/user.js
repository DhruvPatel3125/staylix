const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
    },
    passwordHash:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        enum:['user','admin','owner'],
        default:'user'
    },
    phone:{
        type:Number,
    },
    isBlocked:{
        type:Boolean,
        default:false,
    }

},{
    timestamps:true,
})

userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password,this.passwordHash);
};

module.exports=mongoose.model("User",userSchema);