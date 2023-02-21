///////////////////////////////////////////////////////////////////
/////////////// Map elements //////////////////////////////////////
///////////////////////////////////////////////////////////////////

// create layer of reefs 

var reefsSource = new ol.source.Vector({
  format: new ol.format.GeoJSON(),
 });


// add white-colored reefs

reefsNC.features.forEach(function(item) {
var reef = new ol.Feature({
  geometry: new ol.geom.Point(ol.proj.fromLonLat(item.geometry.coordinates)),
  name: item.properties.id,
  col : ol.color.asArray(item.properties.col),
  ind : '',
  area : item.properties.area
})  
reefsSource.addFeature(reef)
})

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

      if (e<30000) {    col[3]= 0.5        } else {col[3]=1} // if zooming in -> points become transparents

      return new ol.style.Style({ 
            image: new ol.style.Circle({
                  radius: rad,
                  fill: new ol.style.Fill({color: col})
            })
          })
    }
});

// create an MPA layer 

var mpasource = new ol.source.Vector({
format: new ol.format.GeoJSON(),
});

var mpavector = new ol.layer.Vector({
source: mpasource ,
style: new ol.style.Style({ 
  fill: new ol.style.Fill({ color: 'rgba(255,0,255,0.5)' }),
  stroke: new ol.style.Stroke({ color: 'white', width: 3 })
})
}); 

// create a CN layer

var cnsource = new ol.source.Vector({
format: new ol.format.GeoJSON(),
});

var cnvector = new ol.layer.Vector({
source: cnsource ,
style :  function(feature) {
  col = [0,0,255,1]
  // adaptive radius: following rapport between width of map (in pixels) and extent of map (meters)
  var extents =   map.getView().calculateExtent(map.getSize()) // this gives extent
  var e= extents[2]-extents[0] // extent long
  var width = document.getElementById('map').clientWidth // this gives the # of pixels
  var rad = (2500*width)/e // radius should always correspond 2500 m 

  if (rad<3) {rad=3} // if less than 3 pixels-> stop

  if (e<30000) {    col[3]= 0.5 
    nrad = rad
  
  } else {col[3]=1
    nrad = rad*2
  } // if zooming in -> points become transparents

  return new ol.style.Style({ 
        image: new ol.style.Circle({
              radius: nrad,
              fill: new ol.style.Fill({color: col}),
              stroke: new ol.style.Stroke({color: 'white', width: 3})
        })
      })
}
}); 

// function to convert colored pixels to greyscale (raster)

