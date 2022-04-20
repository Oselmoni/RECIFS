// script to create tutorial information to guide the user

///////////////////////////////////////////////////////////////
////////////////    Hints from tutorial        ////////////////
///////////////////////////////////////////////////////////////

// variable to check if AOI is OK 
var AOIok = false

// the runHints function will call the different steps of the tutorial, following the counter "hintSteps"
runHints = function(hintSteps) {

 if (hintSteps==0) { // 0 --> welcome to tutorial

      // disable all buttons at start-up of tutorial
      document.getElementById('drawAOIbutton').disabled= true
      document.getElementById('topBUTpoi').disabled= true
      document.getElementById('topBUTbg').disabled= true
      document.getElementById('addDown').disabled= true
        
      // send welcome message
      document.getElementById('hints').innerHTML = 
                                  'Welcome to the tutorial of RECIFS! '+
                                  '<br>In this tutorial, you will learn how to use the different functionalities of RECIFS.'+
                                  '<br>Plese follow the instructions displayed in the black boxes.'+
                                  '<br><button onclick="{runHints(1)}"> Let\'s start! </button>'



 } else if (hintSteps==1) { // 1 -->  study area intro
    document.getElementById('hints').innerHTML = 'The first step is selecting an area of interest. '+
    'Any region of the world hosting coral reefs can be selected. <br>'+
    'There are no particular restriction in size, but bear in mind that if you select very large areas the computations of RECIFS will be slower.'+
    '<br><button onclick="runHints(2)"> Next </button>'


} else if (hintSteps==2) { // 2 --> red sea poly

  // add red sea to map
  map.addLayer(RSvector)


  document.getElementById('hints').innerHTML =  'In this tutorial, we will focus on the reefs of the Red Sea.'+
   'Use the interactive map to find the Red Sea (highlighted in red on the map).'+
  '<br><button onclick="runHints(3)"> Next </button>'

} else if (hintSteps==3) { // 3 --> select a study area

  // activate button study area
  document.getElementById('drawAOIbutton').disabled= false

  document.getElementById('hints').innerHTML = 'To select a study area, click on the STUDY AREA button first.<br>'+
  'Next, draw the area of interest directly on the map. Make sure to include the Red Sea region.  '

} else if (hintSteps==4) { // 4 --> environnmental variation intro

  // activate/de-activate buttons study area
  document.getElementById('drawAOIbutton').disabled= true
  AOIok = true

  // remove indicator red sea
  map.removeLayer(RSvector)

  document.getElementById('hints').innerHTML = 
  'Now that you selected an area of interest, you can visualize environmental variation across the reef system.<br>'+
  'To do so, click on the ENVIRONMENT button.'


} else if (hintSteps==5) { // 5 --> environnmental variation: standard

  document.getElementById('ambutton').disabled=true
  document.getElementById('stmbutton').disabled=false
  document.getElementById('stmbutton').style.backgroundColor=null

  document.getElementById('hints').innerHTML = 
  'The ENVIRONMENT menu displays a list of environmental variables describing the seascape conditions.<br>'+
  'By clicking on the buttons next to each variable, you can visualize different statistics for every reef of the area of interest.<br>'+
  'For example, the <button class="ENVstatB">mean</button> button will display the average values for a given variable.'+
  '<br><button onclick="runHints(6)"> Next </button>'

} else if (hintSteps==6) { // 6 --> environnmental variation: standard info

  document.getElementById('hints').innerHTML = 
  'If you want to find out more about an environmental variable, you can click on the <button class="ENVinfoB">i</button> button.<br>'+
  'This will open a window displaying information about the source of the variable, the temporal range covered and the spatial resolution.'+
  '<br><button onclick="runHints(7)"> Next </button>'

} else if (hintSteps==7) { // 7 --> environnmental variation: standard vs advanced

  document.getElementById('hints').innerHTML = 
  'The environmental variables that you visualized so far are the "standard variables" of RECIFS.<br>'+
  'These variables are precomputed to represent long-lasting environmental trends.'+
  '<br><button onclick="runHints(8)"> Next </button>'

} else if (hintSteps==8) { // 8 --> environnmental variation: to advanced

  document.getElementById('ambutton').disabled=false
  document.getElementById('ambutton').style.backgroundColor=null
  
  document.getElementById('hints').innerHTML = ''+
  'It is also possible to customize the computation of environmental variables using the "Advanced mode".<br>'+
  'You can access this mode by clicking on the ADVANCED button in the environmental menu.'

} else if (hintSteps==9) { // 9 --> environnmental variation: advanced mode buffer
  
// turn off ADMOD() function
  ADMOD = function() {}

// turn off button standard mode
  document.getElementById('stmbutton').disabled=false
  document.getElementById('stmbutton').style.backgroundColor=null


  document.getElementById('hints').innerHTML = 
  'In the "Advanced mode", you can customize the calculation of environmental variables.<br>'+
  'First, you can select any environmental variable, and calculate its value across buffer areas of different size surrounding the reefs of the area of interest.'+
  '<br><button onclick="runHints(10)"> Next </button>'

} else if (hintSteps==10) { // 10 --> environnmental variation: advanced mode time
  
  document.getElementById('hints').innerHTML = 
  'You can also estimate trends for specific time periods. <br>'+
  'You can focus on a specific temporal window (starting to ending year), and also on a specific seasons (select months of interest). <br>'+
  '<button onclick="runHints(11)"> Next </button>'


} else if (hintSteps==11) { // 11 --> environnmental variation: advanced mode function
  
  document.getElementById('hints').innerHTML = 
  'Next, you can decide which function to use to summarize the environmental trends for the temporal period that you selected. <br>'+
  'The available functions are mean, standard deviation, median, minimum value and maximum value. <br>'+
  '<button onclick="runHints(12)"> Next </button>'

} else if (hintSteps==12) { // 12 --> environnmental variation: advanced mode boundaries and colors
  
  document.getElementById('hints').innerHTML =
  'Finally, you can customize the representation of the environmental variable on the map. <br>'+
  'You can do this by modyfing the limits of the colorscale used, as well as the colors employed in the representation<br>'+
  '<button onclick="runHints(13)"> Next </button>'

} else if (hintSteps==13) { // 13 --> environnmental variation: advanced mode RUN
  
  document.getElementById('hints').innerHTML =
  'Once you have set all the parameters of the "Advanced mode", you can click on the RUN button to visualize the custom environmental variable on the map. <br>'+
  '<button onclick="runHints(14)"> Next </button>'

} else if (hintSteps==14) { // 14 --> to sea currents
  
  document.getElementById('topBUTsc').disabled=false

  document.getElementById('hints').innerHTML =
   'RECIFS can also be used to display sea currents across the reefs of the area of interest. <br>'+
  'To add sea currents to the map, click on the SEA CURRENT button'

} else if (hintSteps==15) { // 15 --> to sea currents
  
  document.getElementById('topBUTsc').disabled=true

  document.getElementById('hints').innerHTML =
  'In the sea current menu, you can set the parameters to display sea current averages on the map. <br>'+
  'You can visualize sea current averages for the entire year, or for specific months only. <br>'

} else if (hintSteps==16) { // 16 -->  sea currents resolution
  
  document.getElementById('hints').innerHTML =
  'Sea currents are displayed at two levels of spatial resolution that are automatically adjusted to the zoom level on the map. <br>'+
  '<button onclick="runHints(17)"> Next </button>'

} else if (hintSteps==17) { // 17 --> to display settings

  document.getElementById('topBUTbg').disabled=false

  document.getElementById('hints').innerHTML =
  'The rendering of layers on the map can be modified using the "Display Setting" menu. <br>'+
  'Click on the DISPLAY SETTING button to open this menu'

 } else if (hintSteps==18) { // 18 -> display settings

  document.getElementById('topBUTbg').disabled=true

  document.getElementById('hints').innerHTML =
  'The display setting menu can be used to modify the visual properties of the map.<br>'+
  'You can select three different background maps and also activate a greyscale rendering.<br>'+
  '<button onclick="runHints(19)"> Next </button>'

} else if (hintSteps==19) { // 19 -> display settings

  document.getElementById('hints').innerHTML =
  'In addition, you can reduce the opacity/transparency of environmental data, and decide whether to show or hide legends on the map. <br>'+
  '<button onclick="runHints(20)"> Next </button>'

} else if (hintSteps==20) { // 20 -> to points of interest 

  document.getElementById('topBUTpoi').disabled=false


  document.getElementById('hints').innerHTML =
  'Another functionality of RECIFS is the definition of "Points of Interest" <br>'+
  'These points can be reef locations for which you want to extract precise environmental values.<br>'+
  'To activate this functionality, click on the POINTS OF INTEREST button.'

} else if (hintSteps==21) { // 21 ->  points of interest 

  document.getElementById('topBUTpoi').disabled=true

  document.getElementById('hints').innerHTML =
  'There are two ways of adding point of interest to the map.<br>'+
  'The first one is an interactive mode, activated/de-activated by clickign on the "Add on map" button <br>'+
  'When using this mode, you can add points by simply clicking on the map at the location of interest, and then specify the name of the location. <br>'+
  '<button onclick="runHints(22)"> Next </button>'

} else if (hintSteps==22) { // 22 ->  points of interest batch add


  document.getElementById('hints').innerHTML =
  'Alternatively, you can load the points of interest from a .csv file indicating the coordinates of the locations. <br>'+
  '<button onclick="runHints(23)"> Next </button>'

} else if (hintSteps==23) { // 23 ->  points of interest remove

  document.getElementById('hints').innerHTML =
  'The points of interest are displayed in purple on the map, and can be removed using the dedicated buttons.<br>'+
  'The "Remove from map" button activates/de-activates an interactive mode to remove points upon click on the map. <br>'+
  'The "Remove all" button removes all the points of interest shown on map. <br>'+
  '<button onclick="runHints(24)"> Next </button>'

} else if (hintSteps==24) { // 24 ->  to DWN

  document.getElementById('topBUTdwn').disabled=false

  document.getElementById('hints').innerHTML =
  'All the data displayed by RECIFS are available for download. <br>'+
  'To activate the download menu, click on the DOWNLOAD button'

} else if (hintSteps==25) { // 25 ->  download PDF

  document.getElementById('topBUTdwn').disabled=true

  document.getElementById('hints').innerHTML =
  'There are two download formats that can be used. <br>'+
  'The first one is a PDF version of the map displayed in the RECIFS interface. <br>'+
  'To download the map under this format, click on the "Map as PDF" button.  <br>'+
  '<button onclick="runHints(26)"> Next </button>'

} else if (hintSteps==26) { // 26 ->  download CSV -1

  document.getElementById('hints').innerHTML =
  'The second option is the download of the RECIFS data in a tabular .csv format.<br>'+
  'The table contains all the reefs displayed on the map as rows (with coordinates), and a set of environmental variables as columns. <br>'+
  '<button onclick="runHints(27)"> Next </button>'

} else if (hintSteps==27) { // 27 ->  download CSV -2

  document.getElementById('hints').innerHTML =
  'By clicking on the "Reef data as CSV table" button, you can activate the menu to select which environmental variable to download.<br>'+
  'Note that all the standard variables can be added/removed to/from the "Download List" using the arrow buttons.<br>'+
  '<button onclick="runHints(28)"> Next </button>'

} else if (hintSteps==28) { // 28 ->  download CSV -3

  document.getElementById('addDown').disabled=false

  document.getElementById('hints').innerHTML =
  'Note also that it is also possible to download custom environmental variables computed in the advanced mode. '+
  'To do so, you first need to compute the variable and visualize it on the map. '+
  'Next, click on the <img style="width:0.7cm" src="public/buttons/buttonADD.svg"> button (located on the left of the map).<br>'+
  'This will add to the download list the variable currently displayed in the map .<br>'+
  '<button onclick="runHints(29)"> Next </button>'

} else if (hintSteps==29) { // 29 ->  download CSV -4


  document.getElementById('hints').innerHTML =
  'Note also that you can restrict the download of environmental data to the Points of Interest. <br>'+
  'To do so, you simply have to check the corresponding box in the bottom of the download menu.<br>'+
  '<button onclick="runHints(30)"> Next </button>'

} else if (hintSteps==30) { // 30 ->  END

  document.getElementById('topBUTdwn').disabled=true
  removeDWN()
  document.getElementById('topBUTsup').disabled=false

  document.getElementById('hints').innerHTML =
  'This is it! You now have a complete overview of the different functionalities of RECIFS. <br>'+
  'Use the SUPPORT button and contact us if you need additional information.'+
  '<button onclick="runHints(31)"> Next </button>'

}  else if (hintSteps==31) { // 31 ->  END

  document.getElementById('hints').innerHTML =
  'Click here below to be redirected to the full version of RECIFS. <br>'+
  '<button onClick="window.location=\'/\'"> Go to RECIFS </button>'

}



}



