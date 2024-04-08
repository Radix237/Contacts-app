const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/contacts_list_db");

mongoose.Promise = global.Promise;

const db = mongoose.connection;

db.on("error", function(err) {
    console.log("Cannot connect to database" + err);
});

db.on("connected", function(){
    console.log("Successfully connected to the database");
});