function greyscaleSAT(context) {var canvas = context.canvas;
var width = canvas.width;
var height = canvas.height;var imageData = context.getImageData(0, 0, width, height);
var data = imageData.data;for(i=0; i<data.length; i += 4){
 var r = data[i];
 var g = data[i + 1];
 var b = data[i + 2];
 // CIE luminance for the RGB
 var v = 1 * r + 1 * g + 1 * b;
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

// background map

var bgmap = new ol.layer.Tile({
source: new ol.source.OSM({
  url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
})
})


// create the map object

var map = new ol.Map({
target: 'map',
layers: [
  bgmap, reefs, mpavector, cnvector
],
view: new ol.View({
  center: ol.proj.fromLonLat([165.5, -20.5]),
  zoom: 7
})
});

// function to change background map

makebg = function() {

if (document.getElementById('bgid').value == 'osm') {
  bgmap.setSource(new ol.source.OSM({}))
  if (document.getElementById('bggsid').checked) {
    bgmap.removeEventListener("postcompose", function(event) {greyscaleSAT(event.context)});
    bgmap.on('postcompose', function(event) {greyscaleOSM(event.context)})
} else { 
  bgmap.removeEventListener("postcompose", function(event) {greyscaleOSM(event.context)});
 }

} else {
  bgmap.setSource(new ol.source.OSM({    url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'})
  )
  if (document.getElementById('bggsid').checked) {
    bgmap.removeEventListener("postcompose", function(event) {greyscaleOSM(event.context)});
    bgmap.on('postcompose', function(event) {greyscaleSAT(event.context)})
} else { 
  bgmap.removeEventListener("postcompose", function(event) {greyscaleSAT(event.context)});
 }

}



}





///////////////////////////////////////////////////////////////////
/////////////// Connectivity model Interactive graph //////////////
///////////////////////////////////////////////////////////////////

// load connectivity models preset

const conmodels = {  'custom' : { 'points':[[0,0]]} }

var presetCModels = JSON.parse(cmpreset)

for (var i of Object.keys(presetCModels)) {
conmodels[i] = { 'points': presetCModels[i] }
}



// get selector of connectivty models preset
var conmodselected = document.getElementById('cmod')


for (i of Object.keys(conmodels)) {

var opt = document.createElement('option')
opt.textContent=i

conmodselected.appendChild(opt) // add option to selector

}


// function to create the CM interactive plot

createCMplot = function() {

 var cmpreset = document.getElementById('cmod').value

 points = jQuery.extend(true, [], conmodels[cmpreset].points) // set the points from the chosen preset (use Jquery to avoid modifying original data!)
 extentx = JSON.parse(conmodinfo) // load ranges of sd from public directory
 extenty = [0,0.5]

  // remove focus object
  var focustoRemove = document.getElementById('focus')
  focustoRemove.parentNode.removeChild(focustoRemove)
  
  // create a new one
  makefocus()  

}


// crea svg, margin, width and height of canvas

var svg = d3.select("#svgC"),
  margin = {top: 20, right: 20, bottom: 80, left: 80},
  width = +svg.attr("width") - margin.left - margin.right,
  height = +svg.attr("height") - margin.top - margin.bottom;
  
// create data

var points = []
 
// create linear scale x/y

var x = d3.scaleLinear()
.rangeRound([0, width]);

var y = d3.scaleLinear()
.rangeRound([height, 0]);

var extentx = d3.extent(points, function(d) { return d[0]; })
var extenty = d3.extent(points, function(d) { return d[1]; })


// add attributes to the canvas       

svg.append('rect')
  .attr('class', 'zoom')
  .attr('fill', 'none')
  .attr('pointer-events', 'all')
  .attr('width', width)
  .attr('height', height)
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

//// Drag interaction functions

// create the drag interaction

let drag = d3.drag()
      .on('drag', dragged)
      .on('end', dragended);


// describe drag interactions

function dragged(d) {
  d[0] = x.invert(d3.event.x); // set new x 
  d[1] = y.invert(d3.event.y); // set new y
  d3.select(this)
      .attr('cx', x(d[0])) // assign x to circle
      .attr('cy', y(d[1])) // assign y to circle
}

function dragended(d) {
  
  // remove focus object
  var focustoRemove = document.getElementById('focus')
  focustoRemove.parentNode.removeChild(focustoRemove)
  
  // create a new one
  makefocus()
}

// function to highlight point to move

function handleMouseOvermove() {d3.select(this).attr('r', 10.0).style('fill', 'steelblue')}


//// Remove interaction functions

// Functions to highlight point to remove

function handleMouseOver() {d3.select(this).attr('r', 10.0).style('fill', 'red')}
function handleMouseOut() {d3.select(this).attr('r', 5.0) .style('fill', 'steelblue')}

// Function to remove the point clicked on

function clicktoremove(d) {
  var clickedpoint = d
  delete points[points.indexOf(clickedpoint)]
  // remove focus object
  var focustoRemove = document.getElementById('focus')
  focustoRemove.parentNode.removeChild(focustoRemove)
  
  // create a new one
  makefocus()
}

//// Add interaction functions

clicktoadd = function() {
  var coords = d3.mouse(this);
  var newData= [ x.invert(coords[0]),y.invert(coords[1]) ];
  points.push(newData);    
  // remove focus object
  var focustoRemove = document.getElementById('focus')
  focustoRemove.parentNode.removeChild(focustoRemove)
  
  // create a new one
  makefocus()  
}

// Set the current editing mode

var mode = 'none'

function addpoint() {
  if (mode!='add') {
      mode = 'add'
      document.getElementById('mp').style.backgroundColor = 'white'
      document.getElementById('ap').style.backgroundColor = 'lightgreen'
      document.getElementById('rp').style.backgroundColor = 'white'
      // remove focus object
      var focustoRemove = document.getElementById('focus')
      focustoRemove.parentNode.removeChild(focustoRemove)
      makefocus()
  } else if (mode=='add') {
      mode = 'none'
      document.getElementById('ap').style.backgroundColor = 'white'
      // remove focus object
      var focustoRemove = document.getElementById('focus')
      focustoRemove.parentNode.removeChild(focustoRemove)
      makefocus()
  }
}

function removepoint() {
  if (mode!='remove') {
      mode = 'remove'
      document.getElementById('mp').style.backgroundColor = 'white'
      document.getElementById('ap').style.backgroundColor = 'white'
      document.getElementById('rp').style.backgroundColor = 'lightgreen'
      // remove focus object
      var focustoRemove = document.getElementById('focus')
      focustoRemove.parentNode.removeChild(focustoRemove)
      makefocus()
  } else if (mode=='remove') {
      mode = 'none'
      document.getElementById('rp').style.backgroundColor = 'white'
      // remove focus object
      var focustoRemove = document.getElementById('focus')
      focustoRemove.parentNode.removeChild(focustoRemove)
      makefocus()
  }
}

function movepoint() {
  if (mode!='move') {
      mode = 'move'
      document.getElementById('mp').style.backgroundColor = 'lightgreen'
      document.getElementById('ap').style.backgroundColor = 'white'
      document.getElementById('rp').style.backgroundColor = 'white'
       // remove focus object
      var focustoRemove = document.getElementById('focus')
      focustoRemove.parentNode.removeChild(focustoRemove)
      makefocus()
  } else if (mode=='move') {
      mode = 'none'
      document.getElementById('mp').style.backgroundColor = 'white'
      // remove focus object
      var focustoRemove = document.getElementById('focus')
      focustoRemove.parentNode.removeChild(focustoRemove)
      makefocus()
  }
   
}


closeEditmodes = function() {
  if (mode=='add') {
      mode = 'none'
      document.getElementById('ap').style.backgroundColor = 'white'
      // remove focus object
      var focustoRemove = document.getElementById('focus')
      focustoRemove.parentNode.removeChild(focustoRemove)
      makefocus()
  }
  if (mode=='remove') {
      mode = 'none'
      document.getElementById('rp').style.backgroundColor = 'white'
      // remove focus object
      var focustoRemove = document.getElementById('focus')
      focustoRemove.parentNode.removeChild(focustoRemove)
      makefocus()
  }
  if (mode=='move') {
      mode = 'none'
      document.getElementById('mp').style.backgroundColor = 'white'
      // remove focus object
      var focustoRemove = document.getElementById('focus')
      focustoRemove.parentNode.removeChild(focustoRemove)
      makefocus()
  }

}

// function to create a focus

makefocus = function() {


// set x-y limits according to point ranges
x.domain(d3.extent(extentx));
y.domain(d3.extent(extenty));

var xAxis = d3.axisBottom(x),
yAxis = d3.axisLeft(y);

// function to compute a line path out of data points

var line = d3.line()
.x(function(d) { return x(d[0]); })
.y(function(d) { return y(d[1]); });


  // remove undefined points

  var filtered = points.filter(function (el) {
      return el != null;
  }); 

  points = filtered

  // Reorder points according to x position

  var xs = []
  var ys = []
  for (var i = 0; i<points.length; i++) {

      xs.push(points[i][0])
      ys.push(points[i][1])
  }

  var sortedxs = xs.slice().sort(function(a, b){return a-b});

  for (var i = 0; i<xs.length; i++) {

      points[sortedxs.indexOf(xs[i])][0] = xs[i]
      points[sortedxs.indexOf(xs[i])][1] = ys[i]
  }

// add focus -> a group of elements (point and lines) written on canvas 

var focus = svg.append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
              .attr('id', 'focus');

// add a canvas to focus to add points

focus.append('rect')
  .attr('fill', 'white')
  .attr('width', width)
  .attr('height', height)

// add path to the group "focus" and set its attributes
focus.append("path")
 .datum(points)
 .attr("fill", "none")
 .attr("stroke", "steelblue")
 .attr("stroke-linejoin", "round")
 .attr("stroke-linecap", "round")
 .attr("stroke-width", 1.5)
 .attr("d", line)
 

// add points to the group "focus" and set their attributes 
focus.selectAll('circle')
 .data(points)
 .enter() // create as many points as necessary
 .append('circle')
 .attr('r', 5.0)
 .attr('cx', function(d) { return x(d[0]);  })
 .attr('cy', function(d) { return y(d[1]); })
 .style('cursor', 'pointer')
 .style('fill', 'steelblue')



// add axis to the focus object

focus.append('g')
 .attr('class', 'axis axis--x')
 .attr('transform', 'translate(0,' + height + ')')
 .call(xAxis);
 
focus.append('g')
 .attr('class', 'axis axis--y')
 .call(yAxis);

// add axis labels

svg.append("text")  
      .attr('x', (margin.left)+(width/2))
      .attr('y', margin.top+height+(margin.bottom/2))
      .text('sea distance')
      .style("text-anchor", "middle")

svg.append("text")
      .attr('x', -(margin.top+(height/2)))
      .attr('y', margin.left/2)
      .text('Fst')
      .style("text-anchor", "middle")
      .attr("transform", "rotate(-90)");


// check mode activate and add respective interaction

if (mode == 'move') {
  focus.selectAll('circle')
  .on("mouseover", handleMouseOvermove)
  .on("mouseout", handleMouseOut)
      .call(drag)
}

if (mode =='remove') {
  focus.selectAll('circle')
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut)
      .on('click', clicktoremove);
}
 
if (mode =='add') {
  focus.on("click", clicktoadd)
  focus.style("cursor", 'crosshair')

}

return(focus)

}

var focus = makefocus()

////////////////////////////////////////////////////////////////////
/////////////// Adaptive model Interactive graph ///////////////////
////////////////////////////////////////////////////////////////////


// load connectivity models preset
const adamodels = {  "custom" : { 'type':'', 'points':[]} }

var presetAModels = JSON.parse(ampreset)

for (var i of Object.keys(presetAModels)) {
adamodels[i] = {'type': presetAModels[i][0] , 'points': presetAModels[i][1] }
}



// load connectivity models type ranges, add as options to modal
var contyperangesA = JSON.parse(envarinfo)

var envselect = document.getElementById('amenv') // the select element to add options to
for (i of Object.keys(contyperangesA)) {

  var opt = document.createElement('option')
  opt.textContent=contyperangesA[i][0]
  opt.value=i

  
  envselect.appendChild(opt) // add option to selector
  
}


// get selector of connectivty models presets
var conmodselectedA = document.getElementById('amod')


for (i of Object.keys(adamodels)) {

var opt = document.createElement('option')
opt.textContent=i

conmodselectedA.appendChild(opt) // add option to selector

}

// function to activate/inactivate the setting of adaptive models

adaptYN = function() {

  if (document.getElementById('adaptYN').value == 'Yes') {
      // activate all buttons
      document.getElementById('amenv').disabled=false
      document.getElementById('amod').disabled=false
      document.getElementById('apA').disabled=false
      document.getElementById('rpA').disabled=false
      document.getElementById('mpA').disabled=false
      

  } else {

      // in-activate all buttons
      document.getElementById('amenv').disabled=true
      document.getElementById('amod').disabled=true
      document.getElementById('apA').disabled=true
      document.getElementById('rpA').disabled=true
      document.getElementById('mpA').disabled=true
      document.getElementById('amod').value = 'custom'

      closeEditmodesA()
      createCMplotA()
  
}

}

// function to check current model preset (custom or other) and set the type of model (min or max sea distance) 

settypemodelA = function() {
  var currentmod = document.getElementById('amod').value

  if (currentmod == 'custom') { 
    document.getElementById('amenv').disabled=false
} else {
    document.getElementById('amenv').disabled=true
    cmt = adamodels[currentmod].type // type of con mod of the selected preset
    document.getElementById('amenv').value = cmt

}
createCMplotA()
}

// function to create the CM interactive plot

createCMplotA = function() {

 var cmt = document.getElementById('amenv').value
 var cmpreset = document.getElementById('amod').value

 pointsA = jQuery.extend(true, [], adamodels[cmpreset].points) // set the points from the chosen preset (use Jquery to avoid modifying original data!)
 extentxA = contyperangesA[cmt][1]
 extentyA = [0,1]

  // remove focus object
  var focustoRemove = document.getElementById('focusA')
  focustoRemove.parentNode.removeChild(focustoRemove)
  
  // create a new one
  makefocusA()  

}



// crea svg, margin, width and height of canvas

var svgA = d3.select("#svgA"),
  marginA = {top: 20, right: 20, bottom: 80, left: 80},
  widthA = +svg.attr("width") - marginA.left - marginA.right,
  heightA = +svg.attr("height") - marginA.top - marginA.bottom;
  
// create data

var pointsA = []
 
// create linear scale x/y

var xA = d3.scaleLinear()
.rangeRound([0, widthA]);

var yA = d3.scaleLinear()
.rangeRound([heightA, 0]);

var extentxA = d3.extent(pointsA, function(d) { return d[0]; })
var extentyA = d3.extent(pointsA, function(d) { return d[1]; })


// add attributes to the canvas       

svgA.append('rect')
  .attr('class', 'zoom')
  .attr('fill', 'none')
  .attr('pointer-events', 'all')
  .attr('width', widthA)
  .attr('height', heightA)
  .attr('transform', 'translate(' + marginA.left + ',' + marginA.top + ')')

//// Drag interaction functions

// create the drag interaction

let dragA = d3.drag()
      .on('drag', draggedA)
      .on('end', dragendedA);

// describe drag interactions

function draggedA(d) {
  d[0] = xA.invert(d3.event.x); // set new x 
  d[1] = yA.invert(d3.event.y); // set new y
  d3.select(this)
      .attr('cx', xA(d[0])) // assign x to circle
      .attr('cy', yA(d[1])) // assign y to circle
}

function dragendedA(d) {
  
  // remove focus object
  var focustoRemove = document.getElementById('focusA')
  focustoRemove.parentNode.removeChild(focustoRemove)
  
  // create a new one
  makefocusA()
}

// function to highlight point to move
function handleMouseOverAmove() {d3.select(this).attr('r', 10.0).style('fill', 'orange')}


//// Remove interaction functions

// Functions to highlight point to remove

function handleMouseOverA() {d3.select(this).attr('r', 10.0).style('fill', 'red')}
function handleMouseOutA() {d3.select(this).attr('r', 5.0) .style('fill', 'orange')}

// Function to remove the point clicked on

function clicktoremoveA(d) {
  var clickedpoint = d
  delete pointsA[pointsA.indexOf(clickedpoint)]
  // remove focus object
  var focustoRemove = document.getElementById('focusA')
  focustoRemove.parentNode.removeChild(focustoRemove)
  
  // create a new one
  makefocusA()
}

//// Add interaction functions

clicktoaddA = function() {
  var coordsA = d3.mouse(this);
  var newDataA= [ xA.invert(coordsA[0]),yA.invert(coordsA[1]) ];
  pointsA.push(newDataA);    
  // remove focus object
  var focustoRemove = document.getElementById('focusA')
  focustoRemove.parentNode.removeChild(focustoRemove)
  
  // create a new one
  makefocusA()  
}

// Set the current editing mode

var modeA = 'none'

function addpointA() {
  if (modeA!='add') {
      modeA = 'add'
      document.getElementById('mpA').style.backgroundColor = 'white'
      document.getElementById('apA').style.backgroundColor = 'lightgreen'
      document.getElementById('rpA').style.backgroundColor = 'white'
      // remove focus object
      var focustoRemove = document.getElementById('focusA')
      focustoRemove.parentNode.removeChild(focustoRemove)
      makefocusA()
  } else if (modeA=='add') {
      modeA = 'none'
      document.getElementById('apA').style.backgroundColor = 'white'
      // remove focus object
      var focustoRemove = document.getElementById('focusA')
      focustoRemove.parentNode.removeChild(focustoRemove)
      makefocusA()
  }
}

function removepointA() {
  if (modeA!='remove') {
      modeA = 'remove'
      document.getElementById('mpA').style.backgroundColor = 'white'
      document.getElementById('apA').style.backgroundColor = 'white'
      document.getElementById('rpA').style.backgroundColor = 'lightgreen'
      // remove focus object
      var focustoRemove = document.getElementById('focusA')
      focustoRemove.parentNode.removeChild(focustoRemove)
      makefocusA()
  } else if (modeA=='remove') {
      modeA = 'none'
      document.getElementById('rpA').style.backgroundColor = 'white'
      // remove focus object
      var focustoRemove = document.getElementById('focusA')
      focustoRemove.parentNode.removeChild(focustoRemove)
      makefocusA()
  }
}

function movepointA() {
  if (modeA!='move') {
      modeA = 'move'
      document.getElementById('mpA').style.backgroundColor = 'lightgreen'
      document.getElementById('apA').style.backgroundColor = 'white'
      document.getElementById('rpA').style.backgroundColor = 'white'
       // remove focus object
      var focustoRemove = document.getElementById('focusA')
      focustoRemove.parentNode.removeChild(focustoRemove)
      makefocusA()
  } else if (modeA=='move') {
      modeA = 'none'
      document.getElementById('mpA').style.backgroundColor = 'white'
      // remove focus object
      var focustoRemove = document.getElementById('focusA')
      focustoRemove.parentNode.removeChild(focustoRemove)
      makefocusA()
  }
   
}


// functionto close all edit mode (add remove move)

closeEditmodesA = function() {

          // if editing modes are running, close them
          if (modeA=='add') {
              modeA = 'none'
              document.getElementById('apA').style.backgroundColor = 'white'
              // remove focus object
              var focustoRemove = document.getElementById('focusA')
              focustoRemove.parentNode.removeChild(focustoRemove)
              makefocusA()
          }
          if (modeA=='remove') {
              modeA = 'none'
              document.getElementById('rpA').style.backgroundColor = 'white'
              // remove focus object
              var focustoRemove = document.getElementById('focusA')
              focustoRemove.parentNode.removeChild(focustoRemove)
              makefocusA()
          }
          if (modeA=='move') {
              modeA = 'none'
              document.getElementById('mpA').style.backgroundColor = 'white'
              // remove focus object
              var focustoRemove = document.getElementById('focusA')
              focustoRemove.parentNode.removeChild(focustoRemove)
              makefocusA()
          }
}

// function to create a focus

makefocusA = function() {


// set x-y limits according to point ranges
xA.domain(d3.extent(extentxA));
yA.domain(d3.extent(extentyA));

var xAxisA = d3.axisBottom(xA),
yAxisA = d3.axisLeft(yA);


// function to compute a line path out of data points

var lineA = d3.line()
.x(function(d) { return xA(d[0]); })
.y(function(d) { return yA(d[1]); });


  // remove undefined points

  var filtered = pointsA.filter(function (el) {
      return el != null;
  }); 

  pointsA = filtered

  // Reorder points according to x position

  var xs = []
  var ys = []
  for (var i = 0; i<pointsA.length; i++) {

      xs.push(pointsA[i][0])
      ys.push(pointsA[i][1])
  }

  var sortedxs = xs.slice().sort(function(a, b){return a-b});


  for (var i = 0; i<xs.length; i++) {

      pointsA[sortedxs.indexOf(xs[i])][0] = xs[i]
      pointsA[sortedxs.indexOf(xs[i])][1] = ys[i]
  }

// add focus -> a group of elements (point and lines) written on canvas 

var focusA = svgA.append("g")
              .attr("transform", "translate(" + marginA.left + "," + marginA.top + ")")
              .attr('id', 'focusA');

// add a canvas to focus to add points

focusA.append('rect')
  .attr('fill', 'white')
  .attr('width', widthA)
  .attr('height', heightA)

// add path to the group "focus" and set its attributes
focusA.append("path")
 .datum(pointsA)
 .attr("fill", "none")
 .attr("stroke", "orange")
 .attr("stroke-linejoin", "round")
 .attr("stroke-linecap", "round")
 .attr("stroke-width", 1.5)
 .attr("d", lineA)
 

// add points to the group "focus" and set their attributes 
focusA.selectAll('circle')
 .data(pointsA)
 .enter() // create as many points as necessary
 .append('circle')
 .attr('r', 5.0)
 .attr('cx', function(d) { return xA(d[0]);  })
 .attr('cy', function(d) { return yA(d[1]); })
 .style('cursor', 'pointer')
 .style('fill', 'orange')



// add axis to the focus object

focusA.append('g')
 .attr('class', 'axis axis--x')
 .attr('transform', 'translate(0,' + heightA + ')')
 .call(xAxisA);



focusA.append('g')
 .attr('class', 'axis axis--y')
 .call(yAxisA);

// add axis labels

if (document.getElementById('xlabenv')!=null) { // remove axis label if x (env var) is changed
document.getElementById('xlabenv').parentNode.removeChild(document.getElementById('xlabenv'))
}

svgA.append("text")  
      .attr('x', (marginA.left)+(widthA/2))
      .attr('y', marginA.top+heightA+(marginA.bottom/2))
      .attr('text-align', 'center')
      .text(document.getElementById('amenv').options[document.getElementById('amenv').selectedIndex].textContent)
      .style("text-anchor", "middle")
      .attr('id', 'xlabenv')

svgA.append("text")
      .attr('x', -(marginA.top+(heightA/2)))
      .attr('y', marginA.left/2)
      .text('prob. adapt.')
      .style("text-anchor", "middle")
      .attr("transform", "rotate(-90)");


// check mode activate and add respective interaction

if (modeA == 'move') {
  focusA.selectAll('circle')
  .on("mouseover", handleMouseOverAmove)
  .on("mouseout", handleMouseOutA)
      .call(dragA)
}

if (modeA =='remove') {
  focusA.selectAll('circle')
      .on("mouseover", handleMouseOverA)
      .on("mouseout", handleMouseOutA)
      .on('click', clicktoremoveA);
}
 
if (modeA =='add') {
  focusA.on("click", clicktoaddA)
  focusA.style("cursor", 'crosshair')
}


return(focusA)

}

var focusA = makefocusA()

////////////////////////////////////////////////////////////////////////////
///////// Functions to call the modal window and add/edut coral models /////
///////////////////////////////////////////////////////////////////////////

// create empty digital reef container

var digireef = [
  {
    "name": "A. millepora",
    "conmod": [
      [
        0,
        0
      ],
      [
        68.7761330721883,
        0.000417656592528594
      ],
      [
        137.552266144377,
        0.00124676957366815
      ],
      [
        206.328399216565,
        0.00246909981961575
      ],
      [
        275.104532288753,
        0.00369143006556335
      ],
      [
        343.880665360942,
        0.00491376031151095
      ],
      [
        412.65679843313,
        0.00613609055745855
      ],
      [
        481.432931505318,
        0.00735842080340614
      ],
      [
        550.209064577507,
        0.00858075104935374
      ],
      [
        618.985197649695,
        0.00980308129530134
      ]
    ],
    "adamod": [
      [
        [
          0.380243062973022,
          0.00378446187031878
        ],
        [
          0.426679297616387,
          0.0143075588127628
        ],
        [
          0.473115532259752,
          0.0525478200389674
        ],
        [
          0.519551766903118,
          0.174862612023551
        ],
        [
          0.565988001546483,
          0.447433523260181
        ],
        [
          0.612424236189848,
          0.755738818667764
        ],
        [
          0.658860470833213,
          0.922008982894657
        ],
        [
          0.705296705476579,
          0.978341585791154
        ],
        [
          0.751732940119944,
          0.994239583315444
        ],
        [
          0.798169174763309,
          0.998485980284793
        ]
      ],
      "SST10"
    ]
  }
]

// Open modal window for adding new coral model 

addcoral = function() {

  // display modal box
  document.getElementById('modal').style.display = 'block';
  // call plot functions
  createCMplot()
  createCMplotA()
  
  // set confirm button to 'add' mode 
  document.getElementById('confmodbut').onclick = function() {confirmmodal(null)}

}

// Open modal window for editing existing coral model

editcoral = function(ide) {
  // display modal box
  document.getElementById('modal').style.display = 'block';
  
  // load coral name
  document.getElementById('cmname').value = digireef[ide].name

  // set confirm button to 'edit' mode 
  document.getElementById('confmodbut').onclick = function() {confirmmodal(ide)}


  createCMplot()
  // use points from existing model 
  points = digireef[ide].conmod
  // load connectivity model from existing coral model
  // remove focus object
  var focustoRemove = document.getElementById('focus')
  focustoRemove.parentNode.removeChild(focustoRemove)  
  // create a new one
  makefocus()    

  // load adaptive model from existing coral model
  if (digireef[ide].adamod[1] == null) { // if no adaptive model
      document.getElementById('adaptYN').value = 'No'
      adaptYN()
  } else { // if adaptive model

      document.getElementById('adaptYN').value = 'Yes'
      adaptYN()
      // set the env var from existing model
      var cmt = digireef[ide].adamod[1]
      document.getElementById('amenv').value = cmt
      createCMplotA()
      // use points from existing model 
      pointsA = digireef[ide].adamod[0]
      // remove focus object
      var focustoRemove = document.getElementById('focusA')
      focustoRemove.parentNode.removeChild(focustoRemove)
      // create a new one
      makefocusA()    }

}

// function to remove an coral model from digital reef

rmdigireef = function(i) {

  var r = confirm("Are you sure you want to delete this coral model?");
  if (r == true) {
          // remove coral model
          delete digireef[i]
  
       // remove undefined from array

          var filtered = digireef.filter(function (el) {
                  return el != null;
              }); 
          
          digireef = filtered

          if (digireef.length==0) {FstTR = {"IN": [], "OUT":[]} // iFst threshold reccomandations
        }
      digireeftab()
  } 
}

// Function to close modal window without modifying digitalreef

cancelmodal = function() {

  // reset modal
  document.getElementById('cmname').value = ''
  document.getElementById('cmod').value = 'custom'
  document.getElementById('amod').value = 'custom'
  document.getElementById('adaptYN').value = 'Yes'

  adaptYN()

  // close edit mode, if they are running
  closeEditmodes()
  closeEditmodesA()

  // refresh graphs
  createCMplot()
  createCMplotA()

  // close modal window
  document.getElementById('modal').style.display = 'none';

}

// Function to close modal window AND add data to digitalreef

confirmmodal = function(idx) {

  // check that required fields are filled
  if (document.getElementById('cmname').value=='') {
      alert('The name of the coral model can not be empty')
      return;
  }

  if (points.length<2) {
      alert('The connectivity model requires at least two points')
      return;
  }

  if (JSON.stringify(points[0])!=JSON.stringify([0,0])) {
    alert('The first point of the connectvitiy model must be set to x=0, y=0!')
    return;
}

  for (i in points) {
      if (points[i][1]<0) {
        alert('Fst can not be negative!')
        return;
      }
  }

  for (i in pointsA) {
    if (pointsA[i][1]<0) {
      alert('Prob. adapt. can not be negative!')
      return;
    }
}


  if (document.getElementById('adaptYN').value=='Yes') {
      if (pointsA.length<2) {
          alert('The adaptive model requires at least two points')
          return;
      }
  }

  if (idx == null) { // if no index --> add to digireef
  // Add new coral to digital reef (if there is no adaptive model, set env var to null)
  if (document.getElementById('adaptYN').value=='Yes') {
      digireef.push({ name: document.getElementById('cmname').value,
                conmod: points,
                adamod: [pointsA, document.getElementById('amenv').value]})
  } else {
      digireef.push({ name: document.getElementById('cmname').value,
      conmod: points,
      adamod: [pointsA, null]})
  }
} else { // if index --> modify digireef
  if (document.getElementById('adaptYN').value=='Yes') {
      digireef[idx] = { name: document.getElementById('cmname').value,
                conmod: points,
                adamod: [pointsA, document.getElementById('amenv').value]}
  } else {
      digireef[idx] = { name: document.getElementById('cmname').value,
      conmod: points,
      adamod: [pointsA, null]}
  }
 FstTR = {"IN": [], "OUT":[]} // reset threshold -> they will be recalculated according to modofication
}
  


  // reset modal
  document.getElementById('cmname').value = ''
  document.getElementById('cmod').value = 'custom'
  document.getElementById('amod').value = 'custom'
  document.getElementById('adaptYN').value = 'Yes'
      
  adaptYN()
      
  // close edit mode, if they are running
  closeEditmodes()
  closeEditmodesA()
      
  // refresh graphs
  createCMplot()
  createCMplotA()
      
  // close modal window
  document.getElementById('modal').style.display = 'none';

  // reload tab of digital reef
  digireeftab()
  // re-generate computational digireef
  modcdigireef()
}


////////////////////////////////////////////////////////////////////////
/////  Functions to write the digital coral reef object on a table /////
////////////////////////////////////////////////////////////////////////

// Create computative digital reef (ie. digital reef only with checked corals)
var cdigireef = digireef


digireeftab = function() {
     
// get reccomandations of Fst thresholds
if (digireef.length == 0) {
  rewritedrtab()
} // if no coral models, stop

    // check if inbound Fst threshold reccomandation was already computed, if not launch the ajax request
    if (FstTR.IN.length != digireef.length ) {
      $.ajax({
          type:'POST',
          dataType: 'text',
          url:'/IFst',
          data: JSON.stringify(digireef),
          success: function(data){
              FstTR=JSON.parse(data) // receive data from server
                      
              rewritedrtab()

      }   
      })
  } 

}

// function to modify computative digital reef 

modcdigireef = function() {
  var cb = document.getElementsByClassName('checkboxes')
  cdigireef= [] // empty computative digi reef
  for (var i = 0; i<cb.length; i++) { // browse across checkboxes...
      if (cb[i].checked==true) { // if checked --> add to cb
          cdigireef.push(digireef[i])
      }
  }
  // if api modal is open --> update reccomandation of Fst!
  if (document.getElementById('modal-API').style.display == 'block' ) {APImodal()}
  if (document.getElementById('modal-ICI').style.display == 'block' ) {ICImodal()}
  if (document.getElementById('modal-OCI').style.display == 'block' ) {OCImodal()}
  if (document.getElementById('modal-MPA').style.display == 'block' ) {MPAmodal()}
  if (document.getElementById('modal-CN').style.display == 'block' ) {CNmodal()}
}

// Function to rewrite digireef tab

rewritedrtab = function() {

var drtab = document.getElementById('drtab')

// clear/remove all children nodes
drtab.innerHTML = ''

// write tab header

var rowheader = document.createElement('tr')
var h1 = document.createElement('th') 
h1.textContent = 'Name'
rowheader.appendChild(h1)

var h2 = document.createElement('th') 
h2.textContent = 'Env'
h2.style.fontSize = '10px'
rowheader.appendChild(h2)

var h3 = document.createElement('th') 
h3.textContent = 'Fst-I'
h3.style.fontSize = '10px'
rowheader.appendChild(h3)        

var h4 = document.createElement('th')
h4.textContent = 'Fst-O'
h4.style.fontSize = '10px'
rowheader.appendChild(h4)      

var h5 = document.createElement('th')
rowheader.appendChild(h5)     

var h6 = document.createElement('th')
rowheader.appendChild(h6)     

var h7 = document.createElement('th')
rowheader.appendChild(h7)     

drtab.appendChild(rowheader)
        
// rewrite children nodes

for (var i = 0; i<digireef.length; i++) {

var newrow = document.createElement('tr')
newrow.id = i

var td1 = document.createElement('td')
td1.textContent = digireef[i].name
newrow.appendChild(td1)

var td2 = document.createElement('td')
if (digireef[i].adamod[1]!=null) {
td2.textContent = digireef[i].adamod[1]
} else { td2.textContent = '-'     }
td2.style.fontSize = '10px'
newrow.appendChild(td2)

var td3 = document.createElement('td')
td3.textContent = FstTR.IN[i]
td3.style.fontSize = '10px'
newrow.appendChild(td3)

var td4 = document.createElement('td')
td4.textContent = FstTR.OUT[i]
td4.style.fontSize = '10px'
newrow.appendChild(td4)

var td5 = document.createElement('button')
td5.textContent = 'E'
td5.style = 'background-color: yellow'
const ide = i // index of object to modify
td5.onclick = function() {editcoral(ide) }        
newrow.appendChild(td5)

var td6 = document.createElement('button')
td6.textContent = '-'
td6.style = 'background-color: red'    
const idr = i // index of object to remove
td6.onclick = function() {rmdigireef(idr) }        
newrow.appendChild(td6)

var td7 = document.createElement('input')
td7.type = 'checkbox'
td7.checked = true 
td7.className = 'checkboxes'
td7.onchange = function() {modcdigireef() }        
newrow.appendChild(td7)

drtab.appendChild(newrow)

}
modcdigireef()
}


////////////////////////////////////////////////////////////////////////
/////  Functions to compute API   //////////////////////////////////////
////////////////////////////////////////////////////////////////////////

var FstTR = {"IN": [], "OUT":[]} // iFst threshold reccomandations

// function to get recommended Fst thresholds

FstgetRec = function()  {

if (digireef.length == 0) {return} // if no coral models, stop

    // check if inbound Fst threshold reccomandation was already computed, if not launch the ajax request
    if (FstTR.IN.length != digireef.length ) {
      $.ajax({
          type:'POST',
          dataType: 'text',
          url:'/IFst',
          data: JSON.stringify(digireef),
          success: function(data){
              FstTR=JSON.parse(data) // receive data from server
      }   
      })
  } 


}

// Open a modal for API calculation on map

APImodal= function() {

  // remove MPA/CN drawing interactions, if activated
  stopMPAdraw()
  mpavector.setVisible(false)
  stopCNdraw()
  cnvector.setVisible(false)
   
  // show modal, hide other modals if opened
  document.getElementById('modal-OCI').style.display = 'none'
  document.getElementById('modal-ICI').style.display = 'none'
  document.getElementById('modal-MPA').style.display = 'none'
  document.getElementById('modal-CN').style.display = 'none'
  document.getElementById('modal-API').style.display = 'block'

  // show button as activated, de-activate others
  document.getElementById('butici').style.backgroundColor =  'rgb(250, 242, 176)'
  document.getElementById('butoci').style.backgroundColor =  'rgb(250, 242, 176)'
  document.getElementById('butmpa').style.backgroundColor =  'rgb(250, 242, 176)'
  document.getElementById('butcn').style.backgroundColor =  'rgb(250, 242, 176)'
  document.getElementById('butapi').style.backgroundColor = 'lightgreen'

}


// Run API ajax request on server, receive result

AJAXAPI = function() {

 
  // check that cdigireef is not empty
  if (cdigireef.length == 0) {
    alert('Please select at least one coral model!')
    return
  }

  // create container of environmental variables in coral model
  var evars = {}
  for (var i = 0; i<cdigireef.length; i++) {
    evars[cdigireef[i].adamod[1]] = 0
  }

  // count how many of each appear in coral models
  for (var i = 0; i<cdigireef.length; i++) {
      evars[cdigireef[i].adamod[1]] = evars[cdigireef[i].adamod[1]]+1
  }

  // check that cdigireef contains at least one coral model with environmental variable
  if (Object.keys(evars).length==1) {
    if (null in evars) {
      alert('Please select at least one coral model with an adaptive model!')
      return
    }
  }

  if (Object.keys(evars).length>1) {
    if (null in evars) {
      alert('Warning: One of the coral models does not have an adaptive model. API for this model will not be computed.')
    }
  }

  // checks for colorscale limits
  if (document.getElementById('cbcmAPI').checked == true) {
    if (document.getElementById('minMapi').value=='') {
      alert('Minimal value of customized color scale is missing!')
      return
    }
    if (document.getElementById('maxMapi').value=='') {
      alert('Maximal value of customized color scale is missing!')
      return
    }
    if (Number(document.getElementById('maxMapi').value)>1) {
      alert('Maximal value of customized color scale can not exceed 1!')
      return
    }
    if (Number(document.getElementById('minMapi').value)<0) {
      alert('Minimal value of customized color scale can not be lower than 0!')
      return
    }
  }
  
  $.ajax({
      type:'POST',
      dataType: 'text',
      url:'/API',
      data: JSON.stringify({digitalreef: cdigireef, 
                            Ccolor : [document.getElementById('cbcmAPI').checked, document.getElementById('minMapi').value, document.getElementById('maxMapi').value]}),
      success: function(data){
          drawAPI(JSON.parse(data))
      } 
  })
}

// Function to Draw results of API calcualtion on map 

drawAPI = function(data) {

// update dataR for legend updates
dataR = data

  // clear source
  reefsSource.clear()


  for (var i=0; i<data.features.length; i++) {

      var reef = new ol.Feature({
          geometry: new ol.geom.Point(ol.proj.fromLonLat(data.features[i].geometry.coordinates)),
          name: data.features[i].properties.id,
          col : ol.color.asArray(data.features[i].properties.col),
          ind : data.features[i].properties.API,
          area : data.features[i].properties.area
        })  

      reefsSource.addFeature(reef) // add to source 
  
  }

  // update legend
document.getElementById('legend').style.display = 'block'

var width = document.getElementById('legendplot').clientWidth // this gives the # of pixels
var height = document.getElementById('legendplot').clientHeight // this gives the # of pixels

document.getElementById('legendtitle').innerHTML = 'API'
makelegend(data.crs.properties.colscale[0], data.crs.properties.colscale[1], width, height, 8,4,10   )


}

////////////////////////////////////////////////////////////////////////
/////  Functions to compute ICI   //////////////////////////////////////
////////////////////////////////////////////////////////////////////////


// Open a modal for ICI calculation on map

ICImodal= function() {

  // remove MPA drawing interactions, if activated
  stopMPAdraw()
  mpavector.setVisible(false)
  stopCNdraw()
  cnvector.setVisible(false)



if (digireef.length == 0) {return} // if no coral models, stop

    // check if inbound Fst threshold reccomandation was already computed, if not launch the ajax request
    if (FstTR.IN.length != digireef.length ) {
      $.ajax({
          type:'POST',
          dataType: 'text',
          url:'/IFst',
          data: JSON.stringify(digireef),
          success: function(data){
              FstTR=JSON.parse(data) // receive data from server
              FstRECICI()

      }   
      })   
  } else {        FstRECICI()    }

}

// function to visualize or hide the custom Fst threshold input

ICIcustFst = function() {

  if (document.getElementById('cbICIcfst').checked==true) {
    document.getElementById('FstTici').style.display = 'block'
    document.getElementById('ICIfstdd').disabled = true
  } else {
    document.getElementById('FstTici').style.display = 'none'
    document.getElementById('ICIfstdd').disabled = false
  } 

}

// Add Fst Reccomandation and open modal 

FstRECICI = function() {

  // check which corals are checked 

  var cb = document.getElementsByClassName('checkboxes')
  subFST= [] // empty fst reccomandation
  for (var i = 0; i<cb.length; i++) { // browse across checkboxes...
      if (cb[i].checked==true) { // if checked --> add to fst reccomandation
          subFST.push(FstTR.IN[i])
      }
  }


  document.getElementById('FstrecICI').textContent = 'Fst Threshold (recommended <='+Math.min(...subFST)+')'    

  document.getElementById('modal-OCI').style.display = 'none'
  document.getElementById('modal-MPA').style.display = 'none'
  document.getElementById('modal-API').style.display = 'none'
  document.getElementById('modal-CN').style.display = 'none'
  document.getElementById('modal-ICI').style.display = 'block'

    // show button as activated, de-activate others
    document.getElementById('butici').style.backgroundColor = 'lightgreen'
    document.getElementById('butoci').style.backgroundColor = 'rgb(250, 242, 176)'
    document.getElementById('butapi').style.backgroundColor = 'rgb(250, 242, 176)'
    document.getElementById('butmpa').style.backgroundColor = 'rgb(250, 242, 176)'
    document.getElementById('butcn').style.backgroundColor = 'rgb(250, 242, 176)'

}

// Run ICI ajax request on server, receive result


AJAXICI = function() {

  // get the Fst threshold
  if (document.getElementById('cbICIcfst').checked==true) {
     var FstICI = Number(document.getElementById('FstTici').value)
     } else { var FstICI = Number(document.getElementById('ICIfstdd').value) }



  // check that cdigireef is not empty
  if (cdigireef.length == 0) {
    alert('Please select at least one coral model!')
    return
  }

      // check that Fst is not empty
      if ((FstICI == 0) || 
      (FstICI> 1) ||
      (FstICI <= 0)
      ) { 
        alert('Please select a valid Fst threshold!')
        return
      }

  // checks for colorscale limits
      if (document.getElementById('cbcmICI').checked == true) {
        if (document.getElementById('minMici').value=='') {
          alert('Minimal value of customized color scale is missing!')
          return
        }
        if (document.getElementById('maxMici').value=='') {
          alert('Maximal value of customized color scale is missing!')
          return
        }
      }

  
  $.ajax({
      type:'POST',
      dataType: 'text',
      url:'/ICI',
      data: JSON.stringify({digitalreef: cdigireef,
         FstT : FstICI,
         Ccolor : [document.getElementById('cbcmICI').checked, document.getElementById('minMici').value, document.getElementById('maxMici').value]}),
        success: function(data){
          drawICI(JSON.parse(data))
      } 
  })
}

// Function to Draw results of ICI calcualtion on map 

drawICI = function(data) {


  // update dataR for legend updates
dataR = data
  // clear source
  reefsSource.clear()



  for (var i=0; i<data.features.length; i++) {

      var reef = new ol.Feature({
          geometry: new ol.geom.Point(ol.proj.fromLonLat(data.features[i].geometry.coordinates)),
          name: data.features[i].properties.id,
          col : ol.color.asArray(data.features[i].properties.col),
          ind : data.features[i].properties.ICI,
          area : data.features[i].properties.area
        })  

      reefsSource.addFeature(reef) // add to source 
  
  }


  // update legend
document.getElementById('legend').style.display = 'block'

var width = document.getElementById('legendplot').clientWidth // this gives the # of pixels
var height = document.getElementById('legendplot').clientHeight // this gives the # of pixels

document.getElementById('legendtitle').innerHTML = 'ICI [km2]'
makelegend(data.crs.properties.colscale[0], data.crs.properties.colscale[1], width, height, 8,4,10   )

}



////////////////////////////////////////////////////////////////////////
/////  Functions to compute OCI   //////////////////////////////////////
////////////////////////////////////////////////////////////////////////


// Open a modal for OCI calculation on map

OCImodal= function() {

// remove MPA drawing interactions, if activated
stopMPAdraw()
mpavector.setVisible(false)
stopCNdraw()
cnvector.setVisible(false)


if (digireef.length == 0) {return} // if no coral models, stop

    // check if inbound Fst threshold reccomandation was already computed, if not launch the ajax request
    if (FstTR.IN.length != digireef.length ) {
      $.ajax({
          type:'POST',
          dataType: 'text',
          url:'/IFst',
          data: JSON.stringify(digireef),
          success: function(data){
              FstTR=JSON.parse(data) // receive data from server
              FstRECOCI()

      }   
      })   
  } else {        FstRECOCI()    }


}

// Add Fst Reccomandation and open modal 

FstRECOCI = function() {

// check which corals are checked 

var cb = document.getElementsByClassName('checkboxes')
subFST= [] // empty fst reccomandation
for (var i = 0; i<cb.length; i++) { // browse across checkboxes...
    if (cb[i].checked==true) { // if checked --> add to fst reccomandation
        subFST.push(FstTR.OUT[i])
    }
}


document.getElementById('FstrecOCI').textContent = 'Fst Threshold (recommended <='+Math.min(...subFST)+')'    

document.getElementById('modal-API').style.display = 'none'
document.getElementById('modal-ICI').style.display = 'none'
document.getElementById('modal-MPA').style.display = 'none'
document.getElementById('modal-CN').style.display = 'none'
document.getElementById('modal-OCI').style.display = 'block'

// show button as activated, de-activate others
document.getElementById('butici').style.backgroundColor = 'rgb(250, 242, 176)'
document.getElementById('butoci').style.backgroundColor = 'lightgreen'
document.getElementById('butapi').style.backgroundColor = 'rgb(250, 242, 176)'
document.getElementById('butcn').style.backgroundColor = 'rgb(250, 242, 176)'
document.getElementById('butmpa').style.backgroundColor = 'rgb(250, 242, 176)'

}

// function to visualize or hide the custom Fst threshold input

OCIcustFst = function() {

  if (document.getElementById('cbOCIcfst').checked==true) {
    document.getElementById('FstToci').style.display = 'block'
    document.getElementById('OCIfstdd').disabled = true
  } else {
    document.getElementById('FstToci').style.display = 'none'
    document.getElementById('OCIfstdd').disabled = false
  } 

}

// Run OCI ajax request on server, receive result

AJAXOCI = function() {

  // get the Fst threshold
  if (document.getElementById('cbOCIcfst').checked==true) {
    var FstOCI = Number(document.getElementById('FstToci').value)
    } else { var FstOCI = Number(document.getElementById('OCIfstdd').value) }

// check that cdigireef is not empty
if (cdigireef.length == 0) {
  alert('Please select at least one coral model!')
  return
}

    // check that Fst is not empty
    if ((FstOCI == 0) || 
    (FstOCI > 1) ||
    (FstOCI <= 0)
    ) { 
      alert('Please select a valid Fst threshold!')
      return
    }


// checks for colorscale limits
  if (document.getElementById('cbcmOCI').checked == true) {
    if (document.getElementById('minMoci').value=='') {
      alert('Minimal value of customized color scale is missing!')
      return
    }
    if (document.getElementById('maxMoci').value=='') {
      alert('Maximal value of customized color scale is missing!')
      return
    }
  }

$.ajax({
    type:'POST',
    dataType: 'text',
    url:'/OCI',
    data: JSON.stringify({digitalreef: cdigireef,
       FstT : FstOCI,
       Ccolor : [document.getElementById('cbcmOCI').checked, document.getElementById('minMoci').value, document.getElementById('maxMoci').value]}),
       success: function(data){
        drawOCI(JSON.parse(data))
    } 
})
}

// Function to Draw results of ICI calcualtion on map 

drawOCI = function(data) {

// update dataR for legend updates
dataR = data
// clear source
reefsSource.clear()

// update colors in map
for (var i=0; i<data.features.length; i++) {

    var reef = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat(data.features[i].geometry.coordinates)),
        name: data.features[i].properties.id,
        col : ol.color.asArray(data.features[i].properties.col),
        ind : data.features[i].properties.OCI,
        area : data.features[i].properties.area
      })  

    reefsSource.addFeature(reef) // add to source 

}


// update legend
document.getElementById('legend').style.display = 'block'

var width = document.getElementById('legendplot').clientWidth // this gives the # of pixels
var height = document.getElementById('legendplot').clientHeight // this gives the # of pixels

document.getElementById('legendtitle').innerHTML = 'OCI [km2]'
makelegend(data.crs.properties.colscale[0], data.crs.properties.colscale[1], width, height, 8,4,10   )

}

