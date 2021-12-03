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

