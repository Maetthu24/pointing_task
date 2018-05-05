// Select buttons

var startButton = document.querySelector('#but-start');
var failIndicator = document.querySelector('#fail-indicator');

//--------------------------------------------------------------------------------------------------------------------

// Hard-coded sequences

var demoSequence = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

var sequences = [
    [1, 11, 6, 16], // S1
    [20, 10, 17, 7], // S2
    [2, 3, 4, 5], // S3
    [15, 14, 13, 12], // S4
    [20, 19, 18, 17], // S5
    [7, 8, 9, 10], // S6
    [1, 16, 2, 15], // S7
    [11, 6, 12, 5], // S8
    [20, 7, 19, 8], // S9
    [10, 17, 9, 18] // S10
];

//--------------------------------------------------------------------------------------------------------------------

// Variables

var blockIdStorage = -1;

var conditionCounter = 0;

var outputText = "Part;Cond;Block;Click;Tar_t;Click_t;PosX;PosY;Dist;Succ\n"; //Header of the output file

var lastHit; // Temporarily saves the last hit for calculating the difference

var configuration;

var isBetweenBlocks = true;

var endButtonHighlighted = false;

var participantID;

var participantTrials;

var block = 0;

var clicksCounter = 0; // Clicks performed in the current sequence

const REGULAR_EDGE = "Regular Edge";
const VIRTUAL_EDGE = "Virtual Edge";

var experiment = [];
var condition = [];

//--------------------------------------------------------------------------------------------------------------------

// Load the configuration as soon as the page has loaded
document.addEventListener('DOMContentLoaded', function() {
    fetch("http://localhost:3000/configuration").then(response => response.json()).then((data) => {
        configuration = data;

        // After successfully reading the configuration, query the user for a participant ID and get the according trials
        participantID = getParticipantID();
        participantTrials = getParticipantTrials(participantID);

        setupExperiment();
    })
}, false);

// Get a valid participant id as input
function getParticipantID() {
    var id = prompt("Enter Participant ID between 1 and 10:", "1");
    while (Number.isNaN(parseInt(id)) || id < 1 || id > 10) {
        id = prompt("Please enter a valid Participant ID (between 1 and 10):", "1");
    }
    return id;
}

// Filter the config to only contain trials of the specified participant ID
function getParticipantTrials(id) {
    return configuration.filter(element => {
        return element.Participant_ID === id;
    });
}

function setupExperiment() {
    experiment[0] = demoSequence;
    condition[0] = REGULAR_EDGE;
    alert("The screen reacts on different conditions of touch inputs. Please try out the behaviour of the " +
        "application by touching the highlighted element. Make also a conscious fault to experience " +
        "the behaviour of the application");
    var i;
    for (i = 0; i < participantTrials.length; i++) {
        let sequence = sequences[parseInt(participantTrials[i].Pointing_Sequence) - 1];
        experiment[i + 1] = sequence;
        condition[i + 1] = participantTrials[i].Edge_type;
    }
}

// Add event listener to body
startButton.addEventListener("mouseup", handleStartClick);
document.body.addEventListener("click", handleBodyClick);


function handleStartClick() {
    if(startButton.classList.contains("start")) {
        startButton.classList.remove("start");
        startButton.classList.remove("target");
        isBetweenBlocks = false;
        lastHit = getActualTime();
        highlightNextTarget();
    }
}

function handleBodyClick(event) {

    var clickedElement = document.elementFromPoint(event.clientX, event.clientY);

    if (!(isBetweenBlocks) && (clickedElement != startButton || clicksCounter >= 1)) {
        writeClickToOutputFile(event.clientX, event.clientY);
        clicksCounter += 1;

        removeOldTarget();

        if (blockIsFinished() && !endButtonHighlighted) {
            highlightEndButton();
        } else if (blockIsFinished()) {
            if (experimentIsFinished()) {
                document.body.removeEventListener("click", handleBodyClick);
                downloadOutputFile();
            } else {
                endButtonHighlighted = false;
                isBetweenBlocks = true;
                startButton.classList.add("hide");
                startNewBlock();
            }
        } else {
            highlightNextTarget();
        }

    }

}


// Highlight the start button at the beginning
highlightStart();

function getSuccessFlagForClickAt(x, y) {

    var targetElement = getCurrentTargetElement();
    var targetRect = targetElement.getBoundingClientRect();

    var xInsideBounds, yInsideBounds;

    if (condition[block] == REGULAR_EDGE || targetElement.id == "but-start") {

        xInsideBounds = x >= targetRect.left && x <= targetRect.right;
        yInsideBounds = y >= targetRect.top && y <= targetRect.bottom;

    } else if (condition[block] == VIRTUAL_EDGE) {

        var extendedButtonId = "ext-" + targetElement.id
        var extendedButtonRect = document.querySelector("#" + extendedButtonId).getBoundingClientRect();

        xInsideBounds = (x >= targetRect.left && x <= targetRect.right) || (x >= extendedButtonRect.left && x <= extendedButtonRect.right);
        yInsideBounds = (y >= targetRect.top && y <= targetRect.bottom) || (y >= extendedButtonRect.top && y <= extendedButtonRect.bottom);

    } else {
        // Unkown condition, shouldn't happen
        return "-1"
    }

	if(xInsideBounds && yInsideBounds) {
	    hideFail();
		return "1";
	} else {
	    failIndicator.classList.remove("hide");
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
    setTimeout(highlightStart, 1500);
}

function writeClickToOutputFile(x, y) {
    var actualTime = getActualTime();
    var success = getSuccessFlagForClickAt(x, y);
    var distance = getDistanceToTargetCenter(x, y);

    outputText += participantID;
    outputText += ";" + condition[block];
    outputText += ";" + block;
    outputText += ";" + (clicksCounter + 1);
    outputText += ";" + lastHit;
    outputText += ";" + actualTime;
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
    var textToSaveAsBlob = new Blob([textToSave], {type: "text/plain"});
    var textToSaveAsURL = window.URL.createObjectURL(textToSaveAsBlob);
    var fileNameToSaveAs = "pointing_" + participantID + ".csv";

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

function getActualTime() {
    var date = new Date();
    return (date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "." + date.getMilliseconds());
}

function removeOldTarget() {
    var oldTarget = document.querySelector(".target");
    if (oldTarget != null) {
        oldTarget.classList.remove("target");
    } else {
        console.log("tried to remove target too many times");
    }
}

// Highlights the next target in the series
function highlightNextTarget() {
    var buttonId = "but-" + experiment[block][clicksCounter];
    var newTarget = document.querySelector("#" + buttonId);
    newTarget.classList.add("target");
}

function highlightStart() {
    startButton.classList.remove("hide");
    startButton.classList.add("target");
    startButton.classList.add("start");
    hideFail();
}

function highlightEndButton() {
    startButton.classList.add("target");
    endButtonHighlighted = true;
}

function hideFail() {
    failIndicator.classList.add("hide");
}