// run hints at start-up of webpage

runHints(0)

///////////////////////////////////////////////////////////////
////////////////    Polygon of Red Sea area    ////////////////
///////////////////////////////////////////////////////////////

// create a polygon of the study area in the red sea
var RScoord = [ [
  [
    4841792.237270103,
    1445536.6129810035
  ],
  [
    4819683.596917272,
    1508177.7606473602
  ],
  [
    4760727.222643054,
    1769796.6714891994
  ],
  [
    4749672.902466638,
    1913502.8337826042
  ],
  [
    4624390.607133927,
    2071948.089644564
  ],
  [
    4491738.765016938,
    2307773.5867414344
  ],
  [
    4421728.070566304,
    2326197.4537021248
  ],
  [
    4344347.829331394,
    2488327.4829562223
  ],
  [
    4344347.829331394,
    2595185.911328244
  ],
  [
    4244858.947743652,
    2764685.487366617
  ],
  [
    4160109.1597244646,
    2808902.7680722782
  ],
  [
    4145370.06615591,
    2856804.8221700825
  ],
  [
    4145370.06615591,
    2908391.649660024
  ],
  [
    3905859.7956669033,
    3265814.6686974647
  ],
  [
    3861642.5149612385,
    3262129.8953053253
  ],
  [
    3894805.475490486,
    3442683.7915201164
  ],
  [
    3824794.781039854,
    3251075.5751289097
  ],
  [
    3784262.2737263297,
    3232651.708168217
  ],
  [
    3611077.9242958156,
    3494270.619010056
  ],
  [
    3625817.01786437,
    3398466.5108144525
  ],
  [
    3810055.6874712985,
    3018934.851424181
  ],
  [
    3950077.0763725643,
    2731522.526837369
  ],
  [
    3968500.9433332584,
    2613609.7782889353
  ],
  [
    4093783.23866597,
    2480957.936171944
  ],
  [
    4152739.6129401876,
    2337251.773878541
  ],
  [
    4167478.7065087417,
    2130904.4639187814
  ],
  [
    4329608.73576284,
    1972459.2080568194
  ],
  [
    4362771.696292087,
    1773481.4448813375
  ],
  [
    4524901.725546185,
    1648199.1495486253
  ],
  [
    4628075.380526065,
    1578188.4550979915
  ],
  [
    4779151.089603747,
    1423427.9726281697
  ],
  [
    4841792.237270103,
    1445536.6129810035
  ]
] ] 

