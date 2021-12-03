///////////////////////////////////////////////////////////////////
/////////////// Map layers //////////////////////////////////////
///////////////////////////////////////////////////////////////////

// set page colors
var txtcol = 'white' // txt color
var bgcol = '#a3b3e6' // background color
var secol = '#0f497e' // secondary color
var accol = 'green' // activation color

// function to convert colored pixels to greyscale (raster)

function greyscaleSAT(context) {var canvas = context.canvas;
var width = canvas.width;
var height = canvas.height;var imageData = context.getImageData(0, 0, width, height);
var data = imageData.data;for(i=0; i<data.length; i += 4){
 var r = data[i];
 var g = data[i + 1];
 var b = data[i + 2];
 // CIE luminance for the RGB
 var v = 0.3 * r + 0.1 * g + 1* b;
 // Show white color instead of black color while loading new tiles:
 if(v === 0.0)
  v=255.0;  
 data[i+0] = v; // Red
 data[i+1] = v; // Green
 data[i+2] = v; // Blue
 data[i+3] = 255; // Alpha
}context.putImageData(imageData,0,0);

}

// function to convert colored pixels to greyscale (osm)

function greyscaleOSM(context) {var canvas = context.canvas;
var width = canvas.width;
var height = canvas.height;var imageData = context.getImageData(0, 0, width, height);
var data = imageData.data;for(i=0; i<data.length; i += 4){
 var r = data[i];
 var g = data[i + 1];
 var b = data[i + 2];
 // CIE luminance for the RGB
 var v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    // Show white color instead of black color while loading new tiles:
 if(v === 0.0)
  v=255.0;  
 data[i+0] = v; // Red
 data[i+1] = v; // Green
 data[i+2] = v; // Blue
 data[i+3] = 255; // Alpha
}context.putImageData(imageData,0,0);

}

// background map: create sources

var OSMsource = new ol.source.OSM({
  attributionsCollapsible : false,
  attributions: '© '+'<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors | <a href="https://data.unep-wcmc.org/datasets/1" target="_blank">UNDP-WCMC</a>'
})

var bgmap = new ol.layer.Tile({
  source: OSMsource
})




// polygons of area of interest

var AOIsource = new ol.source.Vector({
  format: new ol.format.GeoJSON(),
  });
  
var AOIvector = new ol.layer.Vector({
  source: AOIsource ,
  style: new ol.style.Style({ 
    fill: new ol.style.Fill({ color: 'rgba(0,0,0,0)' }),
    stroke: new ol.style.Stroke({ color: 'rgba(255,255,255,0.5)', width: 3 })
  })
  }); 


// points of interest (points added by client)

var POIsource = new ol.source.Vector({
  format: new ol.format.GeoJSON(),
  });
  
var POIvector = new ol.layer.Vector({
  source: POIsource ,
  style : new ol.style.Style({ 
    image: new ol.style.Circle({
          radius: 5,
          fill: new ol.style.Fill({color: 'purple'}),
          stroke: new ol.style.Stroke({color: 'white', width: 3})
    })
  })
  }); 


  

// function to change background map

makebg = function() {

if (document.getElementById('bgid').value == 'osm') {
  bgmap.setVisible(true)
  LandLayer.setVisible(false)
  BGReefsLayer.setVisible(false)
  bgmap.setSource(OSMsource)
  if (document.getElementById('bggsid').checked) {
    bgmap.on('postcompose', function(event) {greyscaleOSM(event.context)})
} else { 
  bgmap.removeEventListener("postcompose", function(event) {greyscaleOSM(event.context)});
 }

} else if (document.getElementById('bgid').value == 'shp')  {
  bgmap.setVisible(false)
  LandLayer.setVisible(true)
  BGReefsLayer.setVisible(false)
  if (document.getElementById('bggsid').checked) {
    bgmap.removeEventListener("postcompose", function(event) {greyscaleOSM(event.context)});
  } 
} else if (document.getElementById('bgid').value == 'ree')  {
  bgmap.setVisible(false)
  LandLayer.setVisible(true)
  BGReefsLayer.setVisible(true)
  if (document.getElementById('bggsid').checked) {
    bgmap.removeEventListener("postcompose", function(event) {greyscaleOSM(event.context)});
  } 
} 



}


// source of reef vector

var reefsSource = new ol.source.Vector({
  format: new ol.format.GeoJSON(),
 });


// create reef vector from source
var reefs = new ol.layer.Vector({
  source: reefsSource ,
  style :  function(feature) {
    const col = feature.getProperties().col;

    // adaptive radius: following rapport between width of map (in pixels) and extent of map (meters)
    var extents =   map.getView().calculateExtent(map.getSize()) // this gives extent
    var e= extents[2]-extents[0] // extent long
    var width = document.getElementById('map').clientWidth // this gives the # of pixels
    var rad = (2500*width)/e // radius should always correspond 2500 m 

    if (rad<3) {rad=3} // if less than 3 pixels-> stop
 
    return new ol.style.Style({ 
          image: new ol.style.Circle({
                radius: rad,
                fill: new ol.style.Fill({color: col})
          })
        })
  }
});

// create vector for Sea Current arrows data (LOW RES)

var SCsourceLR = new ol.source.Vector({
 });
 
 var SCvectorLR = new ol.layer.Vector({
  source: SCsourceLR ,
  style :  function(feature) {
    const col = feature.getProperties().col;
 
  return new ol.style.Style({ 
    stroke: new ol.style.Stroke({ color: col, width: 3 })
  })
  }
});


// create vector for Sea Current arrows data (HIGH RES)

var SCsourceHR = new ol.source.Vector({
});

var SCvectorHR = new ol.layer.Vector({
 source: SCsourceHR ,
 style :  function(feature) {
   const col = feature.getProperties().col;

 return new ol.style.Style({ 
   stroke: new ol.style.Stroke({ color: col, width: 2.5 })
 })
 }
});

SCvectorHR.setVisible(false)


// function to modify transparency of reef layer 
SetReefTransparency = function() {
    var reeftra = document.getElementById('reefTRA').value
    if (reeftra<0|reeftra>100) {alert("Opacity must be comprised between 0% and 100%")
    document.getElementById('reefTRA').value=100}
    reefs.setProperties({opacity: reeftra/100})
}

// function to modify transparency of reef layer 
SetSCTransparency = function() {
  var sctra = document.getElementById('scTRA').value
  if (sctra<0|sctra>100) {alert("Opacity must be comprised between 0% and 100%")
  document.getElementById('scTRA').value=100}
  SCvectorHR.setProperties({opacity: sctra/100})
  SCvectorLR.setProperties({opacity: sctra/100})
}


var LandLayer = new ol.layer.Vector({
  visible: false,
  source: new ol.source.Vector({
    url: 'public/backgroundLayers/worldland_naturalearthdata.geojson',
    format: new ol.format.GeoJSON(),
    attributions: '© '+'<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors | <a href="https://data.unep-wcmc.org/datasets/1" target="_blank">UNDP-WCMC</a>'
  }),
  style: new ol.style.Style({ 
    fill: new ol.style.Fill({ color: 'rgba(227,227,227,1)' }),
  })
});

