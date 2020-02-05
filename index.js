"use strict";

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var HID = require('node-hid');
const storage = require('node-persist');
require('dotenv').config()
const axios = require('axios')

let vendorId = process.env.vID
let productId = process.env.pID

let vIDScanner = process.env.vIDScanner
let pIDScanner= process.env.pIDScanner

let tokens = ""
var nfcBuffs = ''
var buffsCount = 0
var keymap = {'04':'A','05':'B','06':'C','07':'D','08':'E','09':'F','0a':'G','0b':'H','0c':'I','0d':'J','0e':'K','0f':'L','10':'M','11':'N','12':'O','13':'P','14':'Q','15':'R','16':'S','17':'T','18':'U','19':'V','1a':'W','1b':'X','1c':'Y','1d':'Z','1e':'1','1f':'2','20':'3','21':'4','22':'5','23':'6','24':'7','25':'8','26':'9','27':'0','00':'','36':','}
var dev = {}
let value_reader = {}
var dev2 = {}

console.log(HID.devices())

dev = new HID.HID(vendorId, productId); //RFID READER
dev2 = new HID.HID(vIDScanner, pIDScanner); //BARCODE SCANNER

//socket buat nerima data dari frontend ais
io.on('connection', (socket) => {
    socket.on('retrive_token', async (token) => {
        //console.log(token)
        tokens = 'Bearer '+token
        await storage.init({
            expiredInterval: 90 * 60 * 100000, // every foREVer
        });

        await storage.setItem('token',tokens)
    })

    socket.on('set_vid_pid', async (datas) => {
        // //console.log('parsingan '+JSON.stringify(datas))
        // //dev = new HID.HID(datas.vendorId, datas.productId);

        // dev = new HID.HID(vendorId, productId);

        // //console.log(dev)

        // dev.on("data", async (data) => {
        //     buffsCount+=1
            
        //     var nfcBuf = Buffer.from([data[2]]);
        //     nfcBuffs += keymap[nfcBuf.toString('hex')]
        
        //     //console.log(nfcBuf)
        
        //     if(nfcBuffs !== undefined){
        //         if (buffsCount == 34) {  // when the buffer is in the right lenght do something with it
        //             value_reader = nfcBuffs.split('u')[0]
        //             //console.log(nfcBuffs.split('u')[0]) 
        //             searchGlobals(value_reader)
        //             nfcBuffs = '' // and reset counter/buffer
        //             buffsCount = 0
        //             //console.log(await storage.getItem('token'));
        //         }
        //     }
        // });
    })

    
})

dev.on("data", async (data) => {
    buffsCount+=1
    
    var nfcBuf = Buffer.from([data[2]]);
    nfcBuffs += keymap[nfcBuf.toString('hex')]

    //console.log(data)

    if(nfcBuffs !== undefined){
        if (buffsCount == 34) {  // when the buffer is in the right lenght do something with it
            value_reader = nfcBuffs.split('u')[0]
            console.log('result reader '+nfcBuffs.split('u')[0]) 
            //console.log(searchGlobals(value_reader))
            // io.emit("result_reader", value_reader)
            searchGlobals(value_reader)
            nfcBuffs = '' // and reset counter/buffer
            buffsCount = 0
            //console.log('token '+ await storage.getItem('token'));
        }
    }
});


dev2.on("data", async (data) => {
    buffsCount+=1
    
    var nfcBuf = Buffer.from([data[2]]);
    nfcBuffs += keymap[nfcBuf.toString('hex')]

    //console.log(data)

    if(nfcBuffs !== undefined){
        if (buffsCount == 28) {  // when the buffer is in the right lenght do something with it
            value_reader = nfcBuffs.split('u')[0]
            console.log('result scanner '+nfcBuffs.split('u')[0]) 
            // io.emit("result_reader", value_reader)
            //console.log(searchGlobals(value_reader))
            searchGlobals(value_reader)
            nfcBuffs = '' // and reset counter/buffer
            buffsCount = 0
            //console.log('token '+ await storage.getItem('token'));
        }
    }
});

async function searchGlobals(val) {
    console.log('reader ' +val)
    try {
        let { data } = await axios({
            method: "GET",
            url: process.env.AIS_API + `/v012/searchGlobals`,
            params:{
                search: val ? val : '',
                card_access: ''
            },
            headers: { authorization: await storage.getItem('token') }
        });
        //console.log('response '+ JSON.stringify(data))
        io.emit("result_reader", JSON.stringify(data))
        //return JSON.stringify(data)
    } catch (error) {
        return JSON.stringify(error)
        //console.log(JSON.stringify(error))
    }
}


// var dev = new HID.HID(vendorId, productId);

// dev.on("data", async (data) => {
//     buffsCount+=1
    
//     var nfcBuf = Buffer.from([data[2]]);
//     nfcBuffs += keymap[nfcBuf.toString('hex')]

//     //console.log(nfcBuf)

//     if(nfcBuffs !== undefined){
//         if (buffsCount == 34) {  // when the buffer is in the right lenght do something with it
//             console.log(nfcBuffs.split('u')[0]) 
//             nfcBuffs = '' // and reset counter/buffer
//             buffsCount = 0
//             console.log(await storage.getItem('token'));
//         }
//     }
// });

http.listen(process.env.APP_LISTEN || 4700, () => {
    console.log('listening on awe :'  +process.env.APP_LISTEN);
});