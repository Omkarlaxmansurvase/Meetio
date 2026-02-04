import {user} from "../models/users.models.js";
import bcrypt,{hash} from "bcrypt";
import httpStatus from "http-status";
import crypto from "crypto";

// User Registration Controller
const register = async (req , res)=>{
    const {name,username,email,password} = req.body;

    try {
            const existingUser = await user.findOne({username});
            if (existingUser){
                return res.status(httpStatus.FOUND).json({message:"User already exists"});
            }

            const hashedPassword = await bcrypt.hash(password,10);

            const newUser = new user({
                name:name,
                username:username,
                email:email,
                password:hashedPassword,
            })
            await newUser.save();
            return res.status(httpStatus.CREATED).json({message:"User registered successfully"});
        }
    catch(error){
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message:"Error registering user", error:error.message});
    }
}
// User Login Controller
const login = async (req , res) =>{
    const {username,password} = req.body;
    
    if (!username || !password){
        return res.status(httpStatus.BAD_REQUEST).json({message:"Username and password are required"});
    }
    
    try {
        const foundUser  = await user.findOne({username});
        if (!foundUser){
            return res.status(httpStatus.NOT_FOUND).json({message:"User not found"});
        }

        const isPasswordValid = await bcrypt.compare(password, foundUser.password);
        if(isPasswordValid){
            let token = crypto.randomBytes(20).toString("hex");

            foundUser.token = token;
            await foundUser.save();
            return res.status(httpStatus.OK).json({token:token})
        }
        else {
            return res.status(httpStatus.UNAUTHORIZED).json({message:"Invalid password"});
        }

    }
    catch(e){
        return res.status(500).json({message:"smthng went wrong"})
    }
}

export {register,login};