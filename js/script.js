//Define what happens if the DOM is ready
$(document).ready(function() { 
	fillCanvas();
});

//Fill the canvas
function fillCanvas(){
	var c = document.getElementById("placeholderCanvas");
	if (c.getContext){
		var ctx = c.getContext("2d");
		drawRectangles(ctx);
		drawHeart(ctx,200,200)
	}
}

function drawRectangles(ctx){
	ctx.fillStyle = "rgb(200,0,0)";
	ctx.fillRect(10, 10, 55, 50);
	ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
	ctx.fillRect(30, 30, 55, 50);
}

function drawHeart(ctx,x,y){
    ctx.beginPath();
    ctx.moveTo(x+75,y+40);
    ctx.bezierCurveTo(x+75,y+37,x+70,y+25,x+50,y+25);
    ctx.bezierCurveTo(x+20,y+25,x+20,y+62.5,x+20,y+62.5);
    ctx.bezierCurveTo(x+20,y+80,x+40,y+102,x+75,y+120);
    ctx.bezierCurveTo(x+110,y+102,x+130,y+80,x+130,y+62.5);
    ctx.bezierCurveTo(x+130,y+62.5,x+130,y+25,x+100,y+25);
    ctx.bezierCurveTo(x+85,y+25,x+75,y+37,x+75,y+40);
    ctx.fill();
}