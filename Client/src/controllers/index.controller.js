const grpc = require("@grpc/grpc-js");
const PROTO_PATH = "./src/controllers/searchInventory.proto"
var redis = require('redis')
var protoLoader = require("@grpc/proto-loader");

const options = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
};

const redis_client = redis.createClient({
    url:"redis://redis"
});

redis_client.on('ready',()=>{
    console.log("Redis listo")
    console.log("-------------------------------------------------------------------------------------------------------------")
})






var packageDefinition = protoLoader.loadSync(PROTO_PATH, options);

const InventorySearch= grpc.loadPackageDefinition(packageDefinition).InventorySearch;

const client = new InventorySearch(
    "grpc_server:50051",
    grpc.credentials.createInsecure()
  );



const redis_client2 = redis.createClient({
    url:"redis://redis2"
});
redis_client2.on('ready',()=>{
    console.log("Redis2 listo")
    console.log("-------------------------------------------------------------------------------------------------------------")
})

const redis_client3 = redis.createClient({
    url:"redis://redis3"
});

redis_client3.on('ready',()=>{
    console.log("Redis3 listo")
    console.log("-------------------------------------------------------------------------------------------------------------")
})

redis_client.connect()
redis_client2.connect()
redis_client3.connect()

console.log('Redis conection: '+redis_client.isOpen);
console.log('Redis2 conection: '+redis_client2.isOpen);
console.log('Redis3 conection: '+redis_client3.isOpen);

const searchitems=(req,res)=>{
    const busqueda=req.query.q
    let cache = null;
    let cache1 = null;
    let cache2 = null;
    (async () => {
        let reply = await redis_client.get(busqueda);
        let reply1 = await redis_client2.get(busqueda);
        let reply2 = await redis_client3.get(busqueda);
        if(reply){
                cache = JSON.parse(reply);
                console.log("Busqueda: "+busqueda)
                console.log("Encontrado en el 1er Caché!")
                console.log("Resultados:")
                /*var string_total=""
                for (i in cache['product']){
                var id=cache['product'][i].id 
                var url=cache['product'][i].url
                var title=cache['product'].title
                var description=cache['product'][i].description
                var keywords=cache['product'][i].keywords
                const stringsumar='id: '+id+' | url:'+url+' | title:'+title+' | description:'+description+' | keywords:'+keywords
                string_total=string_total+stringsumar+'\n'
                }*/
                //console.log(string_total)
                console.log(cache)
                console.log("--------------------------------------------------------------------------------------------------------------------------------")


                res.status(200).json(cache)
        }
        else if(reply1){
                cache1 = JSON.parse(reply1);
                console.log("Busqueda: "+busqueda)
                console.log("Encontrado en el 2do Caché!")
                console.log("Resultados:")
                /*var string_total=""
                for (i in cache1['product']){
                var id=cache1['product'][i].id 
                var url=cache1['product'][i].url
                var title=cache1['product'].title
                var description=cache1['product'][i].description
                var keywords=cache1['product'][i].keywords
                const stringsumar='id: '+id+' | url:'+url+' | title:'+title+' | description:'+description+' | keywords:'+keywords
                string_total=string_total+stringsumar+'\n'
                }
                console.log(string_total)*/
                console.log(cache1)
                console.log("--------------------------------------------------------------------------------------------------------------------------------")


                res.status(200).json(cache1)
        }
        else if(reply2){
            cache2 = JSON.parse(reply2);
            console.log("Busqueda: "+busqueda)
            console.log("Encontrado en el 3er Caché!")
            console.log("Resultados:")
            /*var string_total=""
            for (i in cache2['product']){
            var id=cache2['product'][i].id 
            var url=cache2['product'][i].url
            var title=cache2['product'].title
            var description=cache2['product'][i].description
            var keywords=cache2['product'][i].keywords
            const stringsumar='id: '+id+' | url:'+url+' | title:'+title+' | description:'+description+' | keywords:'+keywords
            string_total=string_total+stringsumar+'\n'
            }
            console.log(string_total)*/
            console.log(cache2)
            console.log("--------------------------------------------------------------------------------------------------------------------------------")


            res.status(200).json(cache2)
        }
        else{
            console.log("Busqueda: "+busqueda)
            console.log("No se ha encontrado en Caché, Buscando en Postgres...")
            client.GetServerResponse({message:busqueda}, (error,items) =>{
            if(error){
                        
                res.status(400).json(error);
            }
            else{
                info = JSON.stringify(items)
                if (info['product']!==null)
                {
                    info1 = JSON.parse(info)
                    var string_total=""
                    // redis_client.set(busqueda,data)
                    // res.status(200).json(items);}
                    for (i in info1['product']){
                        var id=info1['product'][i].id
                        var url=info1['product'][i].url
                        var title=info1['product'][i].title
                        var description=info1['product'][i].description
                        var keywords=info1['product'][i].keywords
                        const stringsumar='id: '+id+' | url:'+url+' | title:'+title+' | description:'+description+' | keywords:'+keywords
                        string_total=string_total+stringsumar+'\n'
                    }

                        console.log(JSON.stringify(string_total))
                        NumRandom = Math.floor(Math.random() * 3); //Genera número random entre 0 y 2---  0 1 2
                        if (NumRandom == 0){
                            console.log("Guardado en el 1er Cache")
                            redis_client.set(busqueda, JSON.stringify(string_total))
                        }else if(NumRandom == 1){
                            console.log("Guardado en el 2do Cache")
                            redis_client2.set(busqueda, JSON.stringify(string_total))
                        }else{
                            console.log("Guardado en el 3er Cache")
                            redis_client3.set(busqueda, JSON.stringify(string_total))
                        }
                       }
                       res.status(200).json(info1);
                    }
                })
            } 
            
            
    })
    ().catch((err) => {
        console.log(err);
    });
};




module.exports={
 searchitems
}