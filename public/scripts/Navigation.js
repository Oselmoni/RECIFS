////////////////////////////////////////////////////////////////////////
/////     Naviagation functionalities   (hide/unhide/open/close panels-buttons)                            ///
////////////////////////////////////////////////////////////////////////// 

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