////////////////////////////////////////////////////////////////////////
/////  Function to compute a colorscale legend   //////////////////////
////////////////////////////////////////////////////////////////////////

makelegend = function(cols, ltext, lwidth, lheight, fontsize, px, py) {

var nsteps = cols.length

var div = d3.select("#legendplot") // get div

// remove children (already loaded legend, if any)
document.getElementById('legendplot').innerHTML = ''  

// create new legend
var svg = div.append('svg')
    .attr('width', lwidth)
    .attr('height', lheight)
    .attr('id', 'legendSVG')
  

var dy = (lheight-py*2)/nsteps // height of each box

// add legendscalebar
svg.append('rect')
.attr('stroke', 'black')
.attr('stroke-width', '3')
    .attr('y', py)
    .attr('x', px)
    .attr('width', (lwidth-px*2)/2)
    .attr('height', lheight-(py*2))

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

// add text 

var ipy = py // iterative padding variable
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
  ipy=ipy+dy
}



}

// update legend on resize window

var dataR // global variable to catch data arriving from server

window.onresize = function() {

  if (dataR!=undefined) {
  // update legend
  var width = document.getElementById('legendplot').clientWidth // this gives the # of pixels
  var height = document.getElementById('legendplot').clientHeight // this gives the # of pixels
  makelegend(dataR.crs.properties.colscale[0], dataR.crs.properties.colscale[1], width, height, 8,4,10   )
  }
}

