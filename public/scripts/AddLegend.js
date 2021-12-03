////////////////////////////////////////////////////////////////////////
/////  Function to compute a colorscale legend (reefs)   //////////////////////
////////////////////////////////////////////////////////////////////////

makelegend = function(cols, ltext, lwidth, lheight, fontsize, px, py) {

    // get height of legend txt
    var LTH = document.getElementById('legendtitle').clientHeight
  
    // set height of legend plot
    document.getElementById('legendplot').style.height = document.getElementById('legend').clientHeight-LTH+'px'
  
    var lheight = document.getElementById('legend').clientHeight-LTH
  
    // set legend checkbox as checked
    document.getElementById('cblegend').checked = true
  
    var nsteps = cols.length+1
    
    var div = d3.select("#legendplot") // get div
    
    // remove children (already loaded legend, if any)
    document.getElementById('legendplot').innerHTML = ''  
    
    var dy = (lheight-py*2)/nsteps // height of each box
  
    // create new legend
    var svg = div.append('svg')
        .attr('width', lwidth)
        .attr('height', lheight)
        .attr('id', 'legendSVG')
  
    
    
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
  
    // add missing values box
    svg.append('rect')
    .attr('width', (lwidth-px*2)/2)
    .attr('height', dy)
    .attr('y',ipy)
    .attr('x',px)
    .attr('fill', '#8c8c8c')
    .attr('stroke', 'black')
    .attr('stroke-width', '1')
    ipy=ipy+dy 
  
     // add frame
     svg.append('rect')
     .attr('stroke', 'black')
     .attr('stroke-width', '1')
     .attr('fill-opacity', '0')
         .attr('y', py)
         .attr('x', px)
         .attr('width', (lwidth-px*2)/2)
         .attr('height', lheight-(py*2))
  
    // add text 
    
    var ipy = py+(dy/2) // iterative padding variable
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
      ipy=ipy+(dy)
    }
  
  
    // add text for missing value
  
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
      .text('NA')
      .attr('font-size', fontsize)
    
    
    }
    
  
  // function to hide/unhide legend
  
  hidelegend = function() {
    
    if (document.getElementById('cblegend').checked == true) {
      document.getElementById('legend').style.display = 'block'
     } else {
      document.getElementById('legend').style.display = 'none'
      }
  }
  

////////////////////////////////////////////////////////////////////////
///  Function to compute a colorscale legend for Sea Current Velocity  /////
////////////////////////////////////////////////////////////////////////

makelegendSC = function(cols, ltext, lwidth, lheight, fontsize, px, py) {

    // check box for sea-current display 
    document.getElementById('cblegendSC').checked = true
  
    var nsteps = cols.length
    
    var div = d3.select("#legendplotSC") // get div
    
    // remove children (already loaded legend, if any)
    document.getElementById('legendplotSC').innerHTML = ''  
    
    var dx = (lwidth-px*2)/nsteps // width of each box
    var dy = lheight*0.4 // width of each box
  
    // create new legend
    var svg = div.append('svg')
        .attr('width', lwidth)
        .attr('height', lheight)
        .attr('id', 'legendSVGSC')
  
    
    // add boxes gradient
    var ipx = px // iterative padding variable
    for (i in cols) {
      svg.append('rect')
      .attr('width', dx)
      .attr('height', dy)
      .attr('y',py)
      .attr('x',ipx)
      .attr('fill', cols[i])
      ipx=ipx+dx
    }
  
   // add legend frame
   svg.append('rect')
   .attr('stroke', 'black')
   .attr('fill-opacity', '0')
   .attr('stroke-width', '1')
       .attr('y', py)
       .attr('x', px)
       .attr('width', lwidth-(px*2))
       .attr('height', dy )
  
  
    // add text 
    var ipx = px+(dx/2) // iterative padding variable
    for (i in ltext) {
  
      svg.append('line')
      .attr('x1', ipx)
      .attr('x2', ipx)
      .attr('y1', dy+py+10)
      .attr('y2', dy+py)
      .attr('stroke', 'black')
      .attr('stroke-width', '3')
    
      svg.append('text')
      .attr('x', ipx)
      .attr('y', dy+py+10+fontsize)
      .attr('text-anchor', 'middle')
      .text(ltext[i])
      .attr('font-size', fontsize)
      ipx=ipx+(dx)
     }
    
    }
    
    // update legend on resize window
      
  window.onresize = function() {
      if (dataSC!=undefined) {
      // update legend
      var width = document.getElementById('legendplotSC').clientWidth // this gives the # of pixels
      var height = document.getElementById('legendplotSC').clientHeight // this gives the # of pixels
      makelegendSC(dataSC.colorscale, dataSC.colorscaleBRK, width, height, 18,10,4   )
    } 
  
    if (mode=='standard') {
      if (dataR!=undefined) {
      // update legend
      var width = document.getElementById('legendplot').clientWidth // this gives the # of pixels
      var height = document.getElementById('legendplot').clientHeight // this gives the # of pixels
      makelegend(dataR.meta.colscale, dataR.meta.colscaleBRKS[evar], width, height, 18,4,10   )
    } 
    } else if (mode=='advanced') {
      if (dataRadv!=undefined) {
        // update legend
        var width = document.getElementById('legendplot').clientWidth // this gives the # of pixels
        var height = document.getElementById('legendplot').clientHeight // this gives the # of pixels
        makelegend(dataRadv.meta.colscale, dataRadv.meta.colscaleBRKS[evaradv], width, height, 18,4,10   )
      } 
    }
    }
  
  
  // function to hide/unhide legend SC
  
  hidelegendSC = function() {
    
    if (document.getElementById('cblegendSC').checked == true) {
      document.getElementById('legendSC').style.display = 'block'
     } else {
      document.getElementById('legendSC').style.display = 'none'
      }
  }
  