var BGReefsLayer = new ol.layer.Vector({
  visible: false,
  source: new ol.source.Vector({
    url: 'public/backgroundLayers/reefs_WW.geojson',
    format: new ol.format.GeoJSON(),
  }),
  style: new ol.style.Style({ 
    fill: new ol.style.Fill({ color: 'rgba(20,20,20,1)' }),
  })
});


// create the map object

var map = new ol.Map({
  controls: ol.control.defaults().extend([new ol.control.ScaleLine({units: "metric", minWidth:200})]), // scaleline 
  target: 'map',
  layers: [
    bgmap, LandLayer, BGReefsLayer, SCvectorLR, SCvectorHR, reefs, AOIvector, POIvector
  ],
  view: new ol.View({
    center: ol.proj.fromLonLat([180, 0]),
    zoom: 3  })
  });





var resSC = 'low'
map.on('moveend', function(e) {
  var Zoom = map.getView().getZoom();

  if (Zoom>=7&resSC=='low') {
    SCvectorLR.setVisible(false)
    SCvectorHR.setVisible(true)
    resSC='high'
  } 
  if (Zoom<7&resSC=='high') {
    SCvectorLR.setVisible(true)
    SCvectorHR.setVisible(false)
    resSC='low'
  }
});

///////////////////////////////////////////////////////////////////
/////////////// Load variables metadata       /////////////////////
///////////////////////////////////////////////////////////////////

var metaVAR = JSON.parse(metaVAR)
var metaVARadv = JSON.parse(metaVARadv)
var metaSTAT = JSON.parse(metaSTAT)

var evar = 'SST_me' // environmental variable currently plotted
var dataR // data arriving from server
var dataRadv // data arriving from server (advanced version)

///////////////////////////////////////////////////////////////////
/////////////// Write/update layers list              ////////////
///////////////////////////////////////////////////////////////////



// function to add or update the layer list
addLayersList = function(evar) {
  
  // retrieve HTML object of layer list
  var layerslist = document.getElementById('layerlist')

  // Remove rows if already present
  layerslist.innerHTML=''

  // retrieve list of environmental conditions 
  var listEC= Object.keys(metaVAR)
 
  // add one row for every env variable: for every variable, the row displays two statistics (e.g. mean and st. dev.) + and information button + an export button
  listEC.forEach(function(item) {

    // create row
    const nrow = document.createElement('tr')
    nrow.className = 'ENVrow'
    // find statistics available for current environmental condition
    var stats = metaVAR[item].varSTATS.split(',')
    
    // create a button for every statistic
    stats.forEach(function(stat) {
        const statid = stat.split('_')[1] // id of the stat
        var statele = document.createElement('td')
        const statbut = document.createElement('button')
        statbut.innerText = metaSTAT[statid].statNAMELL
        statbut.onclick = function() {
          addReefs(stat, dataR) } 
        if (stat==evar) {statbut.style.backgroundColor = accol}
        statbut.className = 'ENVstatB'
        statele.appendChild(statbut)
        statele.className = 'ENVele'
        nrow.appendChild(statele)
    })
    
    // add button for information
    var varinfoele = document.createElement('td')
    var varinfobut = document.createElement('button')
    varinfobut.innerText='i'
    varinfobut.className = 'ENVinfoB'
    varinfoele.appendChild(varinfobut) 
    varinfobut.onclick = function() { promptInfo(item) } 
    varinfoele.className = 'ENVele'
    nrow.appendChild(varinfoele)

    // add element for variable name
    const varname = document.createElement('td')
    varname.innerText = metaVAR[item].varNAMELL
    varname.className = 'ENVele'
    nrow.appendChild(varname)

    // add row to layerlist
    layerslist.appendChild(nrow)
    
  

  }) 
}

// function to prompt information about a variable
promptInfo = function(envar) {

  // retireve name of the variable
  const Evar1 = envar.split('_')[0]

  // open modal with info on variable
  document.getElementById('infoMOD').style.display = 'block'
  console.log(Evar1)

  // set title of modal as name of the variable
 document.getElementById('infoVARname').innerHTML = metaVAR[Evar1].varNAMELL

 // set text content of modal  with information on variable
 document.getElementById('infoVARtxt').innerHTML = metaVAR[Evar1].varDescription+' '+metaVAR[Evar1].varVERSIONs+
 '<br>Generated using data from: '+metaVAR[Evar1].varSource+'<br>Link: <a href="'+metaVAR[Evar1].varLINK+'" target="_blank" style="color: yellow">'+metaVAR[Evar1].varLINK+'</a>'+
 '<br>Identifier original variable: '+metaVAR[Evar1].varDatasetID

}


///////////////////////////////////////////////////////////////////
/////////////// Select area of interest (AOI) /////////////////////
///////////////////////////////////////////////////////////////////

// Create draw interaction 

var AOIPolyDraw = new ol.interaction.Draw({
    source: AOIsource,
    type: 'Polygon'
    });

// Event at end of drawing interaction : send request, handle response

AOIPolyDraw.on('drawend', function(evt) {
      drawing=false
      AOIsource.clear()
      map.removeInteraction(AOIPolyDraw);
      document.getElementById('drawAOIbutton').style.backgroundColor = secol
      
      var AOI = evt.feature // Area of Interest
      // // find geometry of AOI, convert projection and store in AOIcoord object
      var AOIcoord = AOI.getGeometry().transform('EPSG:3857', 'EPSG:4326').flatCoordinates
      
      // check if area is very large, send warning
      if (AOI.getGeometry().getArea()>200) {alert('You selected a large area. Computations might be slow!')}


    if (mode=='standard') {
      document.body.style.cursor = 'progress';
      
      
      // send post request to server 
      $.ajax({
        type:'POST',
        dataType: 'text',
        url:'/AOI',
        data: JSON.stringify({'AOIcoord': AOIcoord }),
        success: function(data){
          document.body.style.cursor = 'auto';
          var fromServer = JSON.parse(data)
          if (fromServer.Error == 'none') {
            dataR=fromServer.ROutput
            addReefs(evar, dataR)
          } else {alert(fromServer.Error)}
        }
      })
    
    // restore original projection
    AOI.getGeometry().transform('EPSG:4326', 'EPSG:3857').flatCoordinates

    } else {
      advancedPOST(AOI)
    }

    if (firstSC==false) {
      var AOIcoord = AOI.getGeometry().transform('EPSG:3857', 'EPSG:4326').flatCoordinates
      postSC(AOI)
    }
      
    // every time AOI is modified, custom download lists are cleared
    dwnLayersLIST.custom = []
    customLIST = {}
    customN = 0

  }, this);

// function triggered by the button to draw AOI

var drawing = false

