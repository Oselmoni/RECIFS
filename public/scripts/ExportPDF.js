////////////////////////////////////////////////////////////////////////
/////     EXPORT map as PDF                                  ///////////
////////////////////////////////////////////////////////////////////////

// export as PDF 

var exportOptions = {
  filter: function(element) {
    return element.className ? element.className.indexOf('ol-control') === -1 : true;
  }, bgcolor: 'white'
  };
  
exportPDF = function() {
  

// get width and height of map
var width = document.getElementById('map').clientWidth // this gives the # of pixels
var height = document.getElementById('map').clientHeight
  
document.body.style.cursor = 'progress';
  
var dim = [width, height]
var widthPDF = Math.round(dim[0] * 1); //modify here (1) to increase/lower resolution 
var heightPDF = Math.round(dim[1] * 1);
var size = map.getSize();
var viewResolution = map.getView().getResolution();
  
var scfactor = 2 // scaling factor to determine size of output

var orientation = 'p'
if (width>=height) {orientation='l'}



// set function to perform once when render is completed
map.once('rendercomplete', function() {
    var pdf = new jsPDF(orientation, undefined, [width/scfactor, height/scfactor]);
    domtoimage.toJpeg(map.getViewport(), exportOptions).then(function(dataUrl) {
    
      pdf.addImage(dataUrl, 'JPEG', 0, 0, width/scfactor, height/scfactor); // add map to pdf
      
        if (document.getElementById('cblegend').checked==false&document.getElementById('cblegendSC').checked==false) { // if there are no legends...
          pdf.save('map.pdf'); 
        
        } else { // if there is at least one legend

        // get position of legend elements on map...
        var pmx = document.getElementById('map').getBoundingClientRect().left // padding of map margin on x axis
        var pmy = document.getElementById('map').getBoundingClientRect().top // padding of map on y axis

        // elements of legend...
        var plx = document.getElementById('legend').getBoundingClientRect().left // padding of legend on x axis
        var ply = document.getElementById('legend').getBoundingClientRect().top // paddng of legend on y axis 

        var posLx = plx/scfactor - pmx/scfactor // position of legend in map (x axis)
        var posLy = ply/scfactor - pmy/scfactor // position of legend in map (y axis)

        var LTwidth = document.getElementById('legendtitle').clientWidth/scfactor // width of legend title
        var LTheight = document.getElementById('legendtitle').clientHeight/scfactor // height of legend title

        // elements of legend of sea currents
        var plxSC = document.getElementById('legendSC').getBoundingClientRect().left // padding of legend on x axis
        var plySC = document.getElementById('legendSC').getBoundingClientRect().top // paddng of legend on y axis 

        var posLxSC = plxSC/scfactor - pmx/scfactor // position of legend in map (x axis)
        var posLySC = plySC/scfactor - pmy/scfactor // position of legend in map (y axis)

        var LTwidthSC = document.getElementById('legendtitleSC').clientWidth/scfactor // width of legend title
        var LTheightSC = document.getElementById('legendtitleSC').clientHeight/scfactor // height of legend title
      
        // different types of output, depending if legends are displayed or not      
        if (document.getElementById('cblegend').checked==true&document.getElementById('cblegendSC').checked==false) { // if there is a legend for environmental, but not for SC

          var LPwidth = document.getElementById('legendSVG').clientWidth/scfactor // width of legend plot
          var LPheight = document.getElementById('legendSVG').clientHeight/scfactor // height of legend plot

          domtoimage.toJpeg(document.getElementById('legendtitle'), { "bgcolor": 'white' }) // title
        .then(function (dataUrl) {
          pdf.addImage(dataUrl, 'JPEG', posLx, posLy, LTwidth, LTheight); 
          domtoimage.toJpeg(document.getElementById('legendSVG'), { "bgcolor": 'white' }) // scalebar
        .then(function (dataUrl) {
         pdf.addImage(dataUrl, 'JPEG', posLx, posLy+LTheight,  LPwidth, LPheight ); 
         pdf.save('map.pdf'); 
        });
        }); 
      } else if (document.getElementById('cblegend').checked==false&document.getElementById('cblegendSC').checked==true) { // if there is legend for SC, but not for env

        var LPwidthSC = document.getElementById('legendSVGSC').clientWidth/scfactor // width of legend plot
        var LPheightSC = document.getElementById('legendSVGSC').clientHeight/scfactor // height of legend plot

        domtoimage.toJpeg(document.getElementById('legendtitleSC'), { "bgcolor": 'white' }) // title
        .then(function (dataUrl) {
          pdf.addImage(dataUrl, 'JPEG', posLxSC, posLySC, LTwidthSC, LTheightSC); 
          domtoimage.toJpeg(document.getElementById('legendSVGSC'), { "bgcolor": 'white' }) // scalebar
        .then(function (dataUrl) {
         pdf.addImage(dataUrl, 'JPEG', posLxSC, posLySC+LTheightSC,  LPwidthSC, LPheightSC ); 
         pdf.save('map.pdf'); 
        });
        }); 
      } else if (document.getElementById('cblegend').checked==true&document.getElementById('cblegendSC').checked==true) { // if there is legend for ENV and SC

        var LPwidth = document.getElementById('legendSVG').clientWidth/scfactor // width of legend plot
        var LPheight = document.getElementById('legendSVG').clientHeight/scfactor // height of legend plot
        var LPwidthSC = document.getElementById('legendSVGSC').clientWidth/scfactor // width of legend plot
        var LPheightSC = document.getElementById('legendSVGSC').clientHeight/scfactor // height of legend plot

        domtoimage.toJpeg(document.getElementById('legendtitleSC'), { "bgcolor": 'white' }) // title
        .then(function (dataUrl) {
          pdf.addImage(dataUrl, 'JPEG', posLxSC, posLySC, LTwidthSC, LTheightSC); 
        domtoimage.toJpeg(document.getElementById('legendSVGSC'), { "bgcolor": 'white' }) // scalebar
        .then(function (dataUrl) {
         pdf.addImage(dataUrl, 'JPEG', posLxSC, posLySC+LTheightSC,  LPwidthSC, LPheightSC ); 
         domtoimage.toJpeg(document.getElementById('legendtitle'), { "bgcolor": 'white' }) // title
         .then(function (dataUrl) {
           pdf.addImage(dataUrl, 'JPEG', posLx, posLy, LTwidth, LTheight); 
           domtoimage.toJpeg(document.getElementById('legendSVG'), { "bgcolor": 'white' }) // scalebar
         .then(function (dataUrl) {
          pdf.addImage(dataUrl, 'JPEG', posLx, posLy+LTheight,  LPwidth, LPheight ); 
          pdf.save('map.pdf'); 
         });
         }); 
        });
        });  
      } 
    }
        
      
      // Reset original map size and resolution
      map.setSize(size);
      map.getView().setResolution(viewResolution);
      document.body.style.cursor = 'auto';
    });
  
    
  });

// Render map: set resolution for output 
var printSize = [widthPDF, heightPDF];
map.setSize(printSize);
var scaling = Math.min(widthPDF / size[0], heightPDF / size[1]);
map.getView().setResolution(viewResolution / scaling);

  }
  