const express = require('express')
const cors = require('cors')
const app = express()

const port = process.env.PORT || 5000;
app.use(cors())
app.use(express.json())
require('dotenv').config()
const jwt = require('jsonwebtoken');


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://learning:topu123456@cluster0.l7hialj.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyjwt(req, res, next) {
    const authHeader = req.headers.authorization
    console.log(authHeader);
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authHeader.split(' ')[1]
    console.log(token);

    jwt.verify(token, process.env.JWT_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        console.log(decoded);
        req.decoded = decoded
        next()
    })
}

async function run() {
    try {
        const packages = client.db('LearningPack').collection('pack')
        const order = client.db('LearningPack').collection('order')

        app.get('/package', async (req, res) => {
            const query = {}
            const cursor = packages.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })
        app.get('/package/:id', async (req, res) => {
            const id = req.params
            console.log(id);
            const cursor = { _id: ObjectId(id) }
            const result = await packages.findOne(cursor)
            res.send(result)
        })

        app.get('/count', async (req, res) => {
            const result = await packages.estimatedDocumentCount()
            res.send({ result })
        })
        app.post('/post', async (req, res) => {
            const query = req.body
            const result = await order.insertOne(query)
            res.send(result)
        })
        app.get('/post', verifyjwt, async (req, res) => {
            const decodedEmail = req.decoded.email
            const email = req.query.email

            console.log(email);
            if (email === decodedEmail) {
                const query = { email }
                const cursor = order.find(query)
                const result = await cursor.toArray()
                res.send(result)
            }
            else{
                res.status(403).send({message:'forbidden access'})
            }
        })

        app.post('/login', async (req, res) => {
            const user = req.body
            const token = jwt.sign(user, process.env.JWT_TOKEN, {
                expiresIn: "1d"
            });
            res.send({ token })


        })

    }
    finally { }

}
run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('the port is ok')

})

app.listen(port, () => {
    console.log('port is running');
})