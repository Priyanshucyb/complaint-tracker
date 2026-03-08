```javascript
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
```