// add the red sea polygon to the map

var RSsource = new ol.source.Vector({
  format: new ol.format.GeoJSON(),
  });
  
var RSvector = new ol.layer.Vector({
  source: RSsource ,
  style: new ol.style.Style({ 
    fill: new ol.style.Fill({ color: 'rgba(255,0,0,0.2)' }),
    stroke: new ol.style.Stroke({ color: 'red', width: 1 })
  })
  }); 

  RSsource.addFeature(new ol.Feature({
    geometry: new ol.geom.MultiPolygon([RScoord]),
    name: 'RedSEA'
  }))



///////////////////////////////////////////////////////////////
////////////////    Check AOI                  ////////////////
///////////////////////////////////////////////////////////////

// function to check if AOI from user is correct (covers the red sea area)

// function is triggered when AOI changes
AOIsource.on('addfeature', function() {
  
  // polygon of red sea area
  var RSpoly =  turf.polygon(RScoord)

  // polygon of user-drawn AOI
  var AOIpoly = turf.polygon(AOIsource.getFeatures()[0].getGeometry().getCoordinates())

  // intersect AOI - RS
  var INTpoly = turf.intersect(AOIpoly, RSpoly)

  // compute area
  var areaRS = RSsource.getFeatures()[0].getGeometry().getArea()   // Red Sea
  var areaAOI = AOIsource.getFeatures()[0].getGeometry().getArea() // Area of Interest
  if (turf.intersect(AOIpoly, RSpoly)==undefined) {var areaINT=0} else { // intersect Red Sea/AOI
    // create interaction polygon in openlayers format
    var INTpolyOL = new ol.Feature({
      geometry: new ol.geom.Polygon(INTpoly.geometry.coordinates),
    })
    // get area
    var areaINT = INTpolyOL.getGeometry().getArea()
  }

  // check if area is correct ...
  var COND1 = areaINT/areaRS>0.8  // if the Red Sea area is covered
  var COND2 = areaRS/areaAOI>0.2  // AOI does not excessively exceed the Red Sea area 

  if (COND1==true&COND2==true) {
      runHints(4)
  } else {

    
      alert('Please select an area that contains (only) the entire Red Sea region.')
      AOIsource.clear()
      document.getElementById('topBUTenv').disabled= true
      document.getElementById('topBUTsc').disabled= true
      document.getElementById('topBUTbg').disabled= true
      document.getElementById('addDown').disabled= true
  } 
})



