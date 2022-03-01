///////////////////////////////////////////////////////////////////
/////////////// Add reefs to the map (standard v.) ////////////////
///////////////////////////////////////////////////////////////////

// function to add reefs to the map
var mode = 'standard' // current computation mode (standard or advanced)

addReefs = function(nevar, data) {

  evar=nevar


  if (evar == '') { }
  else {

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
}

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
