const vuforia = require('vuforia-api');
// util for base64 encoding and decoding
var util = vuforia.util();
const express = require('express')
const app = express()
const port = 3000

const bodyParser = require('body-parser');


app.use(bodyParser.json({limit:'50mb'}));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

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



app.post('/api/createTarget', (req, res) => {
  /* 
    req.body.name
    req.body.width
    req.body.image
    req.body.active_flag
    req.body.metaData
  */

  var errors = []
  var flag=0

  if(typeof req.body.name === 'object' || typeof req.body.name === 'undefined' || req.body.name.length < 3) {errors.push("Name is invalid"); flag = 1}
  if(typeof req.body.width === 'object' || typeof req.body.width === 'undefined' || typeof req.body.width === 'number') {errors.push("Width is invalid"); flag=1}
  if(typeof req.body.image === 'object' || typeof req.body.image === 'undefined' ) {errors.push("Image is invalid"); flag = 1}

  if(flag == 1) return res.status(500).json(errors)

  var name = req.body.name
  var width = req.body.width
  var image = req.body.image

  var target = {
 
    // name of the target, unique within a database
    'name': name,
    // width of the target in scene unit
    'width': parseFloat(width),
    
    // the base64 encoded binary recognition image data
    //'image': util.encodeFileBase64(__dirname + '/ship.jpg'),
    'image':image,
    // indicates whether or not the target is active for query
     'active_flag': true,

     'application_metadata': util.encodeBase64(req.body.meta || "'app_name':'skem'")
  }

  client.addTarget(target, function (error, result) {
 
    //if error
    if(error) return res.status(500).json(result);
    /*
    example of result from the vws API:
    {
      result_code: 'AuthenticationFailure',
      transaction_id: '58b51ddc7a2c4ac58d405027acf5f99a'
    }
    */
   
 
    //if successful
    res.status(200).json(result)
    /*
    example of result from the vws API:
    {
      target_id: '93fd6681f1r74b76bg80tf736a11b6a9',
      result_code: 'TargetCreated',
      transaction_id: 'xf157g63179641c4920728f1650d1626'
    }
    */
    })
})     

app.get('/api/getAllTargets', (req, res) => {
  client.listTargets(function (error, result) {
 
    if (error) return res.status(400).json(result);
    /*
    example of result from the vws API:
    {
      result_code: 'AuthenticationFailure',
      transaction_id: '58b51ddc7a2c4ac58d405027acf5f99a'
    }
    */
 
    res.status(200).json(result)

    /*
    example of result from the vws API:
    {
        “result_code”:”Success”,
        “transaction_id”:”550e8400e29440000b41d4a716446655”,
        “results”:[
            ”00550e84e29b41d4a71644665555678”,
            ”578fe7fd60055a5a84c2d215066b7a9d”
        ]
    }
    */
    
  })             
})  

app.post('/api/getOneTarget', (req, res) => {
  const oneTarget = req.body.target

  client.retrieveTarget(oneTarget, function (error, result) {
 
    if (error) return res.status(500).json(result);
 
    /*
    example of result from the vws API:
    {
      result_code: 'AuthenticationFailure',
      transaction_id: '58b51ddc7a2c4ac58d405027acf5f99a'
    }
    */
 
    	
    res.status(200).json(result)
 
    /*
    example of result from the vws API:
    {
        “result_code”:”Success”,
        “transaction_id”:”e29b41550e8400d4a716446655440000”,
        “target_record”:{
            “target_id”:”550b41d4a7164466554e8400e2949364”,
            “active_flag”:true,
            “name”:”tarmac”,
            “width”:100.0,
            “tracking_rating”:4,
            “reco_rating”:””
        },
        “status”:”Success”
    }
    */
    
  })        
}) 

app.post('/api/updateTarget', (req, res) => {
  /* 
    req.body.name
    req.body.width
    req.body.image
    req.body.target
    req.body.active_flag
    req.body.metaData
  */

  var errors = []
  var flag=0

  if(typeof req.body.name === 'object' || typeof req.body.name === 'undefined' ) {errors.push("Name is invalid"); flag = 1}
  if(typeof req.body.width === 'object' || typeof req.body.width === 'undefined' || typeof req.body.width === 'number') {errors.push("Width is invalid"); flag=1}
  if(typeof req.body.image === 'object' || typeof req.body.image === 'undefined' ) {errors.push("Image is invalid"); flag = 1}

  if(flag == 1) return res.status(500).json(errors)

  var name = req.body.name
  var width = req.body.width
  var image = req.body.image

  const oneTarget = req.body.target

  var update = {
    'name': name,
    'width': parseFloat(width),
    'image': image,
    'active_flag' : req.body.active_flag,
    'application_metadata' : util.encodeBase64(req.body.metaData || "'app_name':'skem'")
  };
 
  client.updateTarget(oneTarget, update, function (error, result) {
 
    if (error) return res.status(400).json(result)
 
    /*
    example of result from the vws API:
    {
      result_code: 'AuthenticationFailure',
      transaction_id: '58b51ddc7a2c4ac58d405027acf5f99a'
    }
    */
 
    	
      res.status(200).json(result)
 
      /*
      example of result from the vws API:
      {
        "result_code":"Success",
      "transaction_id":"550e8400e29b41d4a716446655482752"
      }
      */
    
  })
}) 

app.post('/api/deleteTarget', (req, res) => {
  const oneTarget = req.body.target

  client.deleteTarget(oneTarget, function (error, result) {
 
    if (error) return res.status(400).json(result)
 
        /*
        example of result from the vws API:
        {
        	result_code: 'AuthenticationFailure',
        	transaction_id: '58b51ddc7a2c4ac58d405027acf5f99a'
        }
        */
 
    console.log(result);
    res.status(200).json(result)
      /*
      example of result from the vws API:
      {
        “result_code”:”Success”,
        “transaction_id”:”550e8400e29b41d4a716446655482752”
      }
      */
  })  
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})