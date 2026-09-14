// FRONT-END (CLIENT) JAVASCRIPT HERE

let editingIndex = null

const loadGames = async function() {

  const response = await fetch( '/data' )
  const games = await response.json()

  console.log(games)
  
  const table = document.querySelector('#game-table')

  table.innerHTML = ''

  games.forEach(function(game,index) {
    const row = document.createElement('tr')

    row.classList.add('game-row')

    row.innerHTML = `
      <td>${game.name}</td>
      <td>${game.genre}</td>
      <td>${game.hours}</td>
      <td>${game.rating}</td>
      <td>${game.recommendation}</td>
      <td>
        <button class="edit-button" data-id="${game._id}">&#128393</button>
        <button class="delete-button" data-id="${game._id}">&#128465</button>
      </td>
    `

    table.appendChild(row)

    console.log(row.querySelector('.delete-button'))

  })

  const buttons = document.querySelectorAll('.delete-button')
  const editbuttons = document.querySelectorAll('.edit-button')


  buttons.forEach(function(button) {
    button.onclick = deleteGame
  })

  editbuttons.forEach(function(button) {
    button.onclick = editGame
  })
  
}

const deleteGame = async function (event){

  console.log(event.currentTarget)
  console.log(event.currentTarget.dataset.id)


  const id = event.currentTarget.dataset.id


  console.log('/delete/' + id  )

  await fetch('/delete/' + id, {
    method: 'DELETE'
  })

  loadGames()
}

const editGame = async function ( event ) {

  const id = event.currentTarget.dataset.id

  editingIndex = id

  const response = await fetch('/data')
  const games = await response.json()
  
  const game = games.find(function(game){
    return game._id === id
  })

  document.querySelector('#gamename').value = game.name
  document.querySelector('#genre').value = game.genre
  document.querySelector('#hoursplayed').value = game.hours
  document.querySelector('#rating').value = game.rating

  document.querySelector('form button').textContent = 'Save Changes'


  const updatedGame = {
    name: document.querySelector('#gamename').value,
    genre: document.querySelector('#genre').value,
    hours: Number(document.querySelector('#hoursplayed').value),
    rating: Number(document.querySelector('#rating').value)
  }

  await fetch('/edit/' + id, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updatedGame)
  })

  document.querySelector('form').reset()

  loadGames()

}

const submitGame = async function( event ) {

  // stop form submission from trying to load
  // a new .html page for displaying results...
  // this was the original browser behavior and still
  // remains to this day
  event.preventDefault()

  const name = document.querySelector('#gamename').value
  const genre = document.querySelector('#genre').value
  const hours = document.querySelector('#hoursplayed').value
  const rating = document.querySelector('#rating').value

  const game = {
    name: name,
    genre: genre,
    hours: Number(hours),
    rating: Number(rating)
  }

  let response

  if(editingIndex === null){

    response = await fetch('/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(game)
    })

  } else {
      response = await fetch('/edit/' + editingIndex, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(game)
      })
  }

  console.log(await response.text())
  
  document.querySelector('form').reset()

  editingIndex = null

  document.querySelector('form button').textContent = 'Add Game'

  loadGames()

}

window.onload = function() {
  loadGames();

const form = document.querySelector('form')
form.onsubmit = submitGame
}
