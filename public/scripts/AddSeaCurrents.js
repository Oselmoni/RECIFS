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
  
  // prompt info on sea currents

  promptInfoSC = function() {

    // open modal with info on variable
    document.getElementById('infoMOD').style.display = 'block'
  
    // set title of modal as name of the variable
   document.getElementById('infoVARname').innerHTML = 'Surface currents direction'
  
   // set text content of modal  with information on variable
   document.getElementById('infoVARtxt').innerHTML = 
   'Sea current direction and velocity were computed using the dataset describing surface water movement from '+ metaVAR.SCV.varSource+
   '(dataset ID: '+metaVAR.SCV.varDatasetID+').<br>'+
   'The original dataset features spatial resolution of '+metaVAR.SCV.varRes+' and covers a temporal window spanning '+metaVAR.SCV.varTime+
   '<br>The original dataset is available at: <a href="'+metaVAR.SCV.varLINK+'" target="_blank" style="color: yellow">'+metaVAR.SCV.varLINK+'</a>'
 
  
  }