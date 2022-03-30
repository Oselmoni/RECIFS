// script to create startup information to guide the user

// set an indicator of the step of every hint
var intSteps = 0 

runHints = function() {

 if (intSteps==0) {
     document.getElementById('startup').innerText = 'To begin, click on the "AREA OF INTEREST" button, then draw an area surrounding your reefs of interest.'
     intSteps=1
 } else if (intSteps==1) {
    document.getElementById('startup').innerText = 'Now click on the "ENVIRONMENT" or the "SEA CURRENTS", and select an environmental layer to visualize on the map.'
    intSteps=2
 } else {
    document.getElementById('startup').style.display = 'none'
 }
}

// run at start-up of webpage

runHints()