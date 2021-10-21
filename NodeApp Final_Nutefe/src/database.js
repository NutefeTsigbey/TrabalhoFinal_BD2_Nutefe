//MONGODB
const mongoose = require("mongoose");

const MONGODB_URI = 'mongodb://localhost/node-app';

mongoose.connect(MONGODB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true
})
    .then(db => console.log("Database in connected to", db.connection.host))
    .catch(err => console.log(err));


//NEO4J
const neo4j = require('neo4j-driver');
const driver = new neo4j.driver("neo4j://localhost:7687", neo4j.auth.basic("neo4j", "1234")); //("usuário", "senha")

global.session = driver.session({
    database: "neo4j", // <---- Connect to the database 'neo4j'
});


console.log("Conectado ao Neo4j por neo4j://localhost:7687");
