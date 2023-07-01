const BASE_URL = "https://fsa-puppy-bowl.herokuapp.com";
const COHORT_NAME = "2302-acc-pt-web-pt-e";

class PuppyBowlApp {
  constructor() {
    this.playerContainer = document.getElementById('all-players-container');
    this.randomPlayerButton = document.getElementById('random-player-button');
    this.addPlayerForm = document.getElementById('add-player-form');
    this.removePlayerButton = document.getElementById('remove-player-button');
    this.viewRosterButton = document.getElementById('view-roster-button');
    this.filterButton = document.getElementById('filter-button');
    this.statusFilter = document.getElementById('status-filter');
    this.rosterInfo = document.getElementById('roster-info');

    this.APIURL = `${BASE_URL}/api/${COHORT_NAME}/players`;

    this.init();
  }

  init() {
    this.randomPlayerButton.addEventListener('click', this.getRandomPlayer.bind(this));
    this.addPlayerForm.addEventListener('submit', this.addPlayer.bind(this));
    this.removePlayerButton.addEventListener('click', this.handleRemovePlayer.bind(this));
    this.viewRosterButton.addEventListener('click', this.viewRoster.bind(this));
    this.filterButton.addEventListener('click', this.viewRoster.bind(this));

    this.fetchPlayers(); // Fetch and render the initial player data
  }

