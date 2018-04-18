// Select all buttons
var buttons = document.querySelectorAll(".button");

// Make a random button the first target
var firstTargetIndex = generateRandomNumber(6, true);
buttons[firstTargetIndex].classList.add("target");

var clicksText = "Timestamp,ClickX,ClickY\n";

var numberOfClicksNecessary = 10, numberOfClicks = 0;

// Add click listeners to all buttons
for (var i = 0; i < buttons.length; i++) {

	buttons[i].addEventListener("click", function(event) {

		// If the button is a target, a new target is selected
		if(this.classList.contains("target")) {
			var date = new Date();
			clicksText += (date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + ":" + date.getMilliseconds());
			clicksText += "," + event.clientX;
			clicksText += "," + event.clientY;
			clicksText += "\n";
			this.classList.remove("target");

			if(numberOfClicks == numberOfClicksNecessary) {
				saveTextAsFile(clicksText);
			} else {
				highlightRandomButton(i + 1);
				numberOfClicks += 1;
			}

		}

	});

}

// Copied from https://thiscouldbebetter.wordpress.com/2012/12/18/loading-editing-and-saving-a-text-file-in-html5-using-javascrip/
function saveTextAsFile(textToSave) {

    var textToSaveAsBlob = new Blob([textToSave], {type:"text/plain"});
    var textToSaveAsURL = window.URL.createObjectURL(textToSaveAsBlob);
    var fileNameToSaveAs = "output.csv";
 
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

function highlightRandomButton(indexOfCurrentlySelectedButton) {

	var newIndex = generateRandomNumber(6, false);
	while(newIndex == indexOfCurrentlySelectedButton) {
		newIndex = generateRandomNumber(6, false);
	}

	var buttonId = "top" + newIndex;
	var buttonToHighlight = document.querySelector("#" + buttonId);

	buttonToHighlight.classList.add("target");
}

function generateRandomNumber(max, fromZero) {

	if(fromZero) {
		return Math.floor(Math.random() * max);	
	} else {
		return Math.floor(Math.random() * max) + 1;
	}

}