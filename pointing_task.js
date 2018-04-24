// Select all buttons
var buttons = document.querySelectorAll('[id^=\'but\']');
var startButton = document.querySelector('#but-start');

var experiment = [
    [1,11,6,16],
    [20,10,17,7],
	[2,3,4,5],
	[15,14,13,12],
	[20,19,18,17],
	[7,8,9,10],
	[1,16,2,15],
	[11,6,12,5],
	[20,7,19,8],
	[10,17,9,18]
]

var participant = 0; //prompt("Enter Participant ID:", "0"); //id of the participant
// Have to get set according to an input file and the participant id

const REGULAR_EDGE = 0;
const VIRTUAL_EDGE = 1;

var condition = VIRTUAL_EDGE; // virtual edge or not, read from input file

var block = 0; // id of the sequence

//Header of the output file
var outputText = "Part;Cond;Block;Click;Tar_t;Click_t;PosX;PosY;Dist;Succ\n";

// Clicks performed in the actual sequence
var clicksCounter = 0;

// Temporarly saves the last hit for calculating the difference
var lastHit = getActualTime();

var isBetweenBlocks = true;

// Highlite the start button at the beginning
highlightStart();

// Add event listener to body
document.body.addEventListener("click", handleBodyClick);

function handleBodyClick(event) {

	var clickedElement = document.elementFromPoint(event.clientX, event.clientY);

	if(isBetweenBlocks) {

		// If user is currently between 2 experiment blocks, only react to start button
		if(clickedElement == startButton) {
			startButton.classList.remove("start");
			startButton.classList.remove("target");
			isBetweenBlocks = false;
			highlightNextTarget();
		}

	} else {

		writeClickToOutputFile(event.clientX, event.clientY);

		removeOldTarget();

		if(experimentIsFinished()) {
			document.body.removeEventListener("click", handleBodyClick);
			downloadOutputFile();
		} else if(blockIsFinished()) {
			highlightEndButtonOrStartNewBlock();
		} else {
			highlightNextTarget();
		}

	}
	
}

function getSuccessFlagForClickAt(x, y) {

	var targetElement = getCurrentTargetElement();
	var targetRect = targetElement.getBoundingClientRect();

	var xInsideBounds, yInsideBounds;

	if(condition == REGULAR_EDGE || targetElement.id == "but-start") {

		xInsideBounds = x >= targetRect.left && x <= targetRect.right;
		yInsideBounds = y >= targetRect.top && y <= targetRect.bottom;

	} else if(condition == VIRTUAL_EDGE) {

		var extendedButtonId = "ext-" + targetElement.id
		var extendedButtonRect = document.querySelector("#" + extendedButtonId).getBoundingClientRect();

		xInsideBounds = (x >= targetRect.left && x <= targetRect.right) || (x >= extendedButtonRect.left && x <= extendedButtonRect.right);
	 	yInsideBounds = (y >= targetRect.top && y <= targetRect.bottom) || (y >= extendedButtonRect.top && y <= extendedButtonRect.bottom);

	} else {
		// Unkown condition, shouldn't happen
		return "-1"
	}

	if(xInsideBounds && yInsideBounds) {
		return "1";
	} else {
		return "0";
	}
	
}

function getDistanceToTargetCenter(x, y) {

	var targetRect = getCurrentTargetElement().getBoundingClientRect();
	var targetCenterX = targetRect.left + targetRect.width / 2;
	var targetCenterY = targetRect.top + targetRect.height / 2;

	var distanceSquared = (targetCenterX - x) * (targetCenterX - x) + (targetCenterY - y) * (targetCenterY - y);
	var distance = Math.sqrt(distanceSquared);

	return distance;

}

function getCurrentTargetElement() {
	return document.querySelector(".target");
}

function experimentIsFinished() {
	return (block == experiment.length - 1 && blockIsFinished());
}

function blockIsFinished() {
	return (clicksCounter >= experiment[block].length);
}

function startNewBlock() {
	block += 1;
	clicksCounter = 0;
	setTimeout(highlightStart, 2000);
}

function writeClickToOutputFile(x, y) {
	var actualTime = getActualTime();
	var success = getSuccessFlagForClickAt(x, y);
	var distance = getDistanceToTargetCenter(x, y);

    outputText += participant;
    outputText += ";" + condition;
    outputText += ";" + block;
    outputText += ";" + clicksCounter;
	outputText += ";" + actualTime;
	outputText += ";" + lastHit;
	outputText += ";" + x;
	outputText += ";" + y;
    outputText += ";" + distance;
	outputText += ";" + success;
	outputText += "\n";

	lastHit = actualTime;
}

function downloadOutputFile() {
	saveTextAsFile(outputText);
}

// Copied from https://thiscouldbebetter.wordpress.com/2012/12/18/loading-editing-and-saving-a-text-file-in-html5-using-javascrip/
function saveTextAsFile(textToSave) {

    var textToSaveAsBlob = new Blob([textToSave], {type:"text/plain"});
    var textToSaveAsURL = window.URL.createObjectURL(textToSaveAsBlob);
    var fileNameToSaveAs = "pointing_"+participant+".csv";
 
    var downloadLink = document.createElement("a");
    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = "Download File";
    downloadLink.href = textToSaveAsURL;
    downloadLink.onclick = destroyClickedElement;
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
 
    downloadLink.click();
}

// Copied from https://thiscouldbebetter.wordpress.com/2012/12/18/loading-editing-and-saving-a-text-file-in-html5-using-javascrip/
function destroyClickedElement(event) {
    document.body.removeChild(event.target);
}

// Helper functions

function getActualTime(){
    var date = new Date();
    return (date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + ":" + date.getMilliseconds());
}

function removeOldTarget() {
	var oldTarget = document.querySelector(".target");
	if(oldTarget != null) {
		oldTarget.classList.remove("target");
	} else {
		console.log("tried to remove target too many times");
	}
}

// Highlites the next target in the serie
function highlightNextTarget() {
    var buttonId = "but-" + experiment[block][clicksCounter];
    var newTarget = document.querySelector("#" + buttonId);

    newTarget.classList.add("target");
    clicksCounter += 1;
}

function highlightStart() {
	startButton.classList.remove("hide");
    startButton.classList.add("target");
    startButton.classList.add("start");
}


var endButtonHighlighted = false;

function highlightEndButtonOrStartNewBlock() {

	if(!endButtonHighlighted) {
		startButton.classList.add("target");
		endButtonHighlighted = true;	
	} else {
		endButtonHighlighted = false;
		isBetweenBlocks = true;
		startButton.classList.add("hide");
		startNewBlock();
	}

}
