var app = require('express')();
var http = require('http').Server(app);
var HID = require('node-hid');
require('dotenv').config()

let vendorId = process.env.vID
let productId = process.env.pID

console.log(HID.devices())

var dev = new HID.HID(vendorId, productId);
// // console.log(device)

dev.on("data", (data) => {
    //console.log('asli '+data)
    let filtr = data.filter(function(val) {
        return val === '<Buffer'
    })
    if (!filtr) {
        console.log(data)
    }
});

http.listen(process.env.APP_LISTEN || 4700, () => {
    console.log('listening on awe :'  +process.env.APP_LISTEN);
});