///////////////////////////////////////////////////////////////
////////////////    Append code to existing functions//////////
///////////////////////////////////////////////////////////////


// modify addReefs function to prevent from turning on all naviagation/buttons

addReefs = (function() {
  var old_addReefs = addReefs;

  return function() {
      // keep original function
     old_addReefs.apply(this, arguments); // use .apply() to call it

      // add content
      document.getElementById('topBUTbg').disabled= true
      document.getElementById('topBUTsc').disabled= true
      document.getElementById('topBUTdwn').disabled= true

      if (AOIok) {      document.getElementById('topBUTenv').disabled= false  
                        AOIok=false
    
    } else {       document.getElementById('topBUTenv').disabled= true    }

  };
})();


// modify showENV() function to launch hints and avoid going back

showENV = (function() {
  var old_showENV = showENV;

  return function() {
      // keep original function
     old_showENV.apply(this, arguments); // use .apply() to call it

      // add content
      document.getElementById('topBUTenv').disabled= true // disable button
      
      // launch hint 
      runHints(5)

  };
})();


// turn off  STMOD() function 

STMOD = function() {}

// turn off buttons to close panels

document.getElementById('hideENV').disabled=true
document.getElementById('hideSC').disabled=true
document.getElementById('hideBG').disabled=true
document.getElementById('hidePOI').disabled=true
document.getElementById('hideDWN').disabled=true
document.getElementById('hideDWN').disabled=true
document.getElementById('topBUTsup').disabled=true