////////////////////////////////////////////////////////////////////////
/////  Functions to set min - max of colorscale legend   //////////////////////
////////////////////////////////////////////////////////////////////////

// show min-max legend inputs

customMAPapi = function() {

if (document.getElementById('cbcmAPI').checked) {
  document.getElementById('custmapAPI').style.display = 'block';
} else {document.getElementById('custmapAPI').style.display = 'none';}
}

customMAPici = function() {

if (document.getElementById('cbcmICI').checked) {
  document.getElementById('custmapICI').style.display = 'block';
} else {document.getElementById('custmapICI').style.display = 'none';}
}

customMAPoci = function() {

if (document.getElementById('cbcmOCI').checked) {
  document.getElementById('custmapOCI').style.display = 'block';
} else {document.getElementById('custmapOCI').style.display = 'none';}
}

customMAPmpa = function() {

if (document.getElementById('cbcmMPA').checked) {
  document.getElementById('custmapMPA').style.display = 'block';
} else {document.getElementById('custmapMPA').style.display = 'none';}
}

customMAPcn = function() {

if (document.getElementById('cbcmCN').checked) {
  document.getElementById('custmapCN').style.display = 'block';
} else {document.getElementById('custmapCN').style.display = 'none';}
}

////////////////////////////////////////////////////////////////////////
/////  Functions to run the MPA - ICI   //////////////////
////////////////////////////////////////////////////////////////////////

