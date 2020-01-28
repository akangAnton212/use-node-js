var app = require('express')();
var http = require('http').Server(app);
var usb = require('usb')
var buffer = require('buffer')
var io = require('socket.io')(http);
require('dotenv').config()

// var Hidstream = require('node-hid-stream').Keyboard;
// var hidstream = new Hidstream({ vendorId: '13BA', productId: '0018' });
 
// hidstream.on("data", function(data) {
//   console.log(data); // Raw buffer from HDI device.
// });

var HID = require('node-hid');
let vendorId = parseInt('13BA')
let productId = parseInt('0018')
// console.log(productId)
var dev = new HID.HID(vendorId, productId);
// console.log(device)

dev.on("data", (data) => {
    console.log(data)
});

dev.removeAllListeners("data");
dev.write([EndPoint, 1, EndOfCommandToken]); // Makes device send an error message
dev.close();

http.listen(4600, () => {
    console.log('listening on *: 4600');
});