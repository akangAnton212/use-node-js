"use strict";

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var HID = require('node-hid');
const storage = require('node-persist');
require('dotenv').config()

let vendorId = process.env.vID
let productId = process.env.pID

let tokens = ""
var nfcBuffs = ''
var buffsCount = 0
var keymap = {'04':'A','05':'B','06':'C','07':'D','08':'E','09':'F','0a':'G','0b':'H','0c':'I','0d':'J','0e':'K','0f':'L','10':'M','11':'N','12':'O','13':'P','14':'Q','15':'R','16':'S','17':'T','18':'U','19':'V','1a':'W','1b':'X','1c':'Y','1d':'Z','1e':'1','1f':'2','20':'3','21':'4','22':'5','23':'6','24':'7','25':'8','26':'9','27':'0','00':'','36':','}

console.log(HID.devices())

//socket buat nerima data dari frontend ais
io.on('connection', (socket) => {
    socket.on('retrive_token', async (token) => {
        //console.log(token)
        tokens = 'Bearer '+token
        await storage.init({
            expiredInterval: 90 * 60 * 100000, // every foREVer
        });

        await storage.setItem('token',tokens)
        // storage_token = await storage.getItem('token')
        // //console.log(await storage.getItem('token'));
    })
})


var dev = new HID.HID(vendorId, productId);

dev.on("data", async (data) => {
    buffsCount+=1
    
    var nfcBuf = Buffer.from([data[2]]);
    nfcBuffs += keymap[nfcBuf.toString('hex')]

    //console.log(nfcBuf)

    if(nfcBuffs !== undefined){
        if (buffsCount == 34) {  // when the buffer is in the right lenght do something with it
            console.log(nfcBuffs.split('u')[0]) 
            nfcBuffs = '' // and reset counter/buffer
            buffsCount = 0
            console.log(await storage.getItem('token'));
        }
    }
});

http.listen(process.env.APP_LISTEN || 4700, () => {
    console.log('listening on awe :'  +process.env.APP_LISTEN);
});