drawAOIpoly = function() {
      if (drawing==false) { // if interaction is not activate -> activate it!
      drawing=true
      map.addInteraction(AOIPolyDraw);
      document.getElementById('drawAOIbutton').style.backgroundColor = accol
      } else {
      drawing=false
      document.getElementById('drawAOIbutton').style.backgroundColor = secol
      map.removeInteraction(AOIPolyDraw)
      }
      // make sure that all the interaction of POIs are turned off
      POImode=null
      map.removeInteraction(POIDraw)
      document.getElementById('POIaddB').style.backgroundColor =  secol
      map.removeInteraction(POIremove)
      map.removeInteraction(POIremovebrowse)
      map.removeInteraction(POIremovepointer)
      document.getElementById('POIremB').style.backgroundColor = secol
      }


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
      document.getElementById('POIremB').style.backgroundColor = secol
      document.getElementById('drawAOIbutton').style.backgroundColor = secol
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
    document.getElementById('drawAOIbutton').style.backgroundColor = secol
    document.getElementById('POIremB').style.backgroundColor = accol
    document.getElementById('POIaddB').style.backgroundColor = secol
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






///////////////////////////////////////////////////////////////////
/////////////// Add reefs to the map (standard v.) ////////////////
///////////////////////////////////////////////////////////////////

// function to add reefs to the map
var mode = 'standard' // current computation mode (standard or advanced)

addReefs = function(nevar, data) {

  evar=nevar





  // find component of variable (environmental variable + statistic) for legend
  evar1 = evar.split('_')[0] // find first part of variable id: environmental variable
  evar2 = evar.split('_')[1] // find second part of variable id: statistic applied

  // add reefs to map 

  reefsSource.clear()      // clear source

 for (var i=0; i<data.features.length; i++) {

     var reef = new ol.Feature({
         geometry: new ol.geom.Point(ol.proj.fromLonLat(data.features[i].geometry.coordinates)),
         name: data.features[i].properties.id,
         val : data.features[i].properties.variables[evar],
         col : ol.color.asArray(data.features[i].properties.colorscale[evar]),
       })  

     reefsSource.addFeature(reef) // add to source 
 
 }

// update legend
document.getElementById('legend').style.display = 'block'

var width = document.getElementById('legendplot').clientWidth // this gives the # of pixels
var height = document.getElementById('legendplot').clientHeight // this gives the # of pixels

document.getElementById('legendtitle').innerHTML = metaVAR[evar1].varLEGEND+' - '+metaSTAT[evar2].statLEGEND
makelegend(data.meta.colscale, data.meta.colscaleBRKS[evar], width, height, 18,4,10   )

// update layerlist
addLayersList(evar)

// update layerlist of download window
updateLayerListDWN()

// add panels
document.getElementById('topBUTsc').disabled=false
document.getElementById('topBUTenv').disabled=false
document.getElementById('topBUTdwn').disabled=false
document.getElementById('transppan').style.display='block'
document.getElementById('modepanel').style.display='block'
document.getElementById('Layerpan').style.display='block'


}


////////////////////////////////////////////////////////////////////////
/////  Function to compute a colorscale legend   //////////////////////
////////////////////////////////////////////////////////////////////////

makelegend = function(cols, ltext, lwidth, lheight, fontsize, px, py) {

  // get height of legend txt
  var LTH = document.getElementById('legendtitle').clientHeight

  // set height of legend plot
  document.getElementById('legendplot').style.height = document.getElementById('legend').clientHeight-LTH+'px'

  var lheight = document.getElementById('legend').clientHeight-LTH

  // set legend checkbox as checked
  document.getElementById('cblegend').checked = true

  var nsteps = cols.length+1
  
  var div = d3.select("#legendplot") // get div
  
  // remove children (already loaded legend, if any)
  document.getElementById('legendplot').innerHTML = ''  
  
  var dy = (lheight-py*2)/nsteps // height of each box

  // create new legend
  var svg = div.append('svg')
      .attr('width', lwidth)
      .attr('height', lheight)
      .attr('id', 'legendSVG')

  
  
  // add boxes gradient
  var ipy = py // iterative padding variable
  for (i in cols) {
    svg.append('rect')
    .attr('width', (lwidth-px*2)/2)
    .attr('height', dy)
    .attr('y',ipy)
    .attr('x',px)
    .attr('fill', cols[i])
    ipy=ipy+dy
  }

  // add missing values box
  svg.append('rect')
  .attr('width', (lwidth-px*2)/2)
  .attr('height', dy)
  .attr('y',ipy)
  .attr('x',px)
  .attr('fill', '#8c8c8c')
  .attr('stroke', 'black')
  .attr('stroke-width', '1')
  ipy=ipy+dy 

   // add frame
   svg.append('rect')
   .attr('stroke', 'black')
   .attr('stroke-width', '1')
   .attr('fill-opacity', '0')
       .attr('y', py)
       .attr('x', px)
       .attr('width', (lwidth-px*2)/2)
       .attr('height', lheight-(py*2))

  // add text 
  
  var ipy = py+(dy/2) // iterative padding variable
  for (i in ltext) {
    svg.append('line')
    .attr('x1', lwidth/2)
    .attr('x2', (lwidth/2)+10)
    .attr('y1', ipy)
    .attr('y2', ipy)
    .attr('stroke', 'black')
    .attr('stroke-width', '3')
  
    svg.append('text')
    .attr('x', (lwidth/2)+15)
    .attr('y', ipy+fontsize/4)
    .text(ltext[i])
    .attr('font-size', fontsize)
    ipy=ipy+(dy)
  }


  // add text for missing value

  svg.append('line')
    .attr('x1', lwidth/2)
    .attr('x2', (lwidth/2)+10)
    .attr('y1', ipy)
    .attr('y2', ipy)
    .attr('stroke', 'black')
    .attr('stroke-width', '3')
  
  svg.append('text')
    .attr('x', (lwidth/2)+15)
    .attr('y', ipy+fontsize/4)
    .text('NA')
    .attr('font-size', fontsize)
  
  
  }
  

// function to hide/unhide legend

hidelegend = function() {
  
  if (document.getElementById('cblegend').checked == true) {
    document.getElementById('legend').style.display = 'block'
   } else {
    document.getElementById('legend').style.display = 'none'
    }
}

////////////////////////////////////////////////////////////////////////
/////  Functions to switch between standard to advanced mode   /////////
////////////////////////////////////////////////////////////////////////

STMOD = function() {

  document.getElementById('stmbutton').style.backgroundColor=accol
  document.getElementById('ambutton').style.backgroundColor=secol
  document.getElementById('layerlist').style.display='block'
  document.getElementById('advancedpanel').style.display='none'

  mode='standard'

}

var firstAdv = true //variable to check if first time running advanced mode

ADMOD = function() {

  document.getElementById('stmbutton').style.backgroundColor=secol
  document.getElementById('ambutton').style.backgroundColor=accol
  document.getElementById('layerlist').style.display='none'
  document.getElementById('advancedpanel').style.display='block'

  mode='advanced'

  if (firstAdv==true) {
    firstAdv = false

    document.getElementById('advSELVAR').selectedIndex=0
    tempVSbuff()


  }

}
 

////////////////////////////////////////////////////////////////////////
/////  Functions to set advanced mode requests    //////////////////////
////////////////////////////////////////////////////////////////////////

var selvar = document.getElementById('advSELVAR')

// add options to select variable based metadata
Object.keys(metaVARadv).forEach(function(item) {
  nop = document.createElement('option')
  nop.innerText = metaVAR[item].varNAMELL
  nop.id = item
  selvar.appendChild(nop)
})

