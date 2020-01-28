var app = require('express')();
var http = require('http').Server(app);
var usb = require('usb')
var io = require('socket.io')(http);
require('dotenv').config()

app.get('/awe', function(req, res){
    var device = usb.findByIds("13ba", "0018");
    device.open();
    var deviceINTF=device.interface(7);
    
    if (deviceINTF.isKernelDriverActive())
        deviceINTF.detachKernelDriver();
    deviceINTF.claim();
    
    
    var ePs = deviceINTF.endpoints;
    var epIN;
    $.each( ePs, function( index, ep ){
        if(ep.direction=="in"){
            epIN=ep;
    }
    });
    if(epIN){
        epIN.on('data', function (data) {
            alert("1"+data);
        });
        epIN.transferType = 2;
        alert("non empty port : "+epIN);
        epIN.transfer(64, function(error, data) {
            console.log(error, data); 
        });
        alert("after transfer");
    }else{
        alert("unable to read .."); 
    }    
});


http.listen(4600, () => {
    console.log('listening on *: 4600');
});