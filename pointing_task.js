// Select all buttons
var buttons = document.querySelectorAll(".button");

var experiment = [
	[1,2,3,4,5,6],
	[1,12,6,7],
	[1,7,2,8,3,9]
]

var participant = prompt("Enter Participant ID:", "0"); //id of the participant
// Have to get set according to an input file and the participant id
var condition = 0; //screen edge or not, out of input file
var block = 0; // id of the sequence

//Header of the output file
var clicksText = "Part;Cond;Block;Click;Tar_t;Click_t;PosX;PosY;Dist;Succ\n";

// Clicks performed in the actual sequence
var numberOfClicks = 0;

// Temporarly saves the last hit for calculating the difference
var lastHit = getActualTime();

// Highlite the first target at the beginning
hightlightNextTarget();

// Add click listeners to all buttons
for (var i = 0; i < buttons.length; i++) {

	buttons[i].addEventListener("click", function(event) {

		// If the button is a target, a new target is selected
		if(this.classList.contains("target")) {
			var actualDate = getActualTime()
            clicksText += participant;
            clicksText += ";" + condition;
            clicksText += ";" + block;
            clicksText += ";" + numberOfClicks;
			clicksText += ";" + actualDate;
			clicksText += ";" + lastHit;
			clicksText += ";" + event.clientX;
			clicksText += ";" + event.clientY;
            clicksText += ";" + "NaN"; // TODO difference between input and target center
			clicksText += ";" + "1";
			clicksText += "\n";
			this.classList.remove("target");
			lastHit = getActualTime();

			// Download File at the end of the programm
			if(numberOfClicks >= experiment[block].length) {
				if((block + 1) >= experiment.length){
                    saveTextAsFile(clicksText);
				}
				else{
				    // start new sequence
					block += 1;
					numberOfClicks = 0;
                    hightlightNextTarget();
				}
			} else {
				hightlightNextTarget();
			}
		}
	});
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

function getActualTime(){
    var date = new Date();
    return (date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + ":" + date.getMilliseconds());
}

// Copied from https://thiscouldbebetter.wordpress.com/2012/12/18/loading-editing-and-saving-a-text-file-in-html5-using-javascrip/
function destroyClickedElement(event) {
    document.body.removeChild(event.target);
}

// Helper functions

// Highlites the next target in the serie
function hightlightNextTarget(){

    var buttonId = "but" + experiment[block][numberOfClicks];
    var buttonToHighlight = document.querySelector("#" + buttonId);

    buttonToHighlight.classList.add("target");
    numberOfClicks += 1;
}