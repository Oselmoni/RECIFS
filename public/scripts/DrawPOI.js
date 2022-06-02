///////////////////////////////////////////////////////////////////
/////////////// Add points of interest (POI) /////////////////////
///////////////////////////////////////////////////////////////////
var pointN = 1 // identifier of number of points on map

// add draw point interaction

var POIDraw = new ol.interaction.Draw({
  source: POIsource,
  type: 'Point'
  });

// Set what to do when a point is drawn
POIsource.on('addfeature', function(evt) {

    if  (evt.feature.getProperties().name == undefined) { // if name is undefined --> allow user to insert name , if it is defined (e.g. submission via csv), do nothing
    // pause while typing interaction
    map.removeInteraction(POIDraw)

    // ask for name of variable
    var pointName = prompt("Please choose a name for the point of interest", "PointOfInterest_"+pointN);

    // if cancel button is used: 
    if (pointName === null ) { 
         POIsource.removeFeature(POIsource.getFeatures()[POIsource.getFeatures().length-1]) // remove last feature drawn
    } else {

    // list of forbideen characters in string name
    var spchars = /[ `!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?~]/; 
  
    if (spchars.test(pointName) == true) { // if there are forbidden chars in point name
      alert('Invalid variable name (only letters, numbers and underscore are allowed as characters)')
      POIsource.removeFeature(POIsource.getFeatures()[POIsource.getFeatures().length-1]) // remove last feature drawn
    } else {
      POIsource.getFeatures()[POIsource.getFeatures().length-1].setProperties({'name' : pointName }) // add name to feature
      pointN = pointN + 1 
      document.getElementById('POIstyle').style.display='block' // add display parameters
    }
  }
    map.addInteraction(POIDraw)

    }
}, this);

//// functions to remove an POI by clicking on map

// interaction for POI removal
var POIremove = new ol.interaction.Select({
  layers: [POIvector],
  style :   new ol.style.Style({ // to hide the selected point
    image: new ol.style.Circle({
          radius: 0,
    })
  })
  });

POIremove.on('select', function(evt) {
  if (evt.selected.length==1) {
    POIsource.removeFeature(evt.selected[0])
  }
  });
  
// interaction for highlighting POI to remove on hovering
var POIremovebrowse = new ol.interaction.Select({
  layers: [POIvector],
  condition: ol.events.condition.pointerMove,
  style: new ol.style.Style({ 
          image: new ol.style.Circle({
                radius: 5,
                fill: new ol.style.Fill({color: 'yellow'}),
                stroke: new ol.style.Stroke({color: 'red', width: 3})
          })
        })
});

// interaction for showing a pointer to remove points from the map
var POIremovepointer = new ol.interaction.Draw({
    source : new ol.source.Vector({
    format: new ol.format.GeoJSON()
    }),
    type: 'Point',
    style: new ol.style.Style({ 
      image: new ol.style.RegularShape({
        stroke: new ol.style.Stroke({color: 'red', width: 3}),
        points: 4,
        radius: 10,
        radius2: 0,
        angle: Math.PI / 4,
      }),
    })
})




// set functions activated by buttons for adding/removing POI
var POImode = null // current mode


addPOI = function() {
  drawing=false
    if (POImode!='drawing') { // if it's not drawing... activate draw
      map.addInteraction(POIDraw)
      map.removeInteraction(POIremove)
      map.removeInteraction(POIremovebrowse)
      map.removeInteraction(POIremovepointer)
      map.removeInteraction(AOIPolyDraw)
      POImode = 'drawing'
      document.getElementById('POIaddB').style.backgroundColor = accol
      document.getElementById('POIremB').style.backgroundColor = null
      document.getElementById('drawAOIbutton').style.backgroundColor = null
    } else {
      POImode = null
      map.removeInteraction(POIDraw)
      document.getElementById('POIaddB').style.backgroundColor = secol
    }
}

remPOI = function() {
  drawing=false
  if (POImode!='removing') { // if it's not drawing... activate draw
    map.removeInteraction(POIDraw)
    map.addInteraction(POIremove)
    map.addInteraction(POIremovebrowse)
    map.addInteraction(POIremovepointer)
    map.removeInteraction(AOIPolyDraw)
    POImode = 'removing'
    document.getElementById('drawAOIbutton').style.backgroundColor = null
    document.getElementById('POIremB').style.backgroundColor = accol
    document.getElementById('POIaddB').style.backgroundColor = null
  } else {
    POImode = null
    map.removeInteraction(POIremove)
    map.removeInteraction(POIremovebrowse)
    map.removeInteraction(POIremovepointer)
    document.getElementById('POIremB').style.backgroundColor = secol
  }
}

remALLPOI = function() {
  map.removeInteraction(POIDraw)
  map.removeInteraction(POIremove)
  map.removeInteraction(POIremovebrowse)
  map.removeInteraction(POIremovepointer)
  document.getElementById('POIremB').style.backgroundColor = secol
  document.getElementById('POIaddB').style.backgroundColor = secol

  POIsource.clear()}


openMODALupload = function() {
  document.getElementById("uploadMOD").style.display="block"
  map.removeInteraction(POIDraw)
  map.removeInteraction(POIremove)
  map.removeInteraction(POIremovebrowse)  
  map.removeInteraction(POIremovepointer)
  document.getElementById('POIremB').style.backgroundColor = secol
  document.getElementById('POIaddB').style.backgroundColor = secol
}

// function to upload POIs from CSV

 uploadPOIs = function() {

      var inFile = document.getElementById("myFile").files[0];
  
      if (inFile==undefined) {alert('No file selected!') // if no input file: error
    }  else { // else... read the file
      var reader = new FileReader(); // create a file reader 
      reader.onload = (function(reader)
      {
         return function()  { // specify here what to do with input file...
              var contents = reader.result; // get content...
              var lines = contents.split(/\r?\n/)     // split by line...
              var header = lines[0].split(',') // get header elements
        
              // check that required elements are there (ID; LON; LAT)
              if (header.includes('LON')&header.includes('LAT')&header.includes('ID')) { 
              // find columns position for ID, LON and LAT
              const pID = header.indexOf('ID')
              const pLON = header.indexOf('LON')
              const pLAT = header.indexOf('LAT')
              
              // read line by line, and add POIs to map
              for (var i=1; i<lines.length-1; i++) {
                var lineCont = lines[i].split(',') // get content of each line
                // create new POI feature
                var coordPOI = ol.proj.fromLonLat( [Number(lineCont[pLON]), Number(lineCont[pLAT])] )
                var POIn = new ol.Feature({
                  geometry : new ol.geom.Point( coordPOI  ),
                  name : lineCont[pID]
                })
              POIsource.addFeature(POIn)
              }
              
              // close modal
              document.getElementById("uploadMOD").style.display="none"

              } else {
                alert('Format of table is not correct. Make sure that columns are encoded as in the guideline.')
              }

          }
      })(reader);
      reader.readAsText(inFile);
     
      }

    }





