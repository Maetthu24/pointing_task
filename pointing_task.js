// Select all buttons
var buttons = document.querySelectorAll('[id^=\'but\']');
var startButton = document.querySelector('#but-start');

var experiment = [
    [1,2,3],
    [14,12,6,17,18,13],
    [14,19,20,17]
]

var participant = 0; //prompt("Enter Participant ID:", "0"); //id of the participant
// Have to get set according to an input file and the participant id
var condition = 0; // prompt("Enter condition: 0 = screen edge, 1 = extended edge") //screen edge or not, out of input file
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
	console.log("click registered at " + event.clientX + "/" + event.clientY);

	if(isBetweenBlocks) {

		// If user is currently between 2 experiment blocks, only react to start button
		if(clickedElement == startButton) {
			startButton.classList.remove("start");
			startButton.classList.remove("target");
			isBetweenBlocks = false;
			highlightNextTarget();
		}

	} else {

		removeOldTarget();

		writeClickToOutputFile(event.clientX, event.clientY, "1");

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

function writeClickToOutputFile(x, y, success) {
	var actualTime = getActualTime();
    outputText += participant;
    outputText += ";" + condition;
    outputText += ";" + block;
    outputText += ";" + clicksCounter;
	outputText += ";" + actualTime;
	outputText += ";" + lastHit;
	outputText += ";" + x;
	outputText += ";" + y;
    outputText += ";" + "NaN"; // TODO difference between input and target center
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
