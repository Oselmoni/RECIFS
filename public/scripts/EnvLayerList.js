//////////////////////////////////////////////////////////////////
/////////////// Write/update layers list              ////////////
///////////////////////////////////////////////////////////////////

// load variables metdata

var metaVAR = JSON.parse(metaVAR)
var metaSTAT = JSON.parse(metaSTAT)

var evar = '' // environmental variable currently plotted
var dataR // data arriving from server
var dataRadv // data arriving from server (advanced version)


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
        var statid = stat.split('_')[1] // id of the stat
        if (statid=='X') {var statid = stat.split('_')[2]} // if a fixed variable --> use buffer size as stat id
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


///////////////////