  fetchPlayers() {
    fetch(this.APIURL)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          this.renderPlayers(data.data); // Render the fetched players
        } else {
          const errorResponse = {
            success: false,
            error: {
              name: "ErrorName",
              message: "This is an error message."
            },
            data: null
          };
          console.log(errorResponse);
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  renderPlayers(players) {
    this.playerContainer.innerHTML = '';

    players.forEach(player => {
      const playerCard = document.createElement('div');
      playerCard.classList.add('player-card');
      playerCard.classList.add(player.status === 'field' ? 'field' : 'bench'); // Add CSS class based on status

      const playerImage = document.createElement('img');
      playerImage.src = player.imageUrl;
      playerImage.alt = player.name;
      playerImage.classList.add('player-image'); // Add CSS class for the image
      playerCard.appendChild(playerImage);

      const playerName = document.createElement('p');
      playerName.textContent = `Name: ${player.name}`;
      playerCard.appendChild(playerName);

      const playerBreed = document.createElement('p');
      playerBreed.textContent = `Breed: ${player.breed}`;
      playerCard.appendChild(playerBreed);

      const playerId = document.createElement('p');
      playerId.textContent = `ID: ${player.id}`;
      playerCard.appendChild(playerId);

      const playerStatus = document.createElement('p');
      playerStatus.textContent = `Status: ${player.status}`;
      playerStatus.classList.add('status'); // Add CSS class for the status
      playerCard.appendChild(playerStatus);

      this.playerContainer.appendChild(playerCard);
    });
  }

  getRandomPlayer() {
    fetch(this.APIURL)
      .then(response => response.json())
      .then(({ success, error, data: { players } }) => {
        if (!success) {
          throw new Error(error?.message || 'Failed to fetch random player.');
        }

        if (players.length === 0) {
          throw new Error('No players available.');
        }

        const randomIndex = Math.floor(Math.random() * players.length);
        const randomPlayer = players[randomIndex];

        this.renderRandomPlayer(randomPlayer);
      })
      .catch(error => {
        this.displayError(error.message);
        console.error(error);
      });
  }

  renderRandomPlayer(player) {
    this.playerContainer.innerHTML = '';

    const playerCard = document.createElement('div');
    playerCard.classList.add('player-card');
    playerCard.classList.add(player.status === 'field' ? 'field' : 'bench'); // Add CSS class based on status

    const playerImage = document.createElement('img');
    playerImage.src = player.imageUrl;
    playerImage.alt = player.name;
    playerImage.classList.add('player-image'); // Add CSS class for the image
    playerCard.appendChild(playerImage);

    const playerName = document.createElement('p');
    playerName.textContent = `Name: ${player.name}`;
    playerCard.appendChild(playerName);

    const playerBreed = document.createElement('p');
    playerBreed.textContent = `Breed: ${player.breed}`;
    playerCard.appendChild(playerBreed);

    const playerId = document.createElement('p');
    playerId.textContent = `ID: ${player.id}`;
    playerCard.appendChild(playerId);

    const playerStatus = document.createElement('p');
    playerStatus.textContent = `Status: ${player.status}`;
    playerStatus.classList.add('status'); // Add CSS class for the status
    playerCard.appendChild(playerStatus);

    this.playerContainer.appendChild(playerCard);
  }

  viewRoster() {
    const filter = this.statusFilter.value;

    fetch(this.APIURL)
      .then(response => response.json())
      .then(({ success, error, data: { players } }) => {
        if (!success) {
          throw new Error(error?.message || 'Failed to fetch roster.');
        }

        if (players.length === 0) {
          throw new Error('No players available.');
        }

        const filteredPlayers = players.filter(player => {
          if (filter === 'field') {
            return player.status === 'field';
          } else if (filter === 'bench') {
            return player.status === 'bench';
          }
          return true; // Show all players if no filter selected
        });

        this.renderPlayers(filteredPlayers);
        
      })
      .catch(error => {
        this.displayError(error.message);
        console.error(error);
      });
  }

  

  removePlayer(playerId) {
    fetch(`${this.APIURL}/${playerId}`, {
      method: 'DELETE'
    })
      .then(response => response.json())
      .then(result => {
        const { success, error } = result;

        if (!success) {
          throw new Error(error?.message || 'Failed to remove player.');
        }

        console.log('Player successfully deleted.');

        // Fetch a new random player to display
        this.getRandomPlayer();
      })
      .catch(error => {
        this.displayError(error.message);
        console.error(error);
      });
  }

  addPlayer(event) {
    event.preventDefault();

    const nameInput = document.getElementById('name-input');
    const breedInput = document.getElementById('breed-input');
    const statusSelect = document.getElementById('status-select');
    const imageUrlInput = document.getElementById('image-url-input');

    const newPlayer = {
      name: nameInput.value.trim(),
      breed: breedInput.value.trim(),
      status: statusSelect.value,
      imageUrl: imageUrlInput.value.trim(),
      teamId: 520 // Set the desired teamId value here
    };

    fetch(this.APIURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newPlayer)
    })
      .then(response => response.json())
      .then(({ success, error, data: { newPlayer } }) => {
        if (!success) {
          throw new Error(error?.message || 'Failed to add player.');
        }

        this.renderAddedPlayer(newPlayer);
        this.fetchPlayers(); // Fetch and render the updated roster

        nameInput.value = '';
        breedInput.value = '';
        statusSelect.value = 'bench';
        imageUrlInput.value = '';
      })
      .catch(error => {
        this.displayError(error.message);
        console.error(error);
      });
  }

  renderAddedPlayer(player) {
    this.playerContainer.innerHTML = '';

    const playerCard = document.createElement('div');
    playerCard.classList.add('player-card');
    playerCard.classList.add(player.status === 'field' ? 'field' : 'bench'); // Add CSS class based on status

    const playerImage = document.createElement('img');
    playerImage.src = player.imageUrl;
    playerImage.alt = player.name;
    playerImage.classList.add('player-image'); // Add CSS class for the image
    playerCard.appendChild(playerImage);

    const playerName = document.createElement('p');
    playerName.textContent = `Name: ${player.name}`;
    playerCard.appendChild(playerName);

    const playerBreed = document.createElement('p');
    playerBreed.textContent = `Breed: ${player.breed}`;
    playerCard.appendChild(playerBreed);

    const playerId = document.createElement('p');
    playerId.textContent = `ID: ${player.id}`;
    playerCard.appendChild(playerId);

    const playerStatus = document.createElement('p');
    playerStatus.textContent = `Status: ${player.status}`;
    playerStatus.classList.add('status'); // Add CSS class for the status
    playerCard.appendChild(playerStatus);

    this.playerContainer.appendChild(playerCard);
  }

  handleRemovePlayer() {
    const userInput = prompt('Enter the ID of the player you want to remove:');
    if (userInput) {
      this.removePlayer(userInput);
    }
  }

  displayError(message) {
    const errorContainer = document.getElementById('error-container');
    errorContainer.textContent = message;
  }
}

// Initialize the app
const puppyBowlApp = new PuppyBowlApp();
