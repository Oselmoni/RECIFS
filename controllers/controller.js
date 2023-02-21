module.exports = function(app) {
    
    var bodyParser = require('body-parser');

    var urlencodedParser = bodyParser.urlencoded({limit: '50mb' , extended :false}); // middleware to pass the post request
    
    var R = require("r-script");

    // Create Routes 

    app.get('/', function(req, res){
            res.render('index'); // give data to the view
    });


    app.get('/tutorial', function(req, res){
        res.render('tutorial'); // give data to the view
});

// Receive the post request for retrieving reefs from Area of Interest (standard mode)

app.post('/AOI', urlencodedParser, function(req,res) {
    var datareceived = JSON.parse(Object.keys(req.body)[0]) // client to server
    console.log('post request received...')
        
    R("public/R-scripts/StandardQ.R") //This is the R script file name  
           .data(datareceived) // the data to be sent to the R script   
    
           .call(function(err, d) {
            if (err) throw err;
            res.send(d) // send back data to client
            console.log('...data sent back to client!')
          });
        })
    
    
    // Receive the post request for running an advanced request
    
    app.post('/ADV', urlencodedParser, function(req,res) {
        var datareceived = JSON.parse(Object.keys(req.body)[0]) // client to server
        console.log('post request received...')
            
        R("public/R-scripts/AdvanceQ.R") //This is the R script file name  
                
        .data(datareceived) // the data to be sent to the R script   
        
        .call(function(err, d) {
            if (err) throw err;
            res.send(d) // send back data to client
            console.log('...data sent back to client!')
          });
        })
    
    
    // Receive the post request for computing sea currents
    
    app.post('/SC', urlencodedParser, function(req,res) {
    var datareceived = JSON.parse(Object.keys(req.body)[0]) // client to server
    console.log('post request received...')
        
    R("public/R-scripts/SC.R") //This is the R script file name  
            
    .data(datareceived) // the data to be sent to the R script   
    
    .call(function(err, d) {
        if (err) throw err;
        res.send(d) // send back data to client
        console.log('...data sent back to client!')
      });
    })
    

    
//////////////////////////////////////////////////////
//////////////////////////////////////////////////////
//////////////////////////////////////////////////////
/// create routes and request handlers for DRAPEAU

// route to drapeau page
    app.get('/drapeau', function(req, res){
        res.render('drapeau'); // give data to the view
});

// Receive post request for Fst threshold recommendations 

app.post('/IFst', urlencodedParser, function(req,res) {
  var datareceived = JSON.parse(Object.keys(req.body)[0]) // client to server
  console.log('data received for Fst recommendations...')
  var r = R("public/drapeau/R-scripts/Fst_rec.R") //This is the R script file name  
  
  .data(datareceived) // the data to be sent to the R script   

  .callSync()
  
  res.send(r) // send back data to client

  console.log('...Fst recommendetions sent back to client')
})

// Receive the post request for API calculation

app.post('/API', urlencodedParser, function(req,res) {
  var datareceived = JSON.parse(Object.keys(req.body)[0]) // client to server
  console.log('data received for API calculation...')

  var r = R("public/drapeau/R-scripts/API.R") //This is the R script file name  
  
  .data(datareceived) // the data to be sent to the R script   

  .callSync()
  
  res.send(r) // send back data to client
  console.log('...API data was sent back to client!')
})

  // Receive the post request for ICI calculation

  app.post('/ICI', urlencodedParser, function(req,res) {
      var datareceived = JSON.parse(Object.keys(req.body)[0]) // client to server
      console.log('data received for ICI calculation...')
  
      var r = R("public/drapeau/R-scripts/ICI.R") //This is the R script file name  
      
      .data(datareceived) // the data to be sent to the R script   

      .callSync()
      
      res.send(r) // send back data to client
      console.log('...ICI data was sent back to client!')
  })


  // Receive the post request for OCI calculation

  app.post('/OCI', urlencodedParser, function(req,res) {
      var datareceived = JSON.parse(Object.keys(req.body)[0]) // client to server
      console.log('data received for OCI calculation...')
  
      var r = R("public/drapeau/R-scripts/OCI.R") //This is the R script file name  
      
      .data(datareceived) // the data to be sent to the R script   

      .callSync()
      
      res.send(r) // send back data to client
      console.log('...OCI data was sent back to client!')
  })


  // Receive the post request for MPA calculation

  app.post('/MPA', urlencodedParser, function(req,res) {
      var datareceived = JSON.parse(Object.keys(req.body)[0]) // client to server
      console.log('data received for MPA calculation...')
  
      var r = R("public/drapeau/R-scripts/MPA.R") //This is the R script file name  
      
      .data(datareceived) // the data to be sent to the R script   

      .callSync()
      
      res.send(r) // send back data to client
      console.log('...MPA data was sent back to client!')
  })

  // Receive the post request for CN calculation

  app.post('/CN', urlencodedParser, function(req,res) {
      var datareceived = JSON.parse(Object.keys(req.body)[0]) // client to server
      console.log('data received for CN calculation...')
  
      var r = R("public/drapeau/R-scripts/CN.R") //This is the R script file name  
      
      .data(datareceived) // the data to be sent to the R script   

      .callSync()
      
      res.send(r) // send back data to client
      console.log('...CN data was sent back to client!')
  })



    
    };
    