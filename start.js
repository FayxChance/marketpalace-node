const express = require('express');
const app = express();
const socketio = require('socket.io');
const http = require('http').Server(app);
const soap = require('soap');
const io = socketio(http);
const port = process.env.PORT || 3000;
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const cors = require("cors");

const url = 'https://app-marketplace-210120132048.azurewebsites.net/ws/delivery.wsdl';

var corsOptions = {
    origin: '*'
};

app.set('view engine', 'ejs');
app.use(express.static('public'));

var products = [
    {id : 1, name : "Chaise", description : "Chaise de table en acier inoxydable", price : 150, weight: 15},
    {id : 2, name : "Table", description : "Table en acier inoxydable", price : 350,weight: 50},
    {id : 3, name : "Etagere", description : "Etagere en acier inoxydable", price : 450, weight: 70},
    {id : 4, name : "Lampe", description : "Lampe en acier inoxydable", price : 200, weight: 2} 
];

var schema = buildSchema (`
    type Product {
        id : ID!
        name : String
        weight : Float
        description : String
        price : Float
    }
    
    type Query {
        getProducts: [Product]
        getProduct(index : Int!): Product
    }
`);

var root = {
    getProducts : () => { return products;},
    getProduct : (index) => {
        return products[index["index"]];
    }
};

app.use('/graphql',cors(corsOptions));

app.use('/graphql',graphqlHTTP({
    schema : schema,
    rootValue : root,
    graphiql : true,
    
}));

app.get('/', (req, res)=> {
  res.render('index');
});

app.get('/request/', (req , res) => {
  const dist = parseFloat(req.query.dist);
  const weight = parseFloat(req.query.weight);
  soap.createClient(url, function(err, client) {
    client.GetDelivery({weight:weight,distance:dist}, function(err, result) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET, PUT, POST");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      console.log(req.query);
      res.json({"deliveryCost":result['cost']});
    });
  });
});



io.on('connection', socket => {
    console.log("New user connected");
    socket.on('deliveryCostRequest',(array) => {
      soap.createClient(url, function(err, client) {
        client.GetDelivery(array, function(err, result) {
          socket.emit('deliveryCostResponse',{deliveryCost:result['cost']});
        });
      });
    })
});

http.listen(port,() => {
  
  console.log('listening on 3000');
});
