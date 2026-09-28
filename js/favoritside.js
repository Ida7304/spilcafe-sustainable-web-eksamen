"use strict"; // Aktiverer strict mode - hjælper med at fange fejl

// Start app når DOM er loaded (hele HTML siden er færdig)
document.addEventListener("DOMContentLoaded", initFavoritesApp);

// ===== GLOBALE VARIABLER =====
let allGames = []; 
let favoriteGames = [];

// ===== INITIALISERING =====
function initFavoritesApp() {
  console.log("initFavoritesApp: favorites.js is running 🎉");
  getFavoriteGames();

  // Close dialog button
  document.querySelector("#close-dialog").addEventListener("click", () => {
    document.querySelector("#game-dialog").close();
    document.body.classList.remove('modal-open');
  });
}

// ===== DATA LOADING =====
async function getFavoriteGames() {
  try {
    // Indlæs alle spil først
    console.log("🌐 Henter alle games fra JSON...");
    const response = await fetch("https://raw.githubusercontent.com/cederdorff/race/refs/heads/master/data/games.json"
  );
    allGames = await response.json();
    console.log(`📊 JSON data modtaget: ${allGames.length} games`);

    // Hent favorit titler fra localStorage
    const favoriteTitles = getFavorites();
    console.log(`❤️ Fandt ${favoriteTitles.length} favoritter i localStorage`);
    
    // Filtrer spil til kun favoritter
    favoriteGames = allGames.filter(game => favoriteTitles.includes(game.title));
    console.log(`🎮 Viser ${favoriteGames.length} favorit spil`);
    
    displayFavorites(favoriteGames);
    updateFavoritesCount(favoriteGames.length);
    
  } catch (error) {
    console.error("❌ Fejl ved indlæsning af games:", error);
  }
}



// ===== VISNING =====
function displayFavorites(games) {
  const gameList = document.querySelector("#game-list");
  const noFavorites = document.querySelector("#no-favorites");
  
  if (games.length === 0) {
    gameList.innerHTML = "";
    noFavorites.style.display = "block";
    return;
  }
  
  noFavorites.style.display = "none";
  gameList.innerHTML = "";
  
  console.log(`❤️ Viser ${games.length} favorit games`);
  
  for (const game of games) {
    displayFavoriteGame(game);
  }
}

// Vis ÉT favorit game card
function displayFavoriteGame(game) {
  const gameList = document.querySelector("#game-list");
  
  const gameHTML = `
    <article class="game-card">
        <img src="${game.image}" alt="Poster of ${game.title}" class="game-poster" />
        <button type="button"  class="favorite-button" aria-label="Fjern ${game.title} fra favoritter">
          <img src="Images/Favorit fyldt ikon.png" alt="favorit" class="favorite-icon">
        </button>
      <div class="game-info">
        <h2>${game.title} <span class="game-rating"><img src="Images/Stjerne ikon.png" alt="Rating" class="rating-icon"> ${game.rating}</span></h2>
        <p class="game-shelf">Hylde ${game.shelf}</p>
        <p class="game-players"><img src="Images/Spillere ikon.png" alt="Players" class="players-icon"> ${game.players.min}-${game.players.max} spillere</p>
        <p class="game-playtime"><img src="Images/Tid ikon.png" alt="Playtime" class="playtime-icon"> ${game.playtime} minutter </p>
        <p class="game-genre"><img src="Images/Kategori ikon.png" alt="Genre" class="genre-icon"> ${game.genre}</p>  
      </div>
    </article>
  `;

  gameList.insertAdjacentHTML("beforeend", gameHTML);
  
  // Tilføj click event til hele kortet for at åbne modal
  const gameCard = gameList.lastElementChild;
  gameCard.addEventListener("click", () => showGameModal(game));
  const favoriteButton = gameCard.querySelector(".favorite-button");
  favoriteButton.addEventListener("click", function(event){
    toggleFavorite(event, game.title);
  });
}

// Opdater antal favoritter i header
function updateFavoritesCount(count) {
  const countElement = document.querySelector("#favorites-count");
  const text = count === 1 ? "Mine Favoritter (1 spil)" : `Mine Favoritter (${count} spil)`;
  countElement.textContent = text;
}

// ===== FAVORIT SYSTEM =====

// Håndter favorit klik (samme som main app men med reload af favoritter)
function toggleFavorite(event, gameTitle) {
  event.stopPropagation(); // Forhindrer at game card også bliver klikket
  const favoriteIcon = event.target;
  
  // Hent eksisterende favoritter fra localStorage
  let favorites = getFavorites();
  
  // Da vi er på favorit-siden, vil alle ikoner være fyldte
  // Så vi fjerner altid fra favoritter
  favoriteIcon.src = "Images/Favorit tomt ikon.png";
  
  // Fjern fra favoritter
  favorites = favorites.filter(title => title !== gameTitle);
  saveFavorites(favorites);
  console.log(`💔 Fjernet fra favoritter: ${gameTitle}`);
  
  // Genindlæs favorit siden for at fjerne spillet
  setTimeout(() => {
    getFavoriteGames();
  }, 100);
}

// Hent favoritter fra localStorage
function getFavorites() {
  const favorites = localStorage.getItem('gamesFavorites');
  return favorites ? JSON.parse(favorites) : [];
}

// Gem favoritter i localStorage  
function saveFavorites(favorites) {
  localStorage.setItem('gamesFavorites', JSON.stringify(favorites));
}


// ===== MODAL =====
function showGameModal(game) {
  console.log("🎭 Åbner modal for:", game.title);

  const dialogContent = document.querySelector("#dialog-content");
  
  dialogContent.innerHTML = `
   <div class="game-poster-container">
     <img src="${game.image}" alt="Poster of ${game.title}" class="game-poster" />
     <img src="Images/Favorit fyldt ikon.png" alt="Favorit" class="favorite-icon" onclick="toggleFavorite(event, '${game.title}')">
   </div>
   <div class="dialog-game-info">
      <h1>${game.title} </h1>
      <h2 class="game-description">${game.description}</h2>
      <p class="game-shelf">Hylde ${game.shelf}</p>
      <div class="game-icons-grid">
        <p class="game-genre"><img src="Images/Kategori ikon.png" alt="Genre" class="genre-icon"> ${game.genre}</p> 
        <p class="game-rating"><img src="Images/Stjerne ikon.png" alt="Rating" class="rating-icon"> ${game.rating}</p>
        <p class="game-players"><img src="Images/Spillere ikon.png" alt="Players" class="players-icon"> ${game.players.min}-${game.players.max} spillere</p>
        <p class="game-playtime"><img src="Images/Tid ikon.png" alt="Playtime" class="playtime-icon"> ${game.playtime} minutter </p>
        <p class="game-age"><img src="Images/Alder ikon.png" alt="Age" class="age-icon"> ${game.age}+</p>
        <p class="game-difficulty"><img src="Images/Sværhedsgrad ikon.png" alt="Difficulty" class="difficulty-icon"> ${game.difficulty}</p>
      </div>
      <p class="game-rules">${game.rules}</p>
      </div>
  `;

  // Åbn modalen og forhindre baggrunds scroll
  document.body.classList.add('modal-open');
  document.querySelector("#game-dialog").showModal();
  
  // Luk modal ved klik på backdrop eller ESC
  const dialog = document.querySelector("#game-dialog");
  
  dialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
  });
  
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      dialog.close();
      document.body.classList.remove('modal-open');
    }
  });
}