selvar.onchange = function() {
  tempVSbuff()
}

// function to show menu for temporal vs buffer mode

tempVSbuff = function() {
  // identify selected option
  var selopt = document.getElementById('advSELVAR').selectedOptions[0].id

  if (metaVARadv[selopt].typeVAR=='buffer') {
    // activate buffer menu, de-activate temporal menu
    document.getElementById('advBUF').style.display = 'block'
    document.getElementById('advTIME').style.display = 'none'
    // add buffer options 

    var advSELbuf = document.getElementById('advSELbuf')
    advSELbuf.innerHTML=''
    metaVARadv[selopt].allvars.forEach(function(item) {
      nop = document.createElement('option')
      nop.innerText = item.slice(1,8)
      nop.id = item
      advSELbuf.appendChild(nop)
    })

  } else {
     // activate temporal menu, de-activate buffer menu
    document.getElementById('advTIME').style.display = 'block'
    document.getElementById('advBUF').style.display = 'none'

    // find years available for variable of interest from metadata
    var sy = Number(metaVAR[selopt].varTime.slice(0,4)) // start year
    var ey = Number(metaVAR[selopt].varTime.slice(5,9)) // end year

    // create one option for every year
    var advSELsy = document.getElementById('advSELsy')
    var advSELey = document.getElementById('advSELey')

    advSELsy.innerHTML=''
    advSELey.innerHTML=''

    for (var i = sy; i <= ey; i++) {
        nopS = document.createElement('option')
        nopS.innerText = String(i)
        nopS.id = 'S'+String(i)
        advSELsy.appendChild(nopS)
        nopE = document.createElement('option')
        nopE.innerText = String(i)
        nopE.id = 'E'+String(i)
        advSELsy.appendChild(nopE)
        advSELey.appendChild(nopE)
    }

    // set first year and last year a defeault
    advSELsy.selectedIndex = 0
    advSELey.selectedIndex = advSELey.options.length-1

 

  }

}

// function to activate selection of single years

var allyearsCB = document.getElementById('allyearsCB')

allyearsCB.onchange = function() { 

  var advSELsy = document.getElementById('advSELsy')
  var advSELey = document.getElementById('advSELey')

  if  (allyearsCB.checked == true) {
    advSELsy.disabled = true
    advSELey.disabled = true
    advSELsy.selectedIndex = 0
    advSELey.selectedIndex = advSELey.options.length-1
  } else {
    advSELsy.disabled = false
    advSELey.disabled = false

  }
}

// function to activate selection of single months

var allmonthsCB = document.getElementById('allmonthsCB')

allmonthsCB.onchange = function() { 

  var monthsCB = document.getElementsByClassName('cbmonths')

  if  (allmonthsCB.checked == true) {
    Object.keys(monthsCB).forEach(function(item) {
      monthsCB[item].disabled=true
      monthsCB[item].checked=true
    })
  } else {
      Object.keys(monthsCB).forEach(function(item) {
        monthsCB[item].disabled=false
     })
  }
}

// functions to activate customization of colorscale

var customizeCSLcb = document.getElementById('customizeCSLcb')
var customizeCSCcb = document.getElementById('customizeCSCcb')

customizeCSLcb.onchange = function() {

  var minCS = document.getElementById('minCS')
  var maxCS = document.getElementById('maxCS')

  minCS.value=''
  maxCS.value=''


  if  (customizeCSLcb.checked == true) {
    minCS.disabled=false
    maxCS.disabled=false
  } else {
    minCS.disabled=true
    maxCS.disabled=true
  }


}

customizeCSCcb.onchange = function() {

  var lowCOL = document.getElementById('lowCOL')
  var midCOL = document.getElementById('midCOL')
  var highCOL = document.getElementById('highCOL')

  lowCOL.value='#5cca3a'
  midCOL.value='#e5b43c'
  highCOL.value='#e93322'

  if  (customizeCSCcb.checked == true) {
    lowCOL.disabled=false    
    midCOL.disabled=false    
    highCOL.disabled=false
  } else {
    lowCOL.disabled=true    
    midCOL.disabled=true    
    highCOL.disabled=true
  }


}

// function to send-receive post request for an advanced variable

advancedPOST = function(AOI) {
  
  // create the empty request object
  var advreqO = {'envvar' : null,
                 'typeVAR' : null,
                 'buffer': null,
                 'time': {
                 'years': {'cb' : null, 'ys': null, 'ye': null},
                 'months' : {'cb': null, 'ms': null}
                         },
                 'fun' : null,    
                 'csLIM' : {'cb': null, 'min': null, 'max': null},
                 'csCOL' : {'cb': null, 'low': null, 'mid': null, 'max':null } ,
                 'AOI': null
                }
  
  // fill request object with form values
  advreqO.envvar = document.getElementById('advSELVAR').selectedOptions[0].id
  advreqO.typeVAR = metaVARadv[advreqO.envvar].typeVAR

  if (advreqO.typeVAR=='buffer') {
    advreqO.buffer = document.getElementById('advSELbuf').selectedOptions[0].id
  } else {
    advreqO.time.years.cb = document.getElementById('allyearsCB').checked
    advreqO.time.years.ys = document.getElementById('advSELsy').selectedOptions[0].id
    advreqO.time.years.ye = document.getElementById('advSELey').selectedOptions[0].id
    
    advreqO.time.months.cb = document.getElementById('allmonthsCB').checked
    
    var monthsCB = document.getElementsByClassName('cbmonths')
  
    var monthsCh = []
    Object.keys(monthsCB).forEach(function(item) {
          if (monthsCB[item].checked==false) {monthsCh.push('0')} else {monthsCh.push('1')}
       })
    advreqO.time.months.ms = monthsCh
  
       // set input checks
    if (Number(advreqO.time.years.ye.substring(1,5))<Number(advreqO.time.years.ys.substring(1,5))) {
      alert('End year can not be before starting year.')
      return
    }
  
    if (advreqO.time.months.ms.join()=='0,0,0,0,0,0,0,0,0,0,0,0')  {
      alert('No months selected.')
      return
    }

  
  }

  advreqO.fun = document.getElementById('advSELfun').value
  
  advreqO.csLIM.cb = document.getElementById('customizeCSLcb').checked
  advreqO.csLIM.min = document.getElementById('minCS').value
  advreqO.csLIM.max = document.getElementById('maxCS').value
  
  // set input checks

  if (advreqO.csLIM.cb==true)  { 
      if (advreqO.csLIM.min==''|advreqO.csLIM.max=='') {
        alert('Invalid colorscale limits! Please enter numbers only, and use point (".") as decimal separator.')
        return
      }
  }


  advreqO.csCOL.cb = document.getElementById('customizeCSCcb').checked
  advreqO.csCOL.low = document.getElementById('lowCOL').value
  advreqO.csCOL.mid = document.getElementById('midCOL').value 
  advreqO.csCOL.max = document.getElementById('highCOL').value

  if (advreqO.csLIM.min>advreqO.csLIM.max) {
    alert('Minimum colorscale limits can not be higher than maximum limit.')
    return
  }

// send post request to server

if (AOI==undefined) {
  var AOI = AOIsource.getFeatures()[0]
  var AOIcoord = AOI.getGeometry().transform('EPSG:3857', 'EPSG:4326').flatCoordinates
  advreqO.AOI = AOIcoord
} else {
  var AOIcoord = AOI.getGeometry().flatCoordinates
  advreqO.AOI = AOIcoord
}

document.body.style.cursor = 'progress';

// send post request to server 
$.ajax({
  type:'POST',
  dataType: 'text',
  url:'/ADV',
  data: JSON.stringify({'ADVreq': advreqO }),
  success: function(data){
    document.body.style.cursor = 'auto';
    var fromServer = JSON.parse(data)
    if (fromServer.Error == 'none') {
      dataRadv=fromServer.ROutput
      evaradv = Object.keys(dataRadv.features[0].properties.variables)[0]
      addReefs(evaradv, dataRadv)
    } else {alert(fromServer.Error)}
  }
})

// restore original projection
AOI.getGeometry().transform('EPSG:4326', 'EPSG:3857').flatCoordinates
}


