# Skem-API

## Project setup
Navigate to the okok directory and run the following commands to setup the server

- npm install
- node server.js


# Endpoints - API

## 1- Create Target
- Endpoint ``https://skem-api.vercel.app/api/createTarget``
- Method: `POST`
- Data object (Send in Body*): 
```
{
"name": "name",
"width": "width in string",
"image": "base64 image string",
"author": "last modified by"
}
```
### RESPONSE
#### In success
```
[
    {
        "status": 0,
        "message": "Successfully inserted in database"
    }
]
```
#### If name is less than 3 characters and does not match regular expression
```
[
    {
        "status": 1,
        "message": "Name is invalid""
    }
]
```
#### If width is not a number
```
[
    {
        "status": 1,
        "message": "Width is invalid"
    }
]
```
#### If image is not string
```
[
    {
        "status": 1,
        "message": "Image is invalid"
    }
]
```
#### If error in mongo connect
```
[
    {
        "status": 2,
        "message": "Error in Mongo connect"
    }
]
```
#### If error in vuforia connect
```
[
    {
        "status": 2,
        "message": "There is an error in adding a Target to Vuforia"
    }
]
```
#### If error in mongodb insert
```
[
    {
        "status": 2,
        "message": "There is an error in inserting to mongoDB"
    }
]
```

## 2- Get All Targets
- Endpoint ``https://skem-api.vercel.app/api/getAllTargets``
- Method: `GET`

### RESPONSE
#### In success
```
[
    {
        "status": 0,
        "message": {
            “result_code”:”Success”,
            “transaction_id”:”550e8400e29440000b41d4a716446655”,
            “results”:[
                ”00550e84e29b41d4a71644665555678”,
                ”578fe7fd60055a5a84c2d215066b7a9d”
            ]
        }
    }
]
```
#### In case error connecting to vuforia
```
[
    {
        "status": 1,
        "message": "There was an error connecting to vuforia"
    }
]
```

## 1- Get One Target
- Endpoint ``https://skem-api.vercel.app/api/getOneTarget``
- Method: `POST`
- Data object (Send in Body*): 
```
{
"target": "target id of vuforia target"
}
```
### RESPONSE
#### In success
```
[
    {
        "status": 0,
        "message": {
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
    }
]
```
#### In case error in connecting to vuforia
```
[
    {
        "status": 0,
        "message": "Invalid Target Id"
    }
]
```