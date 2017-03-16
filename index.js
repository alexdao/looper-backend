var express = require('express');
var execSync = require('child_process').execSync;
var screenshot = require('desktop-screenshot');
var app = express();
var fs = require('fs');
var PubNub = require('pubnub');
var robot = require("robotjs");

var captureChannel = 'capture';
var dataChannel = 'data'; 

pubnub = new PubNub({
    publishKey: 'pub-c-f89964b0-40f6-4ead-9864-15eb2add8af7',
    subscribeKey: 'sub-c-d4b8b206-08fa-11e7-b95c-0619f8945a4f'
})

app.use(express.static('public'));

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
  subscribe();
});


app.get('/', function(req, res) {
	phoneConnected();
}); 
 
function subscribe() {
    pubnub.addListener({
        message: function(message) {
            console.log("New Message!!", message);
            if (message.message == 'capture') {
            	phoneConnected();
            }
            else {
            	robot.keyTap("space");
            }
        }
    })      
    console.log("Subscribing..");
    pubnub.subscribe({
        channels: ['capture']
    });
}

function phoneConnected() { 
	captureImage();
		execSync('rm coordinates.txt');
		execSync('touch coordinates.txt');
		execSync('./darknet detect cfg/yolo.cfg yolo.weights public/screenshot.png');
		execSync('mv predictions.png public/predictions.png');
		 sendCoordinates(function(data) {
		 	publish(dataChannel, data);
		 	//TODO: Do we even need to send complete message?
		});
}

function sendCoordinates(cb) {
	fs.readFile('coordinates.txt', 'utf8', function (err,data) {
	  if (err) {
	    return cb(err);
	  }
	  return cb(data);
	});
}

function publish(channel, message) {
	var publishConfig = {
        channel : channel,
        message : message
    }
    pubnub.publish(publishConfig, function(status, response) {
    	console.log(status, response);	
    })
};


function publishSampleMessage() {
    var publishConfig = {
        channel : "capture",
        message : "Hello from PubNub Docs!"
    }
    pubnub.publish(publishConfig, function(status, response) {
        console.log(status, response);
    })
}

function captureImage() {
	screenshot("public/screenshot.png", function(error, complete) {
	if(error)
	    console.log("Screenshot failed", error);
	else
	    console.log("Screenshot succeeded");
	});
}
