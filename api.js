const vuforia = require('vuforia-api');
// util for base64 encoding and decoding
var util = vuforia.util();
const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser');
const dateTime = require('date-and-time')

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://Admin:Admin123@cluster0.utrfo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const mongoS = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

//hello

app.use(express.json({limit:'50mb'}));
app.use(express.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

const now = new Date();

var client = vuforia.client({
  // Server access key (used for Vuforia Web Services API)
  'serverAccessKey': 'defbfad4fcd891c153105f6279e45023e21c9fe6',

  // Server secret key (used for Vuforia Web Services API)
  'serverSecretKey': '424ca2d17e44f5872e2a5f470aa8936a91130513',

  // Client access key (used for Vuforia Web Query API)
  'clientAccessKey': '2f59205bc11b8082d905904f1672817744b0602a',

  // Client secret key (used for Vuforia Web Query API)
  'clientSecretKey': '608c6d7e77bf9efc0673ffbc21c0b611d0810722'
});


const createTarget = (req, res) => {

  //initializing variables
  
  var returnObj = {
    status:1,
    message:""
  }

  var regexp = /^[a-zA-Z0-9-_]+$/;

  if(regexp.test(req.body.name) == false || req.body.name.length < 3) {
    
    returnObj.message = "Invalid Name"
    return res.status(400).json(returnObj)
  }
  
  

  var name = req.body.name
  var width = 300
  var image = req.body.image
  var author = req.body.author
  var filename = req.body.filename
  var desc = req.body.desc
  

  var target = {
 
    // name of the target, unique within a database
    'name': name,
    // width of the target in scene unit
    'width': parseFloat(width),
    // the base64 encoded binary recognition image data
    'image':image,
    // indicates whether or not the target is active for query
     'active_flag': true,

     'application_metadata': util.encodeBase64(req.body.meta || "'app_name':'skem'")
  }
  //initialize status to 2
  returnObj.status = 2

  //connection start mongodb
  mongoS.connect((err, db) => {
    returnObj.message = "Error in Mongo connect"
    if(err) return res.status(400).json(returnObj);

    //connection start vuforia
    client.addTarget(target, function (error, result) {
  
      //if error
      returnObj.message ="There is an error in adding a Target to Vuforia: " + error
      if(error) return res.status(400).json(returnObj);

      //initializing variables
      dbo = db.db("mydb");
      var myobj = { Target_ID: result.target_id, img_name: name, image: filename,desc:desc, author: author, date_mod: dateTime.format(now, 'ddd, MMM DD YYYY')};
    
      dbo.collection("targets").insertOne(myobj, (err, result_mongo) => {
        //if err
        returnObj.message ="There is an error in inserting to mongoDB"
        if(err) return res.status(400).json(returnObj);
        

        returnObj.status = 0
        returnObj.message = "Successfully inserted in database"
        res.status(200).json(returnObj)
      })
    })

  })
}    

const getAllTargets = async (req, res) => {
  var data = []
  var data2 = []
  var returnObj ={
    status:1,
    message:"There was an error connecting to vuforia"
  }

  //connecting to vuforia
  client.listTargets(function (error, result) {

    if (error) return res.status(400).json(returnObj);
    
    mongoS.connect( async (err, db) => {
      
      returnObj.message = "Error in Mongo connect"
      if(err) return res.status(400).json(returnObj);
      var dbo = db.db("mydb");
    
      result.results.forEach(element => {
        data.push({"Target_ID":element})
      })
    

      var found = await dbo.collection("targets").find({$or:data}).toArray();
      //console.log(found)
      
      
      returnObj.status=0
      returnObj.message = found
      res.status(200).json(returnObj)
    })

  })             
}

const getOneTarget =async (req, res) => {
  //console.log(req.body.target)
  var data = []
  var returnObj = {
    status: 1,
    message: "Error in Mongo connect"
  }

  const oneTarget = req.body.target

  mongoS.connect( async (err, db) => {
    if(err) return res.status(400).json(returnObj);

    var dbo = db.db("mydb");
    var found = await dbo.collection("targets").find({"Target_ID":oneTarget}).toArray();

    found.forEach(qwe =>{
      data.push(qwe)
    })  

    returnObj.message="Invalid Target Id"
    if(data.length == 0 ) return res.status(500).json(returnObj)
    
    returnObj.status = 0
    returnObj.message = data
    res.status(200).json(returnObj)
  })
} 

//updating Target
const updateTarget = (req, res) => {
  const oneTarget = req.body.target
  app.put("https://vws.vuforia.com/targets/"+oneTarget,(req,res)=>{
    var errors = []
    var returnObj = {
      status:1,
      message:""
    }
    var flag=0
    var regexp = /^[a-zA-Z0-9-_]+$/;

  if(regexp.test(req.body.name) == false && req.body.name.length < 3) {errors.push("Name is invalid"); flag = 1}
    
    
  returnObj.message = errors
  if(flag == 1) return res.status(500).json(errors)

  var name = req.body.name
  var width = req.body.width
  var image = req.body.image
  var author = req.body.author
  var desc = req.body.desc

  
  console.log("image"+image)

  var update = {
    'name': name,
    'width': parseFloat(width),
    'image': image,
    'active_flag' : true,
    'application_metadata' : util.encodeBase64(req.body.metaData || "'app_name':'skem'")
  };

  mongoS.connect((err, db) => {
    returnObj.message = "Error in Mongo connect"
    if(err) return res.status(400).json(returnObj);
 
  client.updateTarget(oneTarget, update, function (error, result) {
    returnObj.status = 2
    returnObj.message = "There was an error updating a target in Vuforia: "+error

    if (error) return res.status(400).json(returnObj)

    //initializing variables
    dbo = db.db("mydb");
    var myobj = { Target_ID: result.target_id, img_name: name,desc:desc, author: author, date_mod: dateTime.format(now, 'ddd, MMM DD YYYY')};
  
    dbo.collection("targets").updateOne(myobj, (err, result_mongo) => {
      //if err
      returnObj.message ="There is an error in inserting to mongoDB"
      if(err) return res.status(400).json(returnObj);
      

      returnObj.status = 0
      returnObj.message = "Successfully updated in database"
      res.status(200).json(returnObj)
    })
    })
  })
})
}

const deleteTarget = (req, res) => {
  var returnObj = {
    status:1,
    message:""
  }
  const oneTarget = req.body.target

  mongoS.connect((err, db) => {
    returnObj.message = "Error in Mongo connect"
    if(err) return res.status(400).json(returnObj);

  client.deleteTarget(oneTarget, function (error, result) {
    returnObj.message = "Could not find Target_ID"
    if (error) return res.status(400).json(returnObj)
    var dbo = db.db("mydb");
      var myquery = { Target_ID: oneTarget};

    dbo.collection("targets").deleteOne(myquery, function(err, obj) {
      
      if (err) return res.status(400).json(returnObj)
      returnObj.status = 0;
      returnObj.message = "Successfully deleted"

      res.status(200).json(returnObj)
    })
  })  
})


  })
    
}

const loginAccount = async (req, res) => {
  var data = []
  var returnObj ={
    status:1,
    message:"There was an error connecting to vuforia"
  }

  // var errors = []
  //   var flag=0
  //   var regexp = /^[a-zA-Z0-9-_]+$/;

  //   if(regexp.test(req.body.username) == false && regexp.test(req.body.password) == false) {
  //     errors.push("Username/Password is invalid");
  //     returnObj.message = errors
  //     return res.status(500).json(returnObj)
  //   }

  mongoS.connect( async (err, db) => {

    if(err) return res.status(400).json(returnObj);

    var dbo = db.db("mydb");
    var found = await dbo.collection("accounts").find({"username":req.body.username, "password":req.body.password}).toArray();

    found.forEach(qwe =>{
      data.push(qwe)
    })  
    console.log("HEre lies things 1111111");
    returnObj.message="Username not found"
    if(data.length == 0 ) return res.status(500).json(returnObj)
    console.log("HEre lies things");
    
    returnObj.status = 0
    returnObj.message = data
    res.status(200).json(returnObj)
  })          
}

module.exports ={
  createTarget,
  getAllTargets,
  getOneTarget,
  updateTarget,
  deleteTarget,
  loginAccount
}