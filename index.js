const express = require('express');
const app = express();
const cors = require('cors');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;


const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const swaggerOptions = {
    swaggerDefinition: {
        info:{
            title: 'Registration Management API',
            version: '1.0.0'
        }
    },
    apis: ['index.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
console.log(swaggerDocs);

app.use('/api-docs',swaggerUi.serve,swaggerUi.setup(swaggerDocs));

passport.use(new LocalStrategy(
    (displayName,password,done)=>{
        console.log(displayName,password,usersCollection)
        usersCollection.findOne({displayName:displayName},(err,user)=>{
            if(err){return done(err);}
            if(!usersCollection){return done(null,false);}
            if(!usersCollection.verifyPassword(password)){ return done(null,false);}
            return done(null,user)
        })
    }
))

/**
 * @swagger
 * definitions:
 *   user:
 *     type:object
 *     properties:
 *       name:
 *         type:string
 *         description: name of user
 *         example:'Ahnaf Tahmid'
 *       email:
 *         type:string
 *         description: email of user
 *         example:'some@mail.com'
 *       password:
 *         type:string
 *         description: password of user
 *         example:'secret#73'
 */

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fobb8.mongodb.net/${process.env.DB_DATABASE}?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
    try{
        await client.connect();
        const database = client.db('swagger-ltd');
        const usersCollection = database.collection('users');


        /**
         * @swagger
         * /users:
         *   get:
         *     summary: Get all users
         *     description: Get all user
         *     responses:
         *       200:
         *         description: Success
         * 
        */
        app.get('/users',async(req,res,next)=>{
            const query={};
            const cursor = usersCollection.find(query);
            const result = await cursor.toArray();
            res.json(result);
        })

        /**
         * @swagger
         * /user?email={email}:
         *   get:
         *     summary: Get single user
         *     description: Get specific user
         *     produces:
         *       application/json
         *     parameters:
         *       - in : query
         *         name: email
         *         description: find user in mongodb
         *         schema:
         *           type: string
         *           required:
         *             - email
         *           properties:
         *             email:
         *               type: string
         *     responses:
         *       200:
         *         description: Success
         * 
        */
        app.get('/user',async(req,res)=>{
            const query={email:req.query.email};
            const cursor = await usersCollection.findOne(query);
            res.json(cursor);
        })

        /**
         * @swagger
         * /users:
         *   post:
         *     summary: Add user
         *     description: create a user
         *     produces:
         *       application/json
         *     parameters:
         *       - in : body
         *         name: Add user
         *         description: add user in mongodb
         *         schema:
         *           type: object
         *           required:
         *             - name
         *             - email
         *             - password
         *           properties:
         *             name:
         *               type: string
         *             email:
         *               type: string
         *             password:
         *               type: string
         *     responses:
         *       200:
         *         description: user created successfully
        */
        app.post('/users',async(req,res)=>{
            const userInfo = req.body;
            console.log(userInfo)
            const cursor = await usersCollection.insertOne(userInfo);
            res.json(cursor);
        })

        /**
         * @swagger
         * /users:
         *   put:
         *     summary: Update user name
         *     description: Used to update users name in DB but for that update on user need to be logged in.
         *     produces:
         *       - application/json
         *     parameters:
         *       - in: body
         *         name: Update Name
         *         description: update user name in DB
         *         schema:
         *           type: object
         *           required:
         *             - userName
         *           properties:
         *             userName:
         *               type: string
         *     responses:
         *       200:
         *         description: User Name updated successfully
         */
        app.put('/users',async(req,res)=>{
            const id = req.body.id;
            const query ={_id: ObjectId(id)};
            const name= req.body.name;
            console.log(id,query,name)
            const options = {upsert:true};
            const updateDoc ={
                $set:{
                    displayName:name
                }
            }
            const result = await usersCollection.updateOne(query,updateDoc,options)
            res.json(result);
        });
        
        /**
         * @swagger
         * /users:
         *   delete:
         *     summary: Delete user account
         *     description: Used to remove users account from DB but for that user need to be logged in.
         *     produces:
         *       - application/json
         *     parameters:
         *       - in: body
         *         name: remove user account
         *         description: Remove user account info in DB
         *         schema:
         *           type: object
         *           required:
         *             - userId
         *           properties:
         *             userId:
         *               type: string
         *     responses:
         *       200:
         *         description: User Name updated successfully
         */
        app.delete('/users',async(req,res)=>{
            const id = req.body.id;
            const query = {_id:ObjectId(id)};
            const result = await usersCollection.deleteOne(query);
            res.json(result);
        });
    }
    finally{
        // await client.close();
    }
}
run().catch(console.dir)

app.get('/',async(req,res)=>{
    res.send('Getting info from swagger');
});

app.listen(port ,()=>{
    console.log(`listening from ${port}`);
});