// Open a modal for MPA calculation on map

MPAmodal= function() {

mpavector.setVisible(true)
stopCNdraw()
cnvector.setVisible(false)


if (digireef.length == 0) {return} // if no coral models, stop

    // check if inbound Fst threshold reccomandation was already computed, if not launch the ajax request
    if (FstTR.IN.length != digireef.length ) {
      $.ajax({
          type:'POST',
          dataType: 'text',
          url:'/IFst',
          data: JSON.stringify(digireef),
          success: function(data){
              FstTR=JSON.parse(data) // receive data from server
              FstRECMPA()

      }   
      })   
  } else {        FstRECMPA()    }


}

// Add Fst Reccomandation and open modal 

FstRECMPA = function() {

  // check which corals are checked 

  var cb = document.getElementsByClassName('checkboxes')
  subFST= [] // empty fst reccomandation
  for (var i = 0; i<cb.length; i++) { // browse across checkboxes...
      if (cb[i].checked==true) { // if checked --> add to fst reccomandation
          subFST.push(FstTR.IN[i])
      }
  }


  document.getElementById('FstrecMPA').textContent = 'Fst Threshold (recommended <='+Math.min(...subFST)+')'    

  document.getElementById('modal-OCI').style.display = 'none'
  document.getElementById('modal-ICI').style.display = 'none'
  document.getElementById('modal-API').style.display = 'none'
  document.getElementById('modal-CN').style.display = 'none'
  document.getElementById('modal-MPA').style.display = 'block'

    // show button as activated, de-activate others
    document.getElementById('butici').style.backgroundColor = 'rgb(250, 242, 176)'
    document.getElementById('butoci').style.backgroundColor = 'rgb(250, 242, 176)'
    document.getElementById('butapi').style.backgroundColor = 'rgb(250, 242, 176)'
    document.getElementById('butcn').style.backgroundColor = 'rgb(250, 242, 176)'
    document.getElementById('butmpa').style.backgroundColor = 'lightgreen'

}

