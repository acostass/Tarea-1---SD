const grpc = require("@grpc/grpc-js");
const PROTO_PATH = "./searchInventory.proto"
var protoLoader = require("@grpc/proto-loader");
const { client } = require("./src/dbconnector");

const options = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};

var packageDefinition = protoLoader.loadSync(PROTO_PATH, options);
const a = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();

server.addService(a.InventorySearch.service, {
  GetServerResponse: (call, callback) => {
    const busqueda = call.request.message;

    client.connect((err, client, release) => {
      if (err) {
        return console.error('Error acquiring client', err.stack)
      }
      client.query(`select * from items where keywords like '%' || $1 || '%';`, [busqueda], (err, result) => {
        release()
        if (err) {
          return console.error('Error executing query', err.stack)
        }

        console.log("Resultados:")
        var string_total = ""
        for (i in result.rows) {
          var { id, url, title, description, keywords } = result.rows[i];
          var id = result.rows[i].id
          var url = result.rows[i].url
          var title = result.rows[i].title 
          var description = result.rows[i].description
          var keywords = result.rows[i].keywords
          const stringsumar = 'id: ' + id + ' | url:' + url + ' | title:' + title + ' | description:' + description + ' | keywords:' + keywords
          string_total = string_total + stringsumar + '\n'
        }
        if (string_total == "") {
          string_total = "No hay resultados..."
          callback(null, null);
        }
        else {
          callback(null, { product: result.rows });
        }
        console.log(string_total)
        console.log("--------------------------------------------------------------------------------------------------------------------------------")


      })
    })
  },
});

server.bindAsync(
  "0.0.0.0:50051",
  grpc.ServerCredentials.createInsecure(),
  (error, port) => {
    console.log("Server running at http://127.0.0.1:50051");
    server.start();
  }
);