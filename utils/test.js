const {generateId} = require('./IdGenerator');
const {generateOTP} = require('./OtpGenerator');
const {sendMail} = require('./Email');
try{
    const mail = "bhavyagodhaniya2004@gmail.com"
    sendMail(mail, `Your OTP code is ${generateOTP()}. Id id ${generateId()}`);
}
catch(e){
    console.error(e);
}   
