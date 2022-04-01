// script to create startup information to guide the user

// set an indicator of the step of every hint
var intSteps = 0 

runHints = function() {

   if (intSteps==0) {
     document.getElementById('hints').innerHTML = 'To begin, click on the "AREA OF INTEREST" button, then draw a polygon on the map surrounding a coral reef area of interest. <br>Note that coral reefs areas are highlighted in green.'
     intSteps=1
 } else if (intSteps==1) {
    document.getElementById('hints').innerText = 'Now click on the "ENVIRONMENT" or the "SEA CURRENTS" buttons, and select an environmental layer to visualize on the map.'
    ReefHintVector.setVisible(false)
    intSteps=2
 } else if (intSteps==2) {
   intSteps=3
   document.getElementById('hints').innerHTML = 'If you want to find out more about the functionalities of RECIFS, have a look at the <a href="/tutorial" style="color: greenyellow;">TUTORIAL</a>! <button onclick="runHints()">Close</button>'
 } else if (intSteps==3) {
   document.getElementById('hints').style.display = 'none'
 }
}

// add a layer showing the position of the reefs

var ReefHintVector = new ol.layer.Vector({
   source: new ol.source.Vector({
     url: 'public/backgroundLayers/reef_hint.geojson',
     format: new ol.format.GeoJSON(),
   }),
   style: new ol.style.Style({ 
     fill: new ol.style.Fill({ color: 'rgba(0,255,0,0.6)' }),
   })
 });

map.addLayer(ReefHintVector)
 

// run at start-up of webpage

runHints()