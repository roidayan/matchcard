/**
	MatchCard by Roi Dayan
**/

//globals
var VERSION = "1.01";

var THEME = "animals2";

//timer to hide preview and selected images that do not match.
var HIDE_TIMER = 1000;
//images extension
var IMG_EXT = ".PNG";

//fieldSize must be even. I need size/2 images.
var ROWS = 6;
var COLS = 5;

var NO=0;
var YES=1;
var PORTRAIT="portrait";
var HORIZONTAL="horizontal";

var field;			//Array field
var fieldSize;		//Array field size == rows*cols
var images;			//Array for images

var play=NO;		//Game in progress
var selected=null;	//First selection
var matchCount=0;	//Matches found
var matched;		//Array for matched images
var timer=0;		//Clock timer
var timerId=null;	//Clock timer id
var sysInfo=null;	//SystemInfo Object

/********************************************/

function init()
{
	fieldSize = ROWS*COLS;
	field = new Array(fieldSize);
	matched = new Array(fieldSize);
	
	//make images preload
	images=new Array(fieldSize/2);
	for (var n=0; n<=fieldSize/2; n++)
	{
		images[n] = new Image();
		images[n].src = "images/"+THEME+"/image"+n+IMG_EXT;
	}

	fillField();
	drawField();
//	outScreen(HORIZONTAL);
	initPhone();
	document.getElementById('header').style.display = "none";
	document.getElementById('field').style.display = "inline";
}

//init phone settings
function initPhone()
{
	window.menu.hideSoftkeys();
	//getDisplayOrientation();
	setInterval("getDisplayOrientation()",500);
	
	// Obtain the SystemInfo object
    try {
        sysInfo = document.embeds[0];
    } catch (ex) {
        alert("SystemInfo object cannot be found.");
        return;
    }

}

// Display Information
function getDisplayOrientation()
{
    //if (widget.isrotationsupported)

	// Change the screen orientation
	//widget.setDisplayLanscape();

	var h = window.screen.height;
	var w = window.screen.width;
	
	if (h > w)
		outScreen(PORTRAIT);
  	else
		outScreen(HORIZONTAL);
}

//Vibration
function vbr(duration,intensity) {
	if (sysInfo==null)
		return;
	durationvalue = Number(duration);
	intensityvalue = Number(intensity);
	sysInfo.startvibra(durationvalue, intensityvalue);
}
function vbrbasic() {
	if (sysInfo==null)
		return;
	sysInfo.startvibra(18,10);
}

//fill field with available values 1 - fieldSize/2
function fillField()
{
	for (var n=1; n<=fieldSize; n++)
		field[n-1]=Math.floor(n/2+0.5);
}

function swapFields(a,b)
{
	var tmp=field[a];
	field[a]=field[b];
	field[b]=tmp;
}

//Scramble field values
function scrambleField()
{
	for (var n=0; n<fieldSize; n++)
		swapFields(Math.floor(Math.random()*fieldSize),n);
}

//Output field line images
function drawLine(row)
{
	var table = document.getElementById("table");
	var r = table.insertRow(0);
	//var r = document.getElementById("field");
	var c,i;
	for (var n=row*COLS; n<(row+1)*COLS; n++)
	{
		c = r.insertCell(0);
		//c.innerHTML = "<img onclick=\"imageClick('"+n+"');\" id=\"image"+n+"\" src=\""+images[0].src+"\"/>";
		i = new Image();
		i.src = images[0].src;
		i.id = "image"+n;
		//i.setAttribute("class","image");
		i.className = "image";
		//i.onclick = new Function("imageClick("+n+");");
		i.setAttribute("onclick","imageClick("+n+");");
		c.appendChild(i);
		//r.appendChild(i);
	}
	//r.appendChild(document.createElement("tr"));
}

//Output field images
function drawField()
{
	for (var n=0; n<ROWS; n++)
		drawLine(n);
}

//Remove field images
function remField()
{
	var table = document.getElementById("table");
	//table.removeChild(table.firstChild);
	for (var n=0; n<ROWS; n++)
		table.deleteRow(0);
	//Dont forget to call redraw somewhere.
}

//Start a new game
function playGame()
{
	play=NO;
	vbrbasic();
	resetField();
	scrambleField();
	resetMatched();
	timer=0;
	updateTimer();
	clearTimeout(timerId);
	previewField(1);
}

//Reset matched images
function resetMatched()
{
	matchCount=0;
	for (var n=0; n<fieldSize; n++)
		matched[n]=NO;
}

//Show matched images
function showMatched()
{
	for (var n=0; n<fieldSize; n++)
		if (matched[n]==YES)
			showImage(n);
}

//Update clock timer
function updateTimer()
{
	timer++;
	min = Math.floor(timer/60);
	sec = timer-(min*60);
	if (sec < 10)
		sec = '0'+sec;
	document.getElementById('timer').innerHTML = min+":"+sec;
	clearTimeout(timerId);
	timerId = setTimeout("updateTimer()",1000);
}

//Pause game
function pauseGame()
{
	play=NO;
	clearTimeout(timerId);
}

//Resume game
function resumeGame()
{
	if (timer==0)
		return;
	play=YES;
	updateTimer();
}

//Hide all images
function resetField()
{
	for (var n=0; n<fieldSize; n++)
		hideImage(n);
}

//Get image object
function getImage(p)
{
	//return document.getElementById("image"+p);
	return document.images["image"+p];
}

//Show an image
function showImage(p)
{
	getImage(p).src = images[field[p]].src;
}

//Hide an image
function hideImage(p)
{
	getImage(p).src = images[0].src;
}

//Get filename of image in position, not including extension
function fnImage(p)
{
	var img = getImage(p);
	var x = img.src.split('/');
	return x[x.length-1].split('.')[0];
}

//Preview field images
function previewField(s)
{
	for (var n=0; n<fieldSize; n++)
	{
		if (s)
			showImage(n);
		else
			hideImage(n);
	}

	if (s)
		setTimeout("previewField(0)",HIDE_TIMER);
	else
	{
		play=YES;
		updateTimer();
	}
}

//Hide selected images
function hideSelected(p)
{
	hideImage(selected);
	hideImage(p);
	selected=null;
	play=YES;
}

//Clicking an image
function imageClick(p)
{
	if (play==NO || p==selected || fnImage(p)!="image0")
		return;

	play=NO;
	vbrbasic();
	showImage(p);

	//first selection
	if (selected==null)
	{
		selected=p;
		play=YES;
		return;
	}

	//no match
	if (field[p]!=field[selected])
	{
		setTimeout("hideSelected("+p+")",HIDE_TIMER);
		return;
	}

	matchCount+=2;
	matched[selected]=YES;
	matched[p]=YES;
	selected=null;
	
	//check if finished field
	if (matchCount==fieldSize)
		clearTimeout(timerId);
	else
		play=YES;
}

function outScreen(t)
{
	if (t == document.getElementById("body").className)
		return;

	document.getElementById("body").className = t;
	document.getElementById("main").className = t;
	remField();
	var tmp = ROWS;
	ROWS = COLS;
	COLS = tmp;
	drawField();
	showMatched();
}

function showInfo()
{
	pauseGame();
	vbrbasic();
	document.getElementById('field').style.display = "none";
	document.getElementById('info').style.display = "inline";
}

function closeInfo()
{
	vbrbasic();
	document.getElementById('field').style.display = "inline";
	document.getElementById('info').style.display = "none";
	resumeGame();
}

function about()
{
	document.writeln("MatchCard v"+VERSION+" by Roi Dayan<br><br>Click here to continue.");
}