// // modify ADMOD() function to launch hints and avoid going back

ADMOD = (function() {
  var old_ADMOD = ADMOD;

  return function() {
      // keep original function
     old_ADMOD.apply(this, arguments); // use .apply() to call it
      
      // launch hint 
      runHints(9)

  };
})();


// modify showENV() function to launch hints and avoid going back

showSC = (function() {
  var old_showSC = showSC;

  return function() {
      // keep original function
     old_showSC.apply(this, arguments); // use .apply() to call it

      
      // close env panel
      removeENV()

      // launch hint 
      runHints(15)

  };
})();


// modify addSC function to prevent from turning on all naviagation/buttons

addCurrents = (function() {
  var old_addCurrents = addCurrents;

  return function() {
      // keep original function
     old_addCurrents.apply(this, arguments); // use .apply() to call it

      // call hints
      runHints(16)

  };
})();

// modify showBG() function to launch hints and avoid going back

showBG = (function() {
  var old_showBG = showBG;

  return function() {
      // keep original function
     old_showBG.apply(this, arguments); // use .apply() to call it

      
      // close env panel
      removeSC()

      // launch hint 
      runHints(18)

  };
})();


// modify showPOI() function to launch hints and avoid going back

showPOI = (function() {
  var old_showPOI = showPOI;

  return function() {
      // keep original function
     old_showPOI.apply(this, arguments); // use .apply() to call it

      
      // close env panel
      removeBG()

      // launch hint 
      runHints(21)

  };
})();


// modify showDWN() function to launch hints and avoid going back

showDWN = (function() {
  var old_showDWN = showDWN;

  return function() {
      // keep original function
     old_showDWN.apply(this, arguments); // use .apply() to call it

      
      // close env panel
      removePOI()

      // launch hint 
      runHints(25)

  };
})();