// function to visualize or hide the custom Fst threshold input

MPAcustFst = function() {

  if (document.getElementById('cbMPAcfst').checked==true) {
    document.getElementById('FstTmpa').style.display = 'block'
    document.getElementById('MPAfstdd').disabled = true
  } else {
    document.getElementById('FstTmpa').style.display = 'none'
    document.getElementById('MPAfstdd').disabled = false
  } 

}


//// function to draw an MPA polygon

// activate MPA polygon drawing

var mpaPolyDraw = new ol.interaction.Draw({
source: mpasource,
type: 'MultiPolygon'
});


drawmpapoly = function() {
map.removeInteraction(select)

if (  document.getElementById('drawmpabut').style.backgroundColor == 'white'  ) { // if interaction is not activate -> activate it!

map.addInteraction(mpaPolyDraw);
document.getElementById('drawmpabut').style.backgroundColor = 'lightgreen'
document.getElementById('removempabut').style.backgroundColor = 'white'
} else {
document.getElementById('drawmpabut').style.backgroundColor = 'white'
map.removeInteraction(mpaPolyDraw)
}
}

//// function to remove an MPA polygon

// activate MPA polygon remove

var select = new ol.interaction.Select({
layers : [mpavector],
});

// define what to do when object is selected -> delete
select.getFeatures().on('add', function(feature){
mpasource.removeFeature(feature.element);
feature.target.remove(feature.element);  }) 

// define an "mouse on object" interaction to highlight polygon to delete
var selectPointerMove = new ol.interaction.Select({
layers : [mpavector],
condition: ol.events.condition.pointerMove
});