////////////////////////////////////////////////////////////////////////
/////    Functions to plot sea currents           //////////////////////
////////////////////////////////////////////////////////////////////////


// function to handle changes on checkbox for setting number of months used to compute SC

cbSC =  function() {
  var cb = document.getElementById('custSCcb') // use all months checkbox
  var SCmonthsDIV = document.getElementById('SCmonthsDIV') // div with months checkboxes
  var allmonthsSEL = document.getElementById('SCmonthsSEL') // selection with months

  if (cb.checked==true) {
    SCmonthsDIV.style.display='none'
    allmonthsSEL.disabled=true
  } else {
    SCmonthsDIV.style.display='block'
    allmonthsSEL.disabled=false
  }

}

// run post request to add sea current to the map

var firstSC = true

postSC = function(AOI) {

    if (firstSC==true) {firstSC=false}

    // create empty request object
    var OREQ = { 'AOI': null,
                 'months': null}

    // fill months information on request object

    if  (document.getElementById('custSCcb').checked==true) { // if all months
      OREQ.months='13'  
  } else { // if specific month
    var selmon = document.getElementById('SCmonthsSEL').selectedOptions[0].id
    OREQ.months = selmon.substring(2,4)
  }
  

    // fill AOI of request object
    if (AOI==undefined) {
                  var AOI = AOIsource.getFeatures()[0]
                  var AOIcoord = AOI.getGeometry().transform('EPSG:3857', 'EPSG:4326').flatCoordinates
                  OREQ.AOI = AOIcoord
    } else {
                  var AOIcoord = AOI.getGeometry().flatCoordinates
                  OREQ.AOI = AOIcoord
            }

    document.body.style.cursor = 'progress';
    // send post request to server 
    $.ajax({
      type:'POST',
      dataType: 'text',
      url:'/SC',
      data: JSON.stringify({'SCreq': OREQ }),
      success: function(data){
        document.body.style.cursor = 'auto';
        var fromServer = JSON.parse(data)
        if (fromServer.Error == 'none') {
          dataSC = fromServer
          addCurrents(dataSC)
        } else {alert(fromServer.Error)}
      }
    })

    // restore original projection
    AOI.getGeometry().transform('EPSG:4326', 'EPSG:3857').flatCoordinates

}

// function to add currents to map

var dataSC

addCurrents = function(dataFS) {

  // show visualization options for SC
  document.getElementById('sctrans').style.display = 'block'

  if (dataFS.Alert!='none') {alert(dataFS.Alert)}
  SCsourceHR.clear()
  SCsourceLR.clear()
    // add high resoltion data
      dataFS.Routput.HIGHRES.forEach(function(item) {
        var SC = new ol.Feature({
          geometry: new ol.geom.LineString([ol.proj.fromLonLat(item.COORD[0]), ol.proj.fromLonLat(item.COORD[1])]),
          col : ol.color.asArray(item.col),
        })
        SCsourceHR.addFeature(SC) // add to source 

      })
    // add low resolution data
    dataFS.Routput.LOWRES.forEach(function(item) {
      var SC = new ol.Feature({
        geometry: new ol.geom.LineString([ol.proj.fromLonLat(item.COORD[0]), ol.proj.fromLonLat(item.COORD[1])]),
        col : ol.color.asArray(item.col),
      })
      SCsourceLR.addFeature(SC) // add to source 

    })
    

    // update legend
  document.getElementById('legendSC').style.display = 'block'

  var width = document.getElementById('legendplotSC').clientWidth // this gives the # of pixels
  var height = document.getElementById('legendplotSC').clientHeight // this gives the # of pixels

  document.getElementById('legendtitleSC').innerHTML = dataSC.Ltitle

  makelegendSC(dataSC.colorscale, dataSC.colorscaleBRK, width, height, 18,10,4   )

}



////////////////////////////////////////////////////////////////////////
///  Function to compute a colorscale legend for Sea Current Velocity  /////
////////////////////////////////////////////////////////////////////////

makelegendSC = function(cols, ltext, lwidth, lheight, fontsize, px, py) {

  // check box for sea-current display 
  document.getElementById('cblegendSC').checked = true

  var nsteps = cols.length
  
  var div = d3.select("#legendplotSC") // get div
  
  // remove children (already loaded legend, if any)
  document.getElementById('legendplotSC').innerHTML = ''  
  
  var dx = (lwidth-px*2)/nsteps // width of each box
  var dy = lheight*0.4 // width of each box

  // create new legend
  var svg = div.append('svg')
      .attr('width', lwidth)
      .attr('height', lheight)
      .attr('id', 'legendSVGSC')

  
  // add boxes gradient
  var ipx = px // iterative padding variable
  for (i in cols) {
    svg.append('rect')
    .attr('width', dx)
    .attr('height', dy)
    .attr('y',py)
    .attr('x',ipx)
    .attr('fill', cols[i])
    ipx=ipx+dx
  }

 // add legend frame
 svg.append('rect')
 .attr('stroke', 'black')
 .attr('fill-opacity', '0')
 .attr('stroke-width', '1')
     .attr('y', py)
     .attr('x', px)
     .attr('width', lwidth-(px*2))
     .attr('height', dy )


  // add text 
  var ipx = px+(dx/2) // iterative padding variable
  for (i in ltext) {

    svg.append('line')
    .attr('x1', ipx)
    .attr('x2', ipx)
    .attr('y1', dy+py+10)
    .attr('y2', dy+py)
    .attr('stroke', 'black')
    .attr('stroke-width', '3')
  
    svg.append('text')
    .attr('x', ipx)
    .attr('y', dy+py+10+fontsize)
    .attr('text-anchor', 'middle')
    .text(ltext[i])
    .attr('font-size', fontsize)
    ipx=ipx+(dx)
   }
  
  }
  
  // update legend on resize window
    
