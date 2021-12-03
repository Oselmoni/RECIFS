////////////////////////////////////////////////
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
