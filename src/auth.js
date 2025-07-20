import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "./database.js";

const JWT_SECRET=process.env.JWT_SECRET;
async function hashpassword(plain_password){
    //before hashing we give some random string to our password for security,(salt)
    const salt = await bcrypt.genSalt(10)  //create salt with 10 rounds
    const hashedPassword = bcrypt.hash(plain_password,salt);
    return hashedPassword;
}

async function comparepassword(plain_password,hashedPassword){
  return  bcrypt.compare(plain_password,hashedPassword)   //compare password for authentication
}

 function generateToken(user){
    const payload = {
        userId:user.id,
        username:user.username
    }
    return jwt.sign(payload,JWT_SECRET,{expiresIn:"4h"})  //create jwt token and asign to login user
}
export{
    hashpassword,
    comparepassword,
    generateToken
}