window.onresize = function() {
    if (dataSC!=undefined) {
    // update legend
    var width = document.getElementById('legendplotSC').clientWidth // this gives the # of pixels
    var height = document.getElementById('legendplotSC').clientHeight // this gives the # of pixels
    makelegendSC(dataSC.colorscale, dataSC.colorscaleBRK, width, height, 18,10,4   )
  } 

  if (mode=='standard') {
    if (dataR!=undefined) {
    // update legend
    var width = document.getElementById('legendplot').clientWidth // this gives the # of pixels
    var height = document.getElementById('legendplot').clientHeight // this gives the # of pixels
    makelegend(dataR.meta.colscale, dataR.meta.colscaleBRKS[evar], width, height, 18,4,10   )
  } 
  } else if (mode=='advanced') {
    if (dataRadv!=undefined) {
      // update legend
      var width = document.getElementById('legendplot').clientWidth // this gives the # of pixels
      var height = document.getElementById('legendplot').clientHeight // this gives the # of pixels
      makelegend(dataRadv.meta.colscale, dataRadv.meta.colscaleBRKS[evaradv], width, height, 18,4,10   )
    } 
  }
  }


// function to hide/unhide legend SC

hidelegendSC = function() {
  
  if (document.getElementById('cblegendSC').checked == true) {
    document.getElementById('legendSC').style.display = 'block'
   } else {
    document.getElementById('legendSC').style.display = 'none'
    }
}


////////////////////////////////////////////////////////////////////////
/////     EXPORT map as PDF                                  ///////////
////////////////////////////////////////////////////////////////////////

// export as PDF 

var exportOptions = {
  filter: function(element) {
    return element.className ? element.className.indexOf('ol-control') === -1 : true;
  }, bgcolor: 'white'
  };
  
exportPDF = function() {
  

// get width and height of map
var width = document.getElementById('map').clientWidth // this gives the # of pixels
var height = document.getElementById('map').clientHeight
  
document.body.style.cursor = 'progress';
  
var dim = [width, height]
var widthPDF = Math.round(dim[0] * 1); //modify here (1) to increase/lower resolution 
var heightPDF = Math.round(dim[1] * 1);
var size = map.getSize();
var viewResolution = map.getView().getResolution();
  
var scfactor = 2 // scaling factor to determine size of output

var orientation = 'p'
if (width>=height) {orientation='l'}



// set function to perform once when render is completed
map.once('rendercomplete', function() {
    var pdf = new jsPDF(orientation, undefined, [width/scfactor, height/scfactor]);
    domtoimage.toJpeg(map.getViewport(), exportOptions).then(function(dataUrl) {
    
      pdf.addImage(dataUrl, 'JPEG', 0, 0, width/scfactor, height/scfactor); // add map to pdf
      
        if (document.getElementById('cblegend').checked==false&document.getElementById('cblegendSC').checked==false) { // if there are no legends...
          pdf.save('map.pdf'); 
        
        } else { // if there is at least one legend

        // get position of legend elements on map...
        var pmx = document.getElementById('map').getBoundingClientRect().left // padding of map margin on x axis
        var pmy = document.getElementById('map').getBoundingClientRect().top // padding of map on y axis

        // elements of legend...
        var plx = document.getElementById('legend').getBoundingClientRect().left // padding of legend on x axis
        var ply = document.getElementById('legend').getBoundingClientRect().top // paddng of legend on y axis 

        var posLx = plx/scfactor - pmx/scfactor // position of legend in map (x axis)
        var posLy = ply/scfactor - pmy/scfactor // position of legend in map (y axis)

        var LTwidth = document.getElementById('legendtitle').clientWidth/scfactor // width of legend title
        var LTheight = document.getElementById('legendtitle').clientHeight/scfactor // height of legend title

        // elements of legend of sea currents
        var plxSC = document.getElementById('legendSC').getBoundingClientRect().left // padding of legend on x axis
        var plySC = document.getElementById('legendSC').getBoundingClientRect().top // paddng of legend on y axis 

        var posLxSC = plxSC/scfactor - pmx/scfactor // position of legend in map (x axis)
        var posLySC = plySC/scfactor - pmy/scfactor // position of legend in map (y axis)

        var LTwidthSC = document.getElementById('legendtitleSC').clientWidth/scfactor // width of legend title
        var LTheightSC = document.getElementById('legendtitleSC').clientHeight/scfactor // height of legend title
      
        // different types of output, depending if legends are displayed or not      
        if (document.getElementById('cblegend').checked==true&document.getElementById('cblegendSC').checked==false) { // if there is a legend for environmental, but not for SC

          var LPwidth = document.getElementById('legendSVG').clientWidth/scfactor // width of legend plot
          var LPheight = document.getElementById('legendSVG').clientHeight/scfactor // height of legend plot

          domtoimage.toJpeg(document.getElementById('legendtitle'), { "bgcolor": 'white' }) // title
        .then(function (dataUrl) {
          pdf.addImage(dataUrl, 'JPEG', posLx, posLy, LTwidth, LTheight); 
          domtoimage.toJpeg(document.getElementById('legendSVG'), { "bgcolor": 'white' }) // scalebar
        .then(function (dataUrl) {
         pdf.addImage(dataUrl, 'JPEG', posLx, posLy+LTheight,  LPwidth, LPheight ); 
         pdf.save('map.pdf'); 
        });
        }); 
      } else if (document.getElementById('cblegend').checked==false&document.getElementById('cblegendSC').checked==true) { // if there is legend for SC, but not for env

        var LPwidthSC = document.getElementById('legendSVGSC').clientWidth/scfactor // width of legend plot
        var LPheightSC = document.getElementById('legendSVGSC').clientHeight/scfactor // height of legend plot

        domtoimage.toJpeg(document.getElementById('legendtitleSC'), { "bgcolor": 'white' }) // title
        .then(function (dataUrl) {
          pdf.addImage(dataUrl, 'JPEG', posLxSC, posLySC, LTwidthSC, LTheightSC); 
          domtoimage.toJpeg(document.getElementById('legendSVGSC'), { "bgcolor": 'white' }) // scalebar
        .then(function (dataUrl) {
         pdf.addImage(dataUrl, 'JPEG', posLxSC, posLySC+LTheightSC,  LPwidthSC, LPheightSC ); 
         pdf.save('map.pdf'); 
        });
        }); 
      } else if (document.getElementById('cblegend').checked==true&document.getElementById('cblegendSC').checked==true) { // if there is legend for ENV and SC

        var LPwidth = document.getElementById('legendSVG').clientWidth/scfactor // width of legend plot
        var LPheight = document.getElementById('legendSVG').clientHeight/scfactor // height of legend plot
        var LPwidthSC = document.getElementById('legendSVGSC').clientWidth/scfactor // width of legend plot
        var LPheightSC = document.getElementById('legendSVGSC').clientHeight/scfactor // height of legend plot

        domtoimage.toJpeg(document.getElementById('legendtitleSC'), { "bgcolor": 'white' }) // title
        .then(function (dataUrl) {
          pdf.addImage(dataUrl, 'JPEG', posLxSC, posLySC, LTwidthSC, LTheightSC); 
        domtoimage.toJpeg(document.getElementById('legendSVGSC'), { "bgcolor": 'white' }) // scalebar
        .then(function (dataUrl) {
         pdf.addImage(dataUrl, 'JPEG', posLxSC, posLySC+LTheightSC,  LPwidthSC, LPheightSC ); 
         domtoimage.toJpeg(document.getElementById('legendtitle'), { "bgcolor": 'white' }) // title
         .then(function (dataUrl) {
           pdf.addImage(dataUrl, 'JPEG', posLx, posLy, LTwidth, LTheight); 
           domtoimage.toJpeg(document.getElementById('legendSVG'), { "bgcolor": 'white' }) // scalebar
         .then(function (dataUrl) {
          pdf.addImage(dataUrl, 'JPEG', posLx, posLy+LTheight,  LPwidth, LPheight ); 
          pdf.save('map.pdf'); 
         });
         }); 
        });
        });  
      } 
    }
        
      
      // Reset original map size and resolution
      map.setSize(size);
      map.getView().setResolution(viewResolution);
      document.body.style.cursor = 'auto';
    });
  
    
  });

// Render map: set resolution for output 
var printSize = [widthPDF, heightPDF];
map.setSize(printSize);
var scaling = Math.min(widthPDF / size[0], heightPDF / size[1]);
map.getView().setResolution(viewResolution / scaling);

  }
  

