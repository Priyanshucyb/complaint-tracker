const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const bodyParser = require("body-parser")
const multer = require("multer")
const nodemailer = require("nodemailer")
const otpGenerator = require("otp-generator")

const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(express.static("public"))

/* MongoDB */

mongoose.connect("mongodb+srv://admin:admin123@cluster0.gkzbo80.mongodb.net/ComplaintDB?retryWrites=true&w=majority")
.then(()=>console.log("MongoDB Atlas Connected"))
.catch(err=>console.log(err))

/* FILE UPLOAD */

const storage = multer.diskStorage({

destination:function(req,file,cb){
cb(null,"public/uploads")
},

filename:function(req,file,cb){
cb(null,Date.now()+"-"+file.originalname)
}

})

const upload = multer({storage:storage})

/* USER MODEL */

const User = mongoose.model("User",{

email:String,
password:String,
otp:String,
verified:Boolean

})

/* COMPLAINT MODEL */

const Complaint = mongoose.model("Complaint",{

title:String,
description:String,
category:String,
priority:String,
image:String,

status:{
type:String,
default:"Pending"
}

})

/* EMAIL CONFIG */

const transporter = nodemailer.createTransport({

service:"gmail",

auth:{
user:"priyanshugarg9310@gmail.com",
pass:"jgsostwjkkzilsaw"
}

})

/* SEND OTP */

app.post("/send-otp", async (req,res)=>{

try{

const {email,password} = req.body

console.log("Signup request received:", email)

const otp = otpGenerator.generate(6,{
upperCase:false,
specialChars:false
})

console.log("Generated OTP:", otp)

const user = new User({
email,
password,
otp,
verified:false
})

await user.save()

console.log("User saved in DB")

await transporter.sendMail({
to:email,
subject:"OTP Verification",
text:`Your OTP is ${otp}`
})

console.log("Email sent successfully")

res.json({message:"OTP sent to email"})

}catch(error){

console.log("EMAIL ERROR:",error)

res.json({message:"email error check terminal"})

}

})

/* VERIFY OTP */

app.post("/verify-otp",async(req,res)=>{

const {email,otp} = req.body

const user = await User.findOne({email})

if(user && user.otp === otp){

user.verified = true

await user.save()

res.json({message:"Account verified"})

}else{

res.json({message:"Invalid OTP"})

}

})

/* LOGIN */

app.post("/login",async(req,res)=>{

const {email,password} = req.body

const user = await User.findOne({email,password,verified:true})

if(user){

res.json({message:"Login success"})

}else{

res.json({message:"Invalid login or verify OTP"})

}

})

/* SUBMIT COMPLAINT */

app.post("/complaint",upload.single("image"),async(req,res)=>{

const {title,description,category,priority} = req.body

const complaint = new Complaint({

title,
description,
category,
priority,
image:req.file.filename

})

await complaint.save()

res.json({message:"Complaint submitted"})

})

/* GET COMPLAINTS */

app.get("/complaints",async(req,res)=>{

const complaints = await Complaint.find()

res.json(complaints)

})

/* UPDATE STATUS */

app.post("/status",async(req,res)=>{

const {id,status} = req.body

await Complaint.findByIdAndUpdate(id,{status})

res.json({message:"Status updated"})

})

/* SERVER */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});