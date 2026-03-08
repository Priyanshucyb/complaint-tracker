```javascript
const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({

email:String,
password:String,
otp:String,
verified:Boolean

})

module.exports = mongoose.model("User",UserSchema)
```