////////////////////////////////////////////////////////////////////////
/////     EXPORT map as table                                  ///////////
////////////////////////////////////////////////////////////////////////

// list of layers to be downloaded: layers selected for download are added to this object
var dwnLayersLIST = { 'standard' : [], 'custom' : [] }

// object to store custom variables to be dowloaded
var customLIST = {}
var customN = 0 // Number of custom variable

// function to open the data download window

openDWNwindow = function() {

  // open download modal window
  document.getElementById("downloadMOD").style.display="block"

  // use dwnLayersList to update HTML of layers to be downloaded
  updateDwnList()

}
// function to add or update the list of standard layers on the download window
updateLayerListDWN = function() {
  
  // retrieve HTML object of  layer list
  var DlyrLIST = document.getElementById('DlyrLIST')

  // If this list has alrady been written, nothing to be done...
  if (DlyrLIST.children.length>0) {
  } else {

  // retrieve list of environmental conditions 
  var listEC= Object.keys(metaVAR)
 
  // add one row for every env variable: for every variable, the row displays two statistics (e.g. mean and st. dev.) 
  listEC.forEach(function(item) {
    var stats = metaVAR[item].varSTATS.split(',')
    stats.forEach(function(stat) {
        const statid = stat.split('_')[1] // id of the stat
      // create new entry
        const nentry = document.createElement('option')
        // add name of the entryy
        nentry.innerText = metaVAR[item].varNAMELL+' '+metaSTAT[statid].statNAMELL
        nentry.name = stat
        // add entry to Download layer list
        DlyrLIST.appendChild(nentry)
        })
    })
  }
  
}

// function to update the download list on the download window
updateDwnList = function() {

  // retrieve HTML object with dnw list
  var dwnLIST = document.getElementById('dwnLIST')
  dwnLIST.innerHTML=''

  // add standard variables to list
  dwnLayersLIST.standard.forEach(function(i) {
    const varid = i.split('_')[0] // environmental variable id
    const statid = i.split('_')[1] // environmental statistic id
  
    const optionDW = document.createElement('option') // create option
    optionDW.innerText = metaVAR[varid].varNAMELL + ' ' + metaSTAT[statid].statNAMELL // add description of variable
    optionDW.name = i // add name as identifiers

    dwnLIST.appendChild(optionDW)
  }) 
  
  // add custom variables to list
  dwnLayersLIST.custom.forEach(function(i) {
    
      const optionDW = document.createElement('option') // create option
      optionDW.innerText = customLIST[i].vname // add custom var name
      optionDW.name = i // add id
  
      dwnLIST.appendChild(optionDW)
    }) 

}

// function to add layers from "standard" to "download" list 

addSTANDARDdwnL = function() {

    // retrieve HTML object of list of standard layers available for download
    var DlyrLIST = document.getElementById('DlyrLIST')

    // find number of selected options
    var nopt = DlyrLIST.selectedOptions.length

    // add options to download list
    for (var i=0; i<nopt; i++) {

      const layerS = DlyrLIST.selectedOptions[i].name // identify selected layer

      if (dwnLayersLIST.standard.includes(layerS)==false) { // if layer is not in download list...
        dwnLayersLIST.standard.push(layerS) // ...add it to list!
      }

    }

    updateDwnList() // update html download list
}

// function to add "custom" layer appearing on the map


