var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var url = require('url');
var cors = require('cors');
var bcrypt = require('bcrypt');

const port = process.env.PORT || 8080;
const { createServer } = require('http');
const WebSocket = require('ws');
const { Pool } = require('pg')
const clientAddress = process.env.CLIENT_CONNECTION || "http://localhost:3000";

var app = express();
app.use(function(req,res,next){
    res.setHeader("Access-Control-Allow-Origin", clientAddress);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


const server = createServer(app);
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false },
})

// wake up heroku
app.get('/wakeupheroku', (req,res,next) => {
    
});

app.post('/register', (req,res,next) => {
    const saltRounds = 10;
    const username = req.body.username;
    const password = req.body.password;
    bcrypt.genSalt(saltRounds, function(err, salt) {
        if (err) {res.send({data:"error"})};
        bcrypt.hash(password, salt, function(err, hash) {
            if (err) {res.send({data:"error"})};
            pool.query('INSERT INTO person(username, passwrd) VALUES($1,$2) RETURNING *',[username,hash])
                .then(response => {
                    res.send({"id":response.rows[0].userid,"username":username});
                })
                .catch(e => {
                    console.log(e.stack);
                    res.send({data:"user exists"});
                });
        })
        
    });

});

app.post('/login', (req,res,next) => {
    const username = req.body.username;
    const password = req.body.password;
    pool.query('SELECT userid, passwrd FROM person WHERE username = $1',[username])
        .then(response => {
            const dbPsw = response.rows[0].passwrd; 
            bcrypt.compare(password, dbPsw, function(err, result) {
                if (err)
                    res.send({data:"no match or error"});
                else if (result)
                    res.send({"id":response.rows[0].userid,"username":username});
                else
                res.send({data:"no match or error"});
            });
        })
        .catch(e => {
            console.log(e.stack);
            res.send({data:"no user"});
        });
});

app.post('/acceptfriendrequest', (req,res,next) => {
    const adresseeId = req.body.adresseeId;
    const requesterId = req.body.requesterId;
    pool.query('update friendship set request_accepted = true where requester_id = $1 and adressee_id = $2',[requesterId,adresseeId])
        .then(response=>{
            res.send({"data":"success"});
        })
        .catch(e =>{
            console.log(e.stack);
            res.send({"error":"accept friend request error"});
        });
});

app.post('/declinefriendrequest', (req,res,next) => {
    const adresseeId = req.body.adresseeId;
    const requesterId = req.body.requesterId;
    pool.query('delete from friendship where requester_id = $1 and adressee_id = $2',[requesterId,adresseeId])
        .then(response=>{
            res.send({"data":"success"});
        })
        .catch(e =>{
            console.log(e.stack);
            res.send({"error":"accept friend request error"});
        });
});

app.post('/friendrequests', (req,res,next) => {
    const userid = req.body.adresseeId;
    pool.query('select per.username, per.userid from person as per, friendship as f where per.userid = f.requester_id and f.adressee_id = $1 and f.request_accepted = false',[userid])
        .then(response=>{
            res.send({"data":response.rows});
        })
        .catch(e =>{
            console.log(e.stack);
            res.send({"data":"error"});
        });
});

app.get('/getfriends/:adresseeId', (req,res,next)=>{
    const adresseeId = req.params.adresseeId;
    pool.query('select per.username, per.userid from person as per, friendship as f where ((per.userid = f.requester_id and f.adressee_id = $1) or (per.userid = f.adressee_id and f.requester_id =$1)) and f.request_accepted = true',[adresseeId])
        .then(response=>{
            res.send({"data":response.rows});
        })
        .catch(e =>{
            console.log(e.stack);
            res.send({"error":"Error getting friends"});
        });
});

app.post('/messages', (req,res,next) => {
    const userid = req.body.userid;
    const adresseeId = req.body.adresseeId;
    pool.query(`select per.username, mess.userid, mess.message_content from
                messages as mess, person as per where per.userid = mess.userid 
                and ((mess.userid = $2 and mess.adressee_id = $1) or (mess.userid=$1 
                and mess.adressee_id=$2)) order by mess.date_now `,[userid,adresseeId])
        .then(response => {
            res.send({"data":response.rows});
        })
        .catch(e => {
            console.log(e.stack);
            res.send({"error":"Error getting messages"});
        })
});
const wss = new WebSocket.Server({ server:server });

const clients = new Set();

wss.on('connection', function connection(ws, request, client) {
    const data = url.parse(request.url,true).query;
    clients.add({"username":data.username,"client":ws});
    ws.isActive = true;
    console.log('started client interval');
    console.log(clients)
    
    // interval to keep client-server connection - 15 second ping
    const ping = setInterval(() => {
        if (!ws.isActive) return ws.terminate();
        ws.isActive = false;    
        ws.send(JSON.stringify({"type":"ping"}));
    }, 15000);

    ws.on('message', function message(msg){
        const message = JSON.parse(msg);
        console.log(`Received message ${message.msg} type ${message.type}`);
        // regular message
        if (message.type === "message"){
            pool.query(`insert into messages (userid,date_now,message_content,adressee_id) 
                    values ($1,NOW(),$2,$3);`,[message.senderId,message.msg,message.sendToId])
                .then(response => {
                    clients.forEach(c =>{
                        if (c.username === message.sendToUsername){
                            c.client.send(JSON.stringify({"type":"message","data":message.msg,"senderUsername":message.senderUsername,"senderId":message.senderId}));
                        }
                    });
                })
                .catch(e => {
                    ws.send(JSON.stringify({"type":"error","data":"Error sending message"}));
                });
            
        // friend request
        }else if (message.type === "friendRequest"){
            // check not already friends
            pool.query('select exists (select * from friendship where requester_id = (select userid from person where username= $1) and adressee_id = $2)',[message.adresseeName,message.requesterId])
                .then(response => {
                    if (response.rows[0].exists === true){
                        ws.send(JSON.stringify({"type":"error","data":"Already friends or Request Pending"}));
                    }
                    else if (response.rows[0].exists === false){
                        pool.query('insert into friendship (requester_id,adressee_id,created_date_time) values ($1,(select userid from person where username=$2),NOW())',[message.requesterId,message.adresseeName])
                            .then(insert_response=>{
                                clients.forEach(c =>{
                                    if (c.username === message.adresseeName){
                                        c.client.send(JSON.stringify({"type":"friendRequest","requesterId":message.requesterId,"requesterName":message.requesterName}));
                                    }
                                });
                            })
                            .catch(e =>{
                                console.log(e.stack);
                                ws.send(JSON.stringify({"type":"error","data":"Already friends"}));
                            });
                    }
                })
                .catch(e =>{
                    ws.send(JSON.stringify({"type":"error","data":"DB/server error"}));
                });
            
            
        }
        else if(message.type === "friendRequestAccept"){
            clients.forEach(c =>{
                if (c.username === message.requesterName){
                    c.client.send(JSON.stringify({"type":"friendRequestAccept","adresseeId":message.adresseeId,"adresseeName":message.adresseeName}));
                }
            });
        }
        else if(message.type === "ping"){
            ws.isActive = true;
        }
        
    });

    ws.on('close', function() {
        console.log('stopping client interval');
        clients.forEach(function(c){
            if (c.client === ws){
                clients.delete(c);
            }
        })
        clearInterval(ping);
    });
});
server.listen(port, function() {
    console.log('Listening on http://localhost:'+port);
  });

module.exports = app;