removempapoly = function() {
map.removeInteraction(mpaPolyDraw) // remove interaction

if (  document.getElementById('removempabut').style.backgroundColor == 'white'  ) { // if interaction is not activate -> activate it!

map.addInteraction(select);
map.addInteraction(selectPointerMove)

document.getElementById('drawmpabut').style.backgroundColor = 'white'
document.getElementById('removempabut').style.backgroundColor = 'lightgreen'
} else {
document.getElementById('removempabut').style.backgroundColor = 'white'
map.removeInteraction(select)
map.removeInteraction(selectPointerMove)
}
}

// function to turn off all mpa drawing interactions

stopMPAdraw = function() {

document.getElementById('removempabut').style.backgroundColor = 'white'
document.getElementById('drawmpabut').style.backgroundColor = 'white'
map.removeInteraction(mpaPolyDraw)
map.removeInteraction(select)
map.removeInteraction(selectPointerMove)


} 

// Run MPA ajax request on server, receive result


AJAXMPA = function() {

  stopMPAdraw()

  // get the Fst threshold
    if (document.getElementById('cbMPAcfst').checked==true) {
      var FstMPA = Number(document.getElementById('FstTmpa').value)
      } else { var FstMPA = Number(document.getElementById('MPAfstdd').value) }
  
  // check that cdigireef is not empty
  if (cdigireef.length == 0) {
    alert('Please select at least one coral model!')
    return
  }

  // check that Fst is not empty
  if ((FstMPA == 0) || 
  (FstMPA > 1) ||
  (FstMPA <= 0)
  ) { 
    alert('Please select a valid Fst threshold!')
    return
  }

  // check that at least one MPA was drawn
  if (mpasource.getFeatures().length == 0) {
    alert('Please draw at least one MPA on map!')
    return
  }

  // checks for colorscale limits
      if (document.getElementById('cbcmMPA').checked == true) {
        if (document.getElementById('minMmpa').value=='') {
          alert('Minimal value of customized color scale is missing!')
          return
        }
        if (document.getElementById('maxMmpa').value=='') {
          alert('Maximal value of customized color scale is missing!')
          return
        }
      }

  // prepare MPA data for submission
  var mpapoly = []

  // add mpa coordinates to mpapoly object (converted to 4326)
  mpasource.getFeatures().forEach(function(item) {mpapoly.push(item.getGeometry().transform('EPSG:3857', 'EPSG:4326').flatCoordinates)}) 

  $.ajax({
      type:'POST',
      dataType: 'text',
      url:'/MPA',
      data: JSON.stringify({digitalreef: cdigireef,
         FstT : FstMPA,
         Ccolor : [document.getElementById('cbcmMPA').checked, document.getElementById('minMmpa').value, document.getElementById('maxMmpa').value],
         mpa : mpapoly
        }),
        success: function(data){
          drawMPA(JSON.parse(data))
      } 
  })

  // restore original CRS
  mpasource.getFeatures().forEach(function(item) {item.getGeometry().transform('EPSG:4326', 'EPSG:3857').flatCoordinates}) 


}

// Function to Draw results of MPA calcualtion on map 

drawMPA = function(data) {

// update dataR for legend updates
dataR = data

  // clear source
  reefsSource.clear()


  for (var i=0; i<data.features.length; i++) {

      var reef = new ol.Feature({
          geometry: new ol.geom.Point(ol.proj.fromLonLat(data.features[i].geometry.coordinates)),
          name: data.features[i].properties.id,
          col : ol.color.asArray(data.features[i].properties.col),
          ind : data.features[i].properties.ICI,
          area : data.features[i].properties.area
        })  

      reefsSource.addFeature(reef) // add to source 
  
  }


  // update legend
document.getElementById('legend').style.display = 'block'

var width = document.getElementById('legendplot').clientWidth // this gives the # of pixels
var height = document.getElementById('legendplot').clientHeight // this gives the # of pixels

document.getElementById('legendtitle').innerHTML = 'MPA-ICI [km2]'
makelegend(data.crs.properties.colscale[0], data.crs.properties.colscale[1], width, height, 8,4,10   )

}


// add a text box to modal with MPA size
mpasource.on('change', function() {
var MPAarea = 0
mpasource.getFeatures().forEach(function(item) {
  MPAarea = MPAarea+item.getGeometry().getArea()/1000000
})
var MPAreefarea = 0 
mpasource.getFeatures().forEach( 
  function(mpa) {
    var mpageo = mpa.getGeometry()
      reefsSource.getFeatures().forEach(function(reef) {
        var reefcoord = reef.getGeometry().getCoordinates()
          if (mpageo.intersectsCoordinate(reefcoord)==true) {
            MPAreefarea += reef.values_.area
          }
    })
  })
document.getElementById('areampa').textContent = 'Current MPA reef size: '+Math.round(MPAreefarea)+' km2 (total area: '+Math.round(MPAarea)+' km2)'


})


////////////////////////////////////////////////////////////////////////
/////  Functions to run the Coral Nuseries - ICI predictor   ///////////
////////////////////////////////////////////////////////////////////////

// Open a modal for CN calculation on map

CNmodal= function() {

mpavector.setVisible(false)
stopMPAdraw()
cnvector.setVisible(true)


if (digireef.length == 0) {return} // if no coral models, stop

    // check if inbound Fst threshold reccomandation was already computed, if not launch the ajax request
    if (FstTR.IN.length != digireef.length ) {
      $.ajax({
          type:'POST',
          dataType: 'text',
          url:'/IFst',
          data: JSON.stringify(digireef),
          success: function(data){
              FstTR=JSON.parse(data) // receive data from server
              FstRECCN()

      }   
      })   
  } else {        FstRECCN()    }


}

// Add Fst Reccomandation and open modal 

FstRECCN = function() {

  // check which corals are checked 

  var cb = document.getElementsByClassName('checkboxes')
  subFST= [] // empty fst reccomandation
  for (var i = 0; i<cb.length; i++) { // browse across checkboxes...
      if (cb[i].checked==true) { // if checked --> add to fst reccomandation
          subFST.push(FstTR.IN[i])
      }
  }


  document.getElementById('FstrecCN').textContent = 'Fst Threshold (recommended <='+Math.min(...subFST)+')'    

  document.getElementById('modal-OCI').style.display = 'none'
  document.getElementById('modal-ICI').style.display = 'none'
  document.getElementById('modal-API').style.display = 'none'
  document.getElementById('modal-MPA').style.display = 'none'
  document.getElementById('modal-CN').style.display = 'block'

    // show button as activated, de-activate others
    document.getElementById('butici').style.backgroundColor = 'rgb(250, 242, 176)'
    document.getElementById('butoci').style.backgroundColor = 'rgb(250, 242, 176)'
    document.getElementById('butapi').style.backgroundColor = 'rgb(250, 242, 176)'
    document.getElementById('butmpa').style.backgroundColor = 'rgb(250, 242, 176)'
    document.getElementById('butcn').style.backgroundColor = 'lightgreen'

}

// function to visualize or hide the custom Fst threshold input

CNcustFst = function() {

  if (document.getElementById('cbCNcfst').checked==true) {
    document.getElementById('FstTcn').style.display = 'block'
    document.getElementById('CNfstdd').disabled = true
  } else {
    document.getElementById('FstTcn').style.display = 'none'
    document.getElementById('CNfstdd').disabled = false
  } 
}

//// functions to add an CN polygon (select from reefsource and copy coordinates)

// activate CN points drawing

// interaction for hovering on points to add
var cnpointsbrowse = new ol.interaction.Select({
layers: [reefs],
condition: ol.events.condition.pointerMove,
style: function(feature) {
  col = [0,0,255,1]
  // adaptive radius: following rapport between width of map (in pixels) and extent of map (meters)
  var extents =   map.getView().calculateExtent(map.getSize()) // this gives extent
  var e= extents[2]-extents[0] // extent long
  var width = document.getElementById('map').clientWidth // this gives the # of pixels
  var rad = (2500*width)/e // radius should always correspond 2500 m 

  if (rad<3) {rad=3} // if less than 3 pixels-> stop

  if (e<30000) {    col[3]= 0.5 
    nrad = rad
  
  } else {col[3]=1
    nrad = rad*2
  } // if zooming in -> points become transparents

  return new ol.style.Style({ 
        image: new ol.style.Circle({
              radius: nrad,
              fill: new ol.style.Fill({color: col}),
              stroke: new ol.style.Stroke({color: 'white', width: 3})
        })
      })
}
});
// interaction for selecting points --> add to the CN layer
var cnpointsselect = new ol.interaction.Select({
layers: [reefs],
  style :   new ol.style.Style({ // to hide the selected point
          image: new ol.style.Circle({
                radius: 0,
          })
        })
  })
cnpointsselect.on('select', function(evt) {
  if (evt.selected.length==1) {
  cnsource.addFeature(new ol.Feature({
    geometry: new ol.geom.Point(evt.selected[0].values_.geometry.flatCoordinates),
    name: evt.selected[0].values_.name,
    area: evt.selected[0].values_.area
  }))
}
})

// button to add points

drawcnpoints = function() {

map.removeInteraction(removeCN)
map.removeInteraction(removeCNbrowse)

if (  document.getElementById('drawcnbut').style.backgroundColor == 'white'  ) { // if interaction is not activate -> activate it!

  map.addInteraction(cnpointsbrowse);
  map.addInteraction(cnpointsselect);
  document.getElementById('drawcnbut').style.backgroundColor = 'lightgreen'
document.getElementById('removecnbut').style.backgroundColor = 'white'
} else {
document.getElementById('drawcnbut').style.backgroundColor = 'white'
map.removeInteraction(cnpointsbrowse);
map.removeInteraction(cnpointsselect);}
}

