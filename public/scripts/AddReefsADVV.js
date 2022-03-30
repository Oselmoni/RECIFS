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
      tempVSfix()
  
  
    }
  
  }
   
  
  ////////////////////////////////////////////////////////////////////////
  /////  Functions to set advanced mode requests    //////////////////////
  ////////////////////////////////////////////////////////////////////////
  
  var selvar = document.getElementById('advSELVAR')
  
  // add options to select variable based metadata
  Object.keys(metaVAR).forEach(function(item) {
    nop = document.createElement('option')
    nop.innerText = metaVAR[item].varNAMELL
    nop.id = item
    selvar.appendChild(nop)
  })
  
  selvar.onchange = function() {
    tempVSfix()
  }
  
  // function to show menu for temporal vs fixed mode
  
  tempVSfix = function() {

    // identify selected option
    var selopt = document.getElementById('advSELVAR').selectedOptions[0].id

    // add buffer options 
    var advSELbuf = document.getElementById('advSELbuf')
    advSELbuf.innerHTML=''
    metaVAR[selopt].varBuf.split(',').forEach(function(item) {
        nop = document.createElement('option')
        nop.innerText = metaSTAT[item].statLEGEND
        nop.id = item
        advSELbuf.appendChild(nop)
      })

    if (metaVAR[selopt].varTime=='-') {  // if variable without temporal resolution...
      // de-activate temporal menu
      document.getElementById('advTIME').style.display = 'none'
  
    } else { // if variable with temporal resolution...

      // activate temporal menu
      document.getElementById('advTIME').style.display = 'block'
  
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
    advreqO.typeVAR = metaVAR[advreqO.envvar].varTime
    advreqO.buffer = document.getElementById('advSELbuf').selectedOptions[0].id

    if (advreqO.typeVAR!='-') {    // if variable with temporal resolution: add data on time

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
  
  