addCUSTOMdwnL = function() {

  // check if a layer is currently visualized on map
  if (reefsSource.getFeatures().length == 0) {alert('There is no environmental variable loaded on the map.')} else {

  // ask for name of variable
  var cvarNameLL = prompt("Please choose a name for the variable", "CustomVariable_"+customN);

  // list of forbideen characters in string name
  var spchars = /[ `!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?~]/; 

  if (spchars.test(cvarNameLL) == true) { // if there are forbidden chars in var name
    alert('Invalid variable name (only letters, numbers and underscore are allowed as characters)')
  } else { 

    // add variable to list of custom variables

    // create an id
    const cvarID = 'CUST_'+customN

    // create list of values, taken from variable plotted on map
    const varVAL = []
    if (mode == 'standard') {
    dataR.features.forEach(function(item) {
      varVAL.push(item.properties.variables[evar])
    })
    } else {
    dataRadv.features.forEach(function(item) {
        varVAL.push(item.properties.variables[evar])
    }) 
    }
    customLIST[cvarID] = {'vname' : cvarNameLL, vals : varVAL}
    dwnLayersLIST.custom.push(cvarID)
    customN = customN+1
  }
  }
}

// function to remove layers from download list

rmvFROMdwnL = function() {

      // retrieve HTML object of list of standard layers available for download
      var dwnLIST = document.getElementById('dwnLIST')

      // find number of selected options
      var nopt = dwnLIST.selectedOptions.length
  
      // add options to download list
      for (var i=0; i<nopt; i++) {
  
        const layerS = dwnLIST.selectedOptions[i].name // identify selected layer
      
        // if layer is a standard variable...
        if (dwnLayersLIST.standard.includes(layerS)) { 
            const index = dwnLayersLIST.standard.indexOf(layerS); // find position of layer on list
            if (index > -1) { dwnLayersLIST.standard.splice(index, 1);} // remove selected layer
         }

        // if layer is a custom variable...
         if (dwnLayersLIST.custom.includes(layerS)) { // if layer is not in a standard variable...
          const index = dwnLayersLIST.custom.indexOf(layerS); // find position of layer on list
          if (index > -1) { dwnLayersLIST.custom.splice(index, 1);} // remove selected layer
       }
  
      }
  
      updateDwnList() // update html download list


}

// function to run the download of the selected layers, for all the reefs

downloadDATA = function() {

    document.body.style.cursor ='progress'
    // check if download list is not empty
    if (dwnLayersLIST.standard.length+dwnLayersLIST.custom.length==0) {
      alert('There are no variables on the download list!')
    } else {

    //  create CSV content
    
    var csvcontent = ''
    
    // create header
      
    var csvcontent = csvcontent+'ID,LON,LAT' // add head of header
    if (dwnLayersLIST.standard.length>0) {    csvcontent = csvcontent+','+dwnLayersLIST.standard.join(',')  }// add colnames for standard variables
    if (dwnLayersLIST.custom.length>0) { dwnLayersLIST.custom.forEach(function(item) {csvcontent = csvcontent+','+customLIST[item].vname}) }
    csvcontent = csvcontent + '\n' // break line

    for (var i=0; i<dataR.features.length; i++) {

    // add name and coordinates
    csvcontent=csvcontent+
    dataR.features[i].properties.id+','+
    dataR.features[i].geometry.coordinates[0]+','+
    dataR.features[i].geometry.coordinates[1]

    // add standard variables
    dwnLayersLIST.standard.forEach(function(item) {
      var vv = dataR.features[i].properties.variables[item] // value of the variable
      if (vv==null) {vv=''} // if null, leave empty space in csv
      csvcontent = csvcontent + ',' + vv // add value of variable to csv
    })
    
    // add custom variables
    dwnLayersLIST.custom.forEach(function(item) {
      var vv = customLIST[item].vals[i]// value of the variable
      if (vv==null) {vv=''} // if null, leave empty space in csv
      csvcontent = csvcontent + ',' + vv
    }) 

    // break line
    csvcontent = csvcontent + '\n'

  }

  var dataout = "text/csv;charset=utf-8," + encodeURIComponent(csvcontent)
  var download = document.createElement('a')
  download.href = 'data:'+dataout
  download.download = 'RECIFS.csv'
  download.click()
    }

    document.body.style.cursor ='auto'

}

// function to run the download of the selected layers, ONLY FOR THE reefs close to POI

downloadDATA_POI = function() {

  document.body.style.cursor ='progress'
  // check if download list is not empty
  if (dwnLayersLIST.standard.length+dwnLayersLIST.custom.length==0) {
    alert('There are no variables on the download list!')
  } else { 
  // check if there are POIs
  if (POIsource.getFeatures().length==0) {
    alert('There are no points of interest on map!')
  } else {

  //  create CSV content
  
  var csvcontent = ''
  
  // create header
    
  var csvcontent = csvcontent+'POI_ID,POI_LON,POI_LAT,ID,LON,LAT,DIST' // add head of header
  if (dwnLayersLIST.standard.length>0) {    csvcontent = csvcontent+','+dwnLayersLIST.standard.join(',')  }// add colnames for standard variables
  if (dwnLayersLIST.custom.length>0) { dwnLayersLIST.custom.forEach(function(item) {csvcontent = csvcontent+','+customLIST[item].vname}) }
  csvcontent = csvcontent + '\n' // break line

  // browse POIs, and look for closest reef on map

  POIsource.getFeatures().forEach(function(item) {
    
  // find id of the reef closest to item
  var CL_reef = reefsSource.getClosestFeatureToCoordinate(item.getGeometry().getCoordinates())

  // compute distance between POI and closest reef

  var line = new ol.geom.LineString([item.getGeometry().getCoordinates(), CL_reef.getGeometry().getCoordinates()]);
  var Dist =  Math.round(line.getLength() * 100) / 100;
  

  // find index of closest reef 
  var i = dataR.features.findIndex(function(o){return o.properties.id == CL_reef.getProperties().name;} )

  // getcoordinates of POI and transform to WGS84
  var POIcoord = item.getGeometry().transform('EPSG:3857', 'EPSG:4326').flatCoordinates

  // add name and coordinates
  csvcontent=csvcontent+
  item.getProperties().name+','+
  POIcoord[0]+','+
  POIcoord[1]+','+
  dataR.features[i].properties.id+','+
  dataR.features[i].geometry.coordinates[0]+','+
  dataR.features[i].geometry.coordinates[1]+','+
  Dist

  // restore original projection
  item.getGeometry().transform('EPSG:4326', 'EPSG:3857').flatCoordinates

  // add standard variables
  dwnLayersLIST.standard.forEach(function(item) {
    var vv = dataR.features[i].properties.variables[item] // value of the variable
    if (vv==null) {vv=''} // if null, leave empty space in csv
    csvcontent = csvcontent + ',' + vv // add value of variable to csv
  })
  
  // add custom variables
  dwnLayersLIST.custom.forEach(function(item) {
    var vv = customLIST[item].vals[i]// value of the variable
    if (vv==null) {vv=''} // if null, leave empty space in csv
    csvcontent = csvcontent + ',' + vv
  }) 

  // break line
  csvcontent = csvcontent + '\n'

})

var dataout = "text/csv;charset=utf-8," + encodeURIComponent(csvcontent)
var download = document.createElement('a')
download.href = 'data:'+dataout
download.download = 'RECIFS.csv'
download.click()
 }
}

 document.body.style.cursor ='auto'

}

// function to decide which kind of download to launch 

launchDWN = function() {

  if (document.getElementById('cbPOI').checked) {
    downloadDATA_POI()
  } else {
    downloadDATA()
  }

}



// add button functionalities to hide/unhide panels 

// for POI

showPOI = function() {

  document.getElementById('POIpan').style.display='block'
  document.getElementById('POIcontent').style.display='block'

}

removePOI = function() {
  document.getElementById('POIpan').style.display='none'
}

hideUnhidePOI = function() {

  if (document.getElementById('POIcontent').style.display=='block') {
    document.getElementById('POIcontent').style.display='none'
  } else {
    document.getElementById('POIcontent').style.display='block'
  }
}



// for ENV

showENV = function() {

  document.getElementById('ENVpan').style.display='block'
  document.getElementById('ENVcontent').style.display='block'

}

removeENV = function() {
  document.getElementById('ENVpan').style.display='none'
}

hideUnhideENV = function() {

  if (document.getElementById('ENVcontent').style.display=='block') {
    document.getElementById('ENVcontent').style.display='none'
  } else {
    document.getElementById('ENVcontent').style.display='block'
  }
}


// for SC

showSC = function() {

  document.getElementById('SCpan').style.display='block'
  document.getElementById('SCcontent').style.display='block'

}

removeSC = function() {
  document.getElementById('SCpan').style.display='none'
}

hideUnhideSC = function() {

  if (document.getElementById('SCcontent').style.display=='block') {
    document.getElementById('SCcontent').style.display='none'
  } else {
    document.getElementById('SCcontent').style.display='block'
  }
}


// for BG

showBG = function() {

  document.getElementById('bgpan').style.display='block'
  document.getElementById('BGcontent').style.display='block'

}

removeBG = function() {
  document.getElementById('bgpan').style.display='none'
}

hideUnhideBG = function() {

  if (document.getElementById('BGcontent').style.display=='block') {
    document.getElementById('BGcontent').style.display='none'
  } else {
    document.getElementById('BGcontent').style.display='block'
  }
}


// for DWN

showDWN = function() {

  document.getElementById('exportPAN').style.display='block'
  document.getElementById('DWNcontent').style.display='block'

}

removeDWN = function() {
  document.getElementById('exportPAN').style.display='none'
}

hideUnhideDWN = function() {

  if (document.getElementById('DWNcontent').style.display=='block') {
    document.getElementById('DWNcontent').style.display='none'
  } else {
    document.getElementById('DWNcontent').style.display='block'
  }
}


