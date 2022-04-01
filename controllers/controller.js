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
    
    
    };
    