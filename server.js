require( 'dotenv' ).config()
const express = require('express')
const app = express()
const port = 3000

const {MongoClient, ObjectId} = require('mongodb')
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@${process.env.HOST}`
console.log( 'uri:', uri )
const client = new MongoClient( uri )


let collection = null

client.connect()
  .then(function() {
    collection = client.db('gametracker').collection('games')
    console.log('Connected to mongodb')
  })
  .catch(function(error){
    console.log('mongodb connection error:', error)
  })




app.use(express.static('public'))
app.use(express.json())

app.get('/data', async function(req,res){

  const games = await collection.find({}).toArray()
  res.json(games)

})

app.get('/', function(req,res){
  res.sendFile(__dirname + '/public/index.html')
})

app.post('/submit', async function(req, res) {

  const data = req.body

  console.log(data)

  let recommendation

  if( data.rating === 11){
    recommendation = 'Phenomenal, buy now'
  }else if( data.rating >= 9 ) {
    recommendation = 'Highly Recommended'
  }else if( data.rating >= 7 ) {
    recommendation = 'Recommended'
  }else if( data.rating >= 5 ) {
    recommendation = 'Mixed'
  }else {
    recommendation = 'IGN Approved (Not Recommended)'
  }
  const newGame = {
    name: data.name,
    genre: data.genre,
    hours: data.hours,
    rating: data.rating,
    recommendation: recommendation
  }

  await collection.insertOne(newGame)
  res.send('New game added')

})

app.delete('/delete/:id', async function(req, res){

  console.log('Delete request: ', req.params.id)

  const id = req.params.id


  await collection.deleteOne({
    _id: new ObjectId(id)
  })

  res.send('Game deleted')
})

app.put('/edit/:id', async function(req, res) {

  const id = req.params.id
  console.log('Edit ID: ', id)


  const data = req.body

  let recommendation

  if(data.rating === 11) {
    recommendation = 'Phenomenal, buy now'
  }else if(data.rating >= 9) {
    recommendation = 'Highly Recommended'
  }else if(data.rating >= 7) {
    recommendation = 'Recommended'
  }else if(data.rating >= 5) {
    recommendation = 'Mixed'
  }else {
    recommendation = 'IGN Approved (Not Recommended)'
  }

  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        name: data.name,
        genre: data.genre,
        hours: data.hours,
        rating: data.rating,
        recommendation: recommendation
      }
    }
  )

  if(result.matchedCount === 1) {
    res.send('Game updated')
  } else {
    res.status(404).send('Game not found')
  }

})

app.listen( process.env.PORT || port )
