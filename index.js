//Express Variable
const express=require('express');

//To Get Value Of Any Control Body-Parser Is Compulsory.
var bodyParser = require('body-parser');

//Object of Express
const app = express();
app.use(express.static('views'));
app.use(bodyParser.urlencoded({ extended: true }));

//URL Of MongoDB Server.
const url = "mongodb://heroku_97m06r9n:igcihcr7luv5q8vesi8ksm275f@ds219308.mlab.com:19308/heroku_97m06r9n";

//Mongo Client Variable
const MongoClient = require('mongodb').MongoClient;

//Database Name.
const dbName = "heroku_97m06r9n";

//Home Page
app.get('/',(req,res)=>{
  MongoClient.connect(url,{ useNewUrlParser: true },function(err,client){
      const db = client.db(dbName);
		  const collection = db.collection('survey');
      let response={};
      collection.find({}).toArray(function(err,docs)
				{
          //console.log(docs);
            if(docs.length>0)
            {
              response["message"]="Success, Surveys found"
              response["result"]=docs;
              
            }
            else
            {
              response["message"]="Surveys not found !"
            }
            res.render('home',{data:response});
        });

  });
});

//Get all Surveys in json format API
app.get('/all',(req,res)=>{
  MongoClient.connect(url,{ useNewUrlParser: true },function(err,client){
      const db = client.db(dbName);
		  const collection = db.collection('survey');
      let response={};
      collection.find({}).toArray(function(err,docs)
				{
          //console.log(docs);
            if(docs.length>0)
            {
              response["message"]="Success, Surveys found"
              response["result"]=docs;
              
            }
            else
            {
              response["message"]="Surveys not found !"
            }
            res.send(response);
        });

  });
});

//New Survey Forntend
app.get('/NewSurvey',(req,res)=>{
  res.render('newsurvey');
});

//New Survey API
app.post('/NewSurvey',(req,res)=>{
  
  
  MongoClient.connect(url,{ useNewUrlParser: true },function(err,client){

    const db = client.db(dbName);
		const collection = db.collection('survey');
		let sid=GetRandomID();
    collection.insertOne(
		{
      name:req.body.name,
      description:req.body.description,
      startDate:req.body.startDate,
      endDate:req.body.endDate,
      //This Field will use to determine that can a single user submit multiple serveys
      isOneAttempt:req.body.isOneAttempt,
      //Is UserName and Email Requied?
      userDetailRequired:req.body.userDetailRequired,
      //Random Survey ID
      surveyId:sid
    },function(err,data)
		{
      response={};
      if(!err) 
      {
          
          response["message"]="Success, Survey Created";
          response["seveyID"]=sid;
          
      }
      else{
        response["message"]="Something Went Wrong ";
        
      } 
      res.send(response);
		});

  });
});

//Add Question Front End
app.get('/AddQuestions/:id',(req,res)=>{

  res.render('addquestions',{data:req.params.id});
});

//AddQuestion APi
app.post('/AddQuestions/:id',(req,res)=>{

  let questions=[];
  
  questions=JSON.parse(req.body.addquestions);
  
  AddQuestionsContinue(req.params.id,questions,req,res);
  
});

//Response Front End
app.get('/Response/:id',(req,res)=>{

  MongoClient.connect(url,{ useNewUrlParser: true },function(err,client){
    const db = client.db(dbName);
		const collection = db.collection('survey');
    let response={};
    let sid=req.params.id;
    collection.find({ surveyId:sid }).toArray(function(err,docs)
      {
        console.log(docs);
          if(docs)
          {
            //res.send("Yes")
           res.render('response',{data:docs[0]});
          }
          else
          {
            res.send("No Survey Found !!")
          }
      });

  });  
});


//API to Submit the Response
app.post('/Response/:id',(req,res)=>{

  //console.log(req.params.id);
  let answers=JSON.parse(req.body.answers);
  let response={};


  MongoClient.connect(url,{ useNewUrlParser: true },function(err,client){
      const db1 = client.db(dbName);
      const collection1 = db1.collection('survey');
      let response={};
      
      collection1.find({ surveyId:req.params.id }).toArray(function(err,docs)
        {
          
          if(docs.length==1)
          {
            const db = client.db(dbName);
            const collection = db.collection('surveyresponse');
            collection.insertOne(
            {
                name:req.body.name,
                email:req.body.email,
                surveyId:req.params.id,
                answers:answers
            },function(err,data)
            {
              response={};
              if(!err) 
              {                  
                  response["message"]="Success, Response Recorded !!";
              }
              else{
                response["message"]="Something Went Wrong ";
                
              } 
              res.send(response);
            });
          }
          else
          {
            response["message"]="Survey Doesn't Exist, check survey id ";
            res.send(response);
          }       
        });
		  
  });

});

app.get('/Result/:id',(req,res)=>{
  MongoClient.connect(url,{ useNewUrlParser: true },function(err,client){
      const db = client.db(dbName);
		  const collection = db.collection('surveyresponse');
      let response={};
      collection.find({ surveyId:req.params.id }).toArray(function(err,docs)
				{
          //console.log(docs);
            if(docs.length>0)
            {
              response["message"]="Success, Responses Found!"
              response["result"]=docs;
              
            }
            else
            {
              response["message"]="Survey Responses Not Found !"
            }
            res.send(response);
        });

  });
});

//Random Survey ID
function GetRandomID()
{
  return (Math.random().toString(36)).substring(3,8);
}

//Further Step to Add the Questions
function AddQuestionsContinue(sid,questions,req,res)
{
  MongoClient.connect(url,{ useNewUrlParser: true },function(err,client){
    const db = client.db(dbName);
		const collection = db.collection('survey');
    let response={};
    
    collection.find({ surveyId:sid }).toArray(function(err,docs)
      {
        
        if(docs.length==1)
        {
          MongoClient.connect(url,{ useNewUrlParser: true },function(err,client){
          const db = client.db(dbName);
          const collection = db.collection('survey');
          collection.updateOne({surveyId:sid}, {$set:{  
            questions:questions
          }});
          });
          response["message"]="Questions Added to Survey ";
          res.send(response);
        }
        else
        {
          response["message"]="Survey Doesn't Exist, check survey id ";
          res.send(response);
        }       
      });
  }
  )};

//Set The File Type To App As EJS.
app.set('view engine', 'ejs');

//Httpserver Port Number 3000.
app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