//// functions to remove an CN points

// interaction for CN removal
var removeCN = new ol.interaction.Select({
layers: [cnvector],
style :   new ol.style.Style({ // to hide the selected point
  image: new ol.style.Circle({
        radius: 0,
  })
})
});
removeCN.on('select', function(evt) {
if (evt.selected.length==1) {
  cnsource.removeFeature(evt.selected[0])
}
});

// interaction for hovering on CN to remove
var removeCNbrowse = new ol.interaction.Select({
layers: [cnvector],
condition: ol.events.condition.pointerMove,
style: function(feature) {
  col = [255,0,0,1]
  // adaptive radius: following rapport between width of map (in pixels) and extent of map (meters)
  var extents =   map.getView().calculateExtent(map.getSize()) // this gives extent
  var e= extents[2]-extents[0] // extent long
  var width = document.getElementById('map').clientWidth // this gives the # of pixels
  var rad = (2500*width)/e // radius should always correspond 2500 m 

  if (rad<3) {rad=3} // if less than 3 pixels-> stop

  if (e<30000) {    col[3]= 0.5 
    nrad = rad
  
  } else {col[3]=1
    nrad = rad*2
  } // if zooming in -> points become transparents

  return new ol.style.Style({ 
        image: new ol.style.Circle({
              radius: nrad,
              fill: new ol.style.Fill({color: col}),
              stroke: new ol.style.Stroke({color: 'white', width: 3})
        })
      })
}
});

// button to activate removal CN mode

removemcnpoints = function() {
map.removeInteraction(cnpointsbrowse);
map.removeInteraction(cnpointsselect); // remove add point interactions

if (  document.getElementById('removecnbut').style.backgroundColor == 'white'  ) { // if interaction is not activate -> activate it!

  map.addInteraction(removeCN);
  map.addInteraction(removeCNbrowse);

document.getElementById('drawcnbut').style.backgroundColor = 'white'
document.getElementById('removecnbut').style.backgroundColor = 'lightgreen'
} else {
document.getElementById('removecnbut').style.backgroundColor = 'white'
map.removeInteraction(removeCN)
map.removeInteraction(removeCNbrowse)
}
}

// function to turn off all CN drawing interactions

stopCNdraw = function() {

document.getElementById('removecnbut').style.backgroundColor = 'white'
document.getElementById('drawcnbut').style.backgroundColor = 'white'
map.removeInteraction(removeCN)
map.removeInteraction(removeCNbrowse)
map.removeInteraction(cnpointsbrowse)
map.removeInteraction(cnpointsselect)

} 

// Run MPA ajax request on server, receive result


AJAXCN = function() {

  stopCNdraw()

  // get the Fst threshold
    if (document.getElementById('cbCNcfst').checked==true) {
      var FstCN = Number(document.getElementById('FstTcn').value)
      } else { var FstCN = Number(document.getElementById('CNfstdd').value) }
  
  // check that cdigireef is not empty
  if (cdigireef.length == 0) {
    alert('Please select at least one coral model!')
    return
  }

  // check that Fst is not empty
  if ((FstCN == 0) || 
  (FstCN > 1) ||
  (FstCN <= 0)
  ) { 
    alert('Please select a valid Fst threshold!')
    return
  }

  // check that at least one MPA was drawn
  if (cnsource.getFeatures().length == 0) {
    alert('Please add at least one coral nursery to the map!')
    return
  }

  // checks for colorscale limits
      if (document.getElementById('cbcmCN').checked == true) {
        if (document.getElementById('minMcn').value=='') {
          alert('Minimal value of customized color scale is missing!')
          return
        }
        if (document.getElementById('maxMcn').value=='') {
          alert('Maximal value of customized color scale is missing!')
          return
        }
      }

  // prepare MPA data for submission
  var cnpoints = []

  // add mpa coordinates to mpapoly object (converted to 4326)
  cnsource.getFeatures().forEach(function(item) {cnpoints.push(item.values_.name)}) 

  $.ajax({
      type:'POST',
      dataType: 'text',
      url:'/CN',
      data: JSON.stringify({digitalreef: cdigireef,
         FstT : FstCN,
         Ccolor : [document.getElementById('cbcmCN').checked, document.getElementById('minMcn').value, document.getElementById('maxMcn').value],
         cn : cnpoints
        }),
        success: function(data){
          drawCN(JSON.parse(data))
      } 
  })

  // restore original CRS
  mpasource.getFeatures().forEach(function(item) {item.getGeometry().transform('EPSG:4326', 'EPSG:3857').flatCoordinates}) 


}

// Function to Draw results of MPA calcualtion on map 

drawCN = function(data) {

    // update dataR for legend updates
    dataR = data

  // clear source
  reefsSource.clear()


  for (var i=0; i<data.features.length; i++) {

      var reef = new ol.Feature({
          geometry: new ol.geom.Point(ol.proj.fromLonLat(data.features[i].geometry.coordinates)),
          name: data.features[i].properties.id,
          col : ol.color.asArray(data.features[i].properties.col),
          ind : data.features[i].properties.ICI,
          area : data.features[i].properties.area
        })  

      reefsSource.addFeature(reef) // add to source 
  
  }


  // update legend
document.getElementById('legend').style.display = 'block'

var width = document.getElementById('legendplot').clientWidth // this gives the # of pixels
var height = document.getElementById('legendplot').clientHeight // this gives the # of pixels

document.getElementById('legendtitle').innerHTML = 'CN-ICI [km2]'
makelegend(data.crs.properties.colscale[0], data.crs.properties.colscale[1], width, height, 8,4,10   )

}


// add a text box to modal with Cn number and size
cnsource.on('change', function() {
var nbcn =  cnsource.getFeatures().length
var cnarea = 0
cnsource.getFeatures().forEach( function(item) {cnarea+=(item.values_.area)})
document.getElementById('nbcn').textContent = 'Number of coral nurseries: '+nbcn+' ('+Math.round(cnarea)+' km2)'
})


////////////////////////////////////////////////////////////////////////
/////     Function produce export results of DRAPEAU         ///////////
////////////////////////////////////////////////////////////////////////

// export as PDF 

var exportOptions = {
filter: function(element) {
  return element.className ? element.className.indexOf('ol-control') === -1 : true;
}, bgcolor: 'white'
};

exportPDF = function() {

document.body.style.cursor = 'progress';

var format = 'a4'
var dim = [297, 210]
var resolution = 100
var widthPDF = Math.round(dim[0] * resolution / 25.4);
var heightPDF = Math.round(dim[1] * resolution / 25.4);
var size = map.getSize();
var viewResolution = map.getView().getResolution();

map.once('rendercomplete', function() {
  var pdf = new jsPDF('landscape', undefined, format);
  domtoimage.toJpeg(map.getViewport(), exportOptions).then(function(dataUrl) {
    pdf.addImage(dataUrl, 'JPEG', 0, 0, 297*0.7, 210*0.7); // add map to pdf

    if (document.getElementById('legendplot').children.length==1) { // if there is a legend
      // add legend!
      domtoimage.toJpeg(document.getElementById('legendtitle'), { "bgcolor": 'white' }) // title
      .then(function (dataUrl) {
        pdf.addImage(dataUrl, 'JPEG', 297*0.7, 0); 
        domtoimage.toJpeg(document.getElementById('legendSVG'), { "bgcolor": 'white' }) // scalebar
      .then(function (dataUrl) {
       pdf.addImage(dataUrl, 'JPEG', 297*0.7, 10); 
       pdf.save('map.pdf');
      });
      }); 
    } else {
      pdf.save('map.pdf'); // if no legend -> save
    }

    // Reset original map size
    map.setSize(size);
    map.getView().setResolution(viewResolution);
    document.body.style.cursor = 'auto';
  });

  
});

// Set print size
var printSize = [widthPDF, heightPDF];
map.setSize(printSize);
var scaling = Math.min(widthPDF / size[0], heightPDF / size[1]);
map.getView().setResolution(viewResolution / scaling);



}

// export as geoJSON

exportGEOJSON = function() {

  var output = JSON.parse(JSON.stringify(reefsNC)) // use reefs NC as model
  output.features = [] // remove dummy features

  for (var i in reefsSource.getFeatures()) {

    output.features.push({
      "type": "Feature", 
      "properties": {
          "id" : reefsSource.getFeatures()[i].getProperties().name,
          "index" : reefsSource.getFeatures()[i].getProperties().ind,
          "area" : reefsSource.getFeatures()[i].getProperties().area },
      "geometry" : { 
        "type" : "Point", 
        "coordinates":  reefsSource.getFeatures()[i].getGeometry().getCoordinates()
      }
    })
  }

  var dataout = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(output));

  var download = document.createElement('a')
  download.href = 'data:'+dataout
  download.download = 'drapeau.geojson'
  download.click()
}

// export as csv

exportCSV = function() {

  var csvcontent = 'id,index,longitude,latitude,area\n'

  for (var i in reefsSource.getFeatures()) {

    csvcontent=csvcontent+
    reefsSource.getFeatures()[i].getProperties().name+','+
    reefsSource.getFeatures()[i].getProperties().ind+','+
    reefsSource.getFeatures()[i].getGeometry().getCoordinates()[0]+','+
    reefsSource.getFeatures()[i].getGeometry().getCoordinates()[1]+','+
    reefsSource.getFeatures()[i].getProperties().area+'\n'

  }

  var dataout = "text/csv;charset=utf-8," + encodeURIComponent(csvcontent)

  var download = document.createElement('a')
  download.href = 'data:'+dataout
  download.download = 'drapeau.csv'
  download.click()
}

digireeftab()


adaptYN()
createCMplot()
createCMplotA()

