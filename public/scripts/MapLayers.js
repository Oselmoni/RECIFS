///////////////////////////////////////////////////////////////////
/////////////// Map layers //////////////////////////////////////
///////////////////////////////////////////////////////////////////

// set page colors
var txtcol = 'white' // txt color
var bgcol = '#a3b3e6' // background color
var secol = '#0f497e' // secondary color
var accol = 'green' // activation color


// function to convert colored pixels to greyscale (osm)

function greyscaleOSM(context) {var canvas = context.canvas;
var width = canvas.width;
var height = canvas.height;var imageData = context.getImageData(0, 0, width, height);
var data = imageData.data;for(i=0; i<data.length; i += 4){
 var r = data[i];
 var g = data[i + 1];
 var b = data[i + 2];
 // CIE luminance for the RGB
 var v = 0.1126 * r + 0.1152 * g + 0.8722 * b;
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

// create style
var POIfontsize = 20
var POIradius = 5

var POIstyle = new ol.style.Style({ 
  image: new ol.style.Circle({
    radius: POIradius,
    fill: new ol.style.Fill({color: 'purple'}),
    stroke: new ol.style.Stroke({color: 'black', width: 3})
  }),
  text: new ol.style.Text({
    font: 'bold '+POIfontsize+'px "Open Sans", "Arial Unicode MS", "sans-serif"',
    offsetY: -POIfontsize,
    fill: new ol.style.Fill({color: 'white'}),
    stroke: new ol.style.Stroke({color: 'black', width: 2}),
})
})

// function to use feature name as label
var POIstyleFunction = function(feature) {
  POIstyle.getText().setText(feature.get('name'));
  return POIstyle;
}

// create source and vector
var POIsource = new ol.source.Vector({
  format: new ol.format.GeoJSON(),
  });
  
var POIvector = new ol.layer.Vector({
  source: POIsource ,
  style : POIstyleFunction
  }); 

// function to change visualization settings
POIstyleMOD = function(mode) {

  // run reponse to different type of input/modes 
  if (mode=='color') {
    POIstyle.getImage().getFill().setColor(document.getElementById('POIcol').value)
      }

  if (mode=='minusP') { if (POIradius>=0) {POIradius = POIradius-5} }
  if (mode=='plusP') { POIradius = POIradius+5}
  if (mode=='displayP') {  POIstyle.getImage().setOpacity(document.getElementById('cbPOIp').checked)     }
  
  if (mode=='minusL') { if (POIfontsize>=0) {POIfontsize = POIfontsize-5
  } }
  if (mode=='plusL') { POIfontsize = POIfontsize+5}
  if (mode=='displayL') {  
    if (document.getElementById('cbPOIl').checked) {POIfontsize=20} else {POIfontsize=0}   
  }  
  
  POIstyle.getText().setFont('bold '+POIfontsize+'px "Open Sans", "Arial Unicode MS", "sans-serif"')
  POIstyle.getImage().setRadius(POIradius)
  POIvector.setStyle(POIstyleFunction)
}
  

// function to change background map

makebg = function() {

if (document.getElementById('bgid').value == 'osm') {
  bgmap.setVisible(true)
  LandLayer.setVisible(false)
  BGReefsLayer.setVisible(false)
  if (document.getElementById('bggsid').checked) {
    bgmap.on('postcompose', function(event) {greyscaleOSM(event.context)})
    // reattribute source to postcompose map
    bgmap.setSource(new ol.source.OSM({
      attributionsCollapsible : false,
      attributions: '© '+'<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors | <a href="https://data.unep-wcmc.org/datasets/1" target="_blank">UNDP-WCMC</a>'
    })
    )
} else { 
  bgmap.removeEventListener("postcompose", function(event) {greyscaleOSM(event.context)});
  
     // reattribute source to postcompose map
     bgmap.setSource(new ol.source.OSM({
      attributionsCollapsible : false,
      attributions: '© '+'<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors | <a href="https://data.unep-wcmc.org/datasets/1" target="_blank">UNDP-WCMC</a>'
    }))

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