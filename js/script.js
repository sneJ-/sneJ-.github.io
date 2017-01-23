//Define what happens if the DOM is ready
$(document).ready(function() { 
	fillCanvas();
	
	//insert IP addresses into the page
	getIPs(function(ip){
		div = document.getElementById("ipAddresses");
		div.innerHTML = div.innerHTML + "\n" + ip;
	});
});

//Fills the canvas
function fillCanvas(){
	window.c = document.getElementById("canvas_art");
	if (c.getContext){
		c.addEventListener("click", canvasClick);
		window.ctx = c.getContext("2d");
		addItemsRecursive();
	}
}

//Adds recursively random circles until there is no white spot left
function addItemsRecursive(){
	//Check if there is a white pixel left in the canvas
	var imageData = ctx.getImageData(0, 0, c.width, c.height);
	var pixelArray = imageData.data;
	var length = pixelArray.length / 4; // 4 component - red, green, blue and alpha
	var whitePixelLeft = false;
	var i = 0;

	while (i < length && !whitePixelLeft) {
		var index = 4 * i;

		var r = pixelArray[index];
		var g = pixelArray[++index];
		var b = pixelArray[++index];
		var a = pixelArray[++index];

		if (r === 0 && g === 0 && b === 0 & a === 0) { // pixel is white
			whitePixelLeft = true;
		}
		i++;
	}
	
	if(whitePixelLeft){
		drawCircle(Math.random()*c.width,Math.random()*c.height);
		window.setTimeout(function(){addItemsRecursive()},10);
	}
	else{
		drawRectangles();
		drawHeart(242,223);
	}
}

//Draws a circle when the canvas is clicked
function canvasClick(e){
	var element = c;
	var offsetX = 0, offsetY = 0

	if (element.offsetParent) {
		do {
			offsetX += element.offsetLeft;
			offsetY += element.offsetTop;
		}while (element = element.offsetParent);
	}

	drawCircle(e.pageX - offsetX, e.pageY - offsetY);
}

function drawRectangles(){
	ctx.fillStyle = "rgb(200,0,0)";
	ctx.fillRect(10, 10, 55, 50);
	ctx.fillStyle = "rgba(0, 0, 200, 0.75)";
	ctx.fillRect(30, 30, 55, 50);
}

function drawHeart(x,y){
	ctx.fillStyle = "rgba(222, 0, 0, 0.85)";
	ctx.beginPath();
	ctx.moveTo(75+x,40+y);
	ctx.bezierCurveTo(x+75,y+37,x+70,y+25,x+50,y+25);
	ctx.bezierCurveTo(x+20,y+25,x+20,y+62.5,x+20,y+62.5);
	ctx.bezierCurveTo(x+20,y+80,x+40,y+102,x+75,y+120);
	ctx.bezierCurveTo(x+110,y+102,x+130,y+80,x+130,y+62.5);
	ctx.bezierCurveTo(x+130,y+62.5,x+130,y+25,x+100,y+25);
	ctx.bezierCurveTo(x+85,y+25,x+75,y+37,x+75,y+40);
	ctx.fill();
}

function drawCircle(x,y){
	ctx.beginPath();
	ctx.arc(x, y, Math.random()*23+2, 0, 2 * Math.PI, false);
	ctx.fillStyle = 'hsl(' + 360 * Math.random() + ', 50%, 50%)';
	ctx.fill();
	ctx.lineWidth = Math.random()*3+0.5;
	ctx.strokeStyle = 'hsl(' + 360 * Math.random() + ', 50%, 50%)';
	ctx.stroke();
}

//get the IP addresses associated with an account
function getIPs(callback){
	var ip_dups = {};

	//compatibility for firefox and chrome
	var RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection || window.msRTCPeerConnection;
	var useWebKit = !!window.webkitRTCPeerConnection;

	//minimal requirements for data connection
	var mediaConstraints = {
		optional: [{RtpDataChannels: true}]
	};

	var servers = {iceServers: [{urls: "stun:stun3.l.google.com:19302"},{urls: "stun:stun2.l.google.com:19302"},{urls: "stun:stun.voiparound.com"}]};
	
	//construct a new RTCPeerConnection
	var pc = new RTCPeerConnection(servers, mediaConstraints);

	function handleCandidate(candidate){
		console.log(candidate);
		//match just the IP address
		var ip_regex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/
		var ip_addr = ip_regex.exec(candidate)[1];

		//remove duplicates
		if(ip_dups[ip_addr] === undefined)
			callback(ip_addr);

		ip_dups[ip_addr] = true;
	}

	//listen for candidate events
	pc.onicecandidate = function(ice){

		//skip non-candidate events
		if(ice.candidate)
			handleCandidate(ice.candidate.candidate);
	};

	//create a bogus data channel
	pc.createDataChannel("");

	//create an offer sdp
	pc.createOffer(function(result){

		//trigger the stun server request
		pc.setLocalDescription(result, function(){}, function(){});

	}, function(){});

	//wait for a while to let everything done
	setTimeout(function(){
		//read candidate info from local description
		var lines = pc.localDescription.sdp.split('\n');

		lines.forEach(function(line){
			if(line.indexOf('a=candidate:') === 0)
				handleCandidate(line);
		});
		pc.close(); //to don't send stun keep-alive packets anymore as we used them only for ip address detection
	}, 1000);
}