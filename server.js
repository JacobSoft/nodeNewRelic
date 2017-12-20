var express = require('express');
var app = express();
var sql = require("mssql");

app.get('/', function (req, res) {


    // config for your database
    var config = {
        user: 'Jake',
        password: 'klpc1229',
        server: 'STUDENT-PC\\SQLEXPRESS', 
        database: 'NodeSubscriber',
    };

    // connect to your database
    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();
           
        // query to the database and get the records
        request.query('select * from Subscriber', function (err, recordset) {
            
            if (err) console.log(err)

            // send records as a response
            res.send(recordset);
            
        });
    });
});

var server = app.listen(5000, function () {
    console.log('Server is running..');
});