let ctx, canvasWidth, canvasHeight;
let score = 0;
let gameStarted = false;
let gameOver = false;
let animationFrameId = null; // Bijhouden van de game loop
let countdownActive = false;
let countdownValue = 0;
let countdownTimer = null;
canvasWidth = 1200;					
canvasHeight = 600;

let player, planet, stars;
let levels = [
	{name: 'mercury', width:108, height: 104 }, 
	{name: 'venus', width:108, height: 104 }, 
	{name: 'earth', width:108, height: 104 }, 
	{name: 'mars', width:108, height: 104 }, 
	{name: 'jupiter', width:104, height: 108 },
	{name: 'saturn', width:116, height: 112 }, 
	{name: 'uranus', width:132, height: 108 }, 
	{name: 'neptune', width:108, height: 104 }, 
	{name: 'sun', width:112, height: 116 }
];
let level = 0;
let numberOfStars = 5;

function startGame() {
	if (!gameStarted || gameOver) {
		// Stop de vorige game loop als die er is
		if (animationFrameId !== null) {
			cancelAnimationFrame(animationFrameId);
			animationFrameId = null;
		}
		
		gameStarted = true;
		gameOver = false;
		level = 0;
		document.getElementById('startScreen').style.display = 'none';
		if (document.getElementById('gameOverScreen')) {
			document.getElementById('gameOverScreen').remove();
		}
		
		initGame();
		
		// Start with countdown
		startCountdown(() => {
			start();
		}, `Level ${level+1}: ${levels[level].name}`);
	}
}

function start() {
	function gameloop() {
		update();
		draw();
		animationFrameId = requestAnimationFrame(gameloop);
	}
	gameloop();
}

function generateStarCoordinates(numberOfStars) {
	const minX = 250;
	const maxX = 800;
	const minY = 10;
	const maxY = 550;
	const minDistance = 50;

	let possibleX = [];
	for (let x = minX; x <= maxX; x += minDistance) {
		possibleX.push(x);
	}

	possibleX.sort(() => Math.random() - 0.5);
	const xCoordinates = possibleX.slice(0, numberOfStars).sort((a, b) => a - b);

	return xCoordinates.map((x, index) => ({
		x: x,
		y: Math.random() >= 0.5 ? maxY : minY
	}));
}

function init() {
	const canvas = document.getElementById('myCanvas');
	canvas.width = canvasWidth;
	canvas.height = canvasHeight;
	ctx = canvas.getContext('2d');

	// Add event listeners for start screen
	document.getElementById('startButton').addEventListener('click', startGame);
	
	// Keyboard controls
	document.addEventListener('keydown', function(event) {
		if (event.code === 'Space' && !gameStarted) {
			startGame();
		}
		if (gameStarted) {
			if (event.code === 'ArrowUp' || event.code === 'KeyW') {
				player.moveUp();
			} else if (event.code === 'ArrowDown' || event.code === 'KeyS') {
				player.moveDown();
			}
		}
	});

	document.addEventListener('keyup', function(event) {
		if (gameStarted && (event.code === 'ArrowUp' || event.code === 'ArrowDown' || 
			event.code === 'KeyW' || event.code === 'KeyS')) {
			player.stop();
		}
	});

	// Touch controls
	canvas.addEventListener('touchstart', function(event) {
		event.preventDefault(); // Voorkom standaard touch gedrag
		if (gameStarted) {
			const touch = event.touches[0];
			const rect = canvas.getBoundingClientRect();
			const touchY = touch.clientY - rect.top;
			
			// Als de aanraking in de bovenste helft is
			if (touchY < canvasHeight / 2) {
				player.moveUp();
			} else { // Als de aanraking in de onderste helft is
				player.moveDown();
			}
		}
	});

	canvas.addEventListener('touchend', function(event) {
		event.preventDefault(); // Voorkom standaard touch gedrag
		if (gameStarted) {
			player.stop();
		}
	});

	// Voorkom dat het canvas scrollt op mobiele apparaten
	canvas.addEventListener('touchmove', function(event) {
		event.preventDefault();
	});
}

function initGame() {
	player = new Player(10, canvasHeight/2);
	planet = new Planet(canvasWidth-200, canvasHeight/2 - (levels[level].height / 2), level);

	let coordinates = generateStarCoordinates(numberOfStars);
	stars = coordinates.map(coord => new Star(coord.x, coord.y));
}

function showVictoryScreen() {
	gameOver = true;
	gameStarted = false;
	
	// Stop de game loop
	if (animationFrameId !== null) {
		cancelAnimationFrame(animationFrameId);
		animationFrameId = null;
	}

	// Maak victory scherm
	const victoryScreen = document.createElement('div');
	victoryScreen.id = 'gameOverScreen'; // Gebruik dezelfde ID voor consistent verwijderen
	victoryScreen.style.cssText = `
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.8);
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	`;

	const victoryText = document.createElement('h1');
	victoryText.textContent = "Congratulations, you've reached the end of the solar system!";
	victoryText.style.cssText = `
		color: white;
		margin-bottom: 40px;
		text-align: center;
		font-size: 36px;
		max-width: 800px;
		text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
		font-family: 'Arial', sans-serif;
	`;

	const buttonContainer = document.createElement('div');
	buttonContainer.style.cssText = `
		display: flex;
		gap: 20px;
		justify-content: center;
		align-items: center;
	`;

	// "Opnieuw spelen" button
	const playAgainButton = document.createElement('button');
	playAgainButton.textContent = 'Opnieuw spelen';
	playAgainButton.style.cssText = `
		padding: 20px 40px;
		font-size: 24px;
		background-color: #4CAF50;
		color: white;
		border: none;
		border-radius: 10px;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		font-weight: bold;
		text-transform: uppercase;
		letter-spacing: 1px;
	`;
	
	// Add hover effect
	playAgainButton.onmouseover = function() {
		this.style.transform = 'scale(1.05)';
		this.style.backgroundColor = '#45a049';
	};
	playAgainButton.onmouseout = function() {
		this.style.transform = 'scale(1)';
		this.style.backgroundColor = '#4CAF50';
	};
	playAgainButton.onclick = startGame;

	// "Terug naar hoofdmenu" button
	const mainMenuButton = document.createElement('button');
	mainMenuButton.textContent = 'Terug naar hoofdmenu';
	mainMenuButton.style.cssText = `
		padding: 20px 40px;
		font-size: 24px;
		background-color: #3498db;
		color: white;
		border: none;
		border-radius: 10px;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		font-weight: bold;
		text-transform: uppercase;
		letter-spacing: 1px;
	`;
	
	// Add hover effect
	mainMenuButton.onmouseover = function() {
		this.style.transform = 'scale(1.05)';
		this.style.backgroundColor = '#2980b9';
	};
	mainMenuButton.onmouseout = function() {
		this.style.transform = 'scale(1)';
		this.style.backgroundColor = '#3498db';
	};
	mainMenuButton.onclick = function() {
		document.getElementById('gameOverScreen').remove();
		document.getElementById('startScreen').style.display = 'flex';
	};

	buttonContainer.appendChild(playAgainButton);
	buttonContainer.appendChild(mainMenuButton);
	victoryScreen.appendChild(victoryText);
	victoryScreen.appendChild(buttonContainer);
	document.getElementById('game').appendChild(victoryScreen);
}

function showGameOver() {
	gameOver = true;
	gameStarted = false;
	
	// Stop de game loop
	if (animationFrameId !== null) {
		cancelAnimationFrame(animationFrameId);
		animationFrameId = null;
	}

	// Maak game over scherm
	const gameOverScreen = document.createElement('div');
	gameOverScreen.id = 'gameOverScreen';
	gameOverScreen.style.cssText = `
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.8);
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	`;

	const buttonContainer = document.createElement('div');
	buttonContainer.style.cssText = `
		display: flex;
		gap: 20px;
		justify-content: center;
		align-items: center;
	`;

	// "Opnieuw spelen" button
	const playAgainButton = document.createElement('button');
	playAgainButton.textContent = 'Opnieuw spelen';
	playAgainButton.style.cssText = `
		padding: 20px 40px;
		font-size: 24px;
		background-color: #4CAF50;
		color: white;
		border: none;
		border-radius: 10px;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		font-weight: bold;
		text-transform: uppercase;
		letter-spacing: 1px;
	`;
	
	// Add hover effect
	playAgainButton.onmouseover = function() {
		this.style.transform = 'scale(1.05)';
		this.style.backgroundColor = '#45a049';
	};
	playAgainButton.onmouseout = function() {
		this.style.transform = 'scale(1)';
		this.style.backgroundColor = '#4CAF50';
	};
	playAgainButton.onclick = startGame;

	// "Terug naar hoofdmenu" button
	const mainMenuButton = document.createElement('button');
	mainMenuButton.textContent = 'Terug naar hoofdmenu';
	mainMenuButton.style.cssText = `
		padding: 20px 40px;
		font-size: 24px;
		background-color: #3498db;
		color: white;
		border: none;
		border-radius: 10px;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		font-weight: bold;
		text-transform: uppercase;
		letter-spacing: 1px;
	`;
	
	// Add hover effect
	mainMenuButton.onmouseover = function() {
		this.style.transform = 'scale(1.05)';
		this.style.backgroundColor = '#2980b9';
	};
	mainMenuButton.onmouseout = function() {
		this.style.transform = 'scale(1)';
		this.style.backgroundColor = '#3498db';
	};
	mainMenuButton.onclick = function() {
		document.getElementById('gameOverScreen').remove();
		document.getElementById('startScreen').style.display = 'flex';
	};

	buttonContainer.appendChild(playAgainButton);
	buttonContainer.appendChild(mainMenuButton);
	gameOverScreen.appendChild(buttonContainer);
	document.getElementById('game').appendChild(gameOverScreen);
}

function startCountdown(callback, message = "") {
	countdownActive = true;
	countdownValue = 3;
	
	// Create countdown overlay
	const countdownOverlay = document.createElement('div');
	countdownOverlay.id = 'countdownOverlay';
	countdownOverlay.style.cssText = `
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.6);
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		z-index: 900;
	`;
	
	// Add message if provided
	if (message) {
		const messageText = document.createElement('div');
		messageText.textContent = message;
		messageText.style.cssText = `
			color: white;
			font-size: 32px;
			margin-bottom: 20px;
			font-weight: bold;
			text-align: center;
		`;
		countdownOverlay.appendChild(messageText);
	}
	
	// Add countdown display
	const countdownDisplay = document.createElement('div');
	countdownDisplay.id = 'countdownDisplay';
	countdownDisplay.textContent = countdownValue;
	countdownDisplay.style.cssText = `
		color: white;
		font-size: 72px;
		font-weight: bold;
		text-shadow: 0 0 10px rgba(255, 255, 255, 0.7);
	`;
	countdownOverlay.appendChild(countdownDisplay);
	document.getElementById('game').appendChild(countdownOverlay);
	
	// Start countdown
	function updateCountdown() {
		countdownValue--;
		
		if (countdownValue <= 0) {
			clearInterval(countdownTimer);
			countdownActive = false;
			document.getElementById('countdownOverlay').remove();
			if (callback) callback();
		} else {
			countdownDisplay.textContent = countdownValue;
		}
	}
	
	countdownTimer = setInterval(updateCountdown, 1000);
}

function nextLevel() {
	level++;
	if (level >= levels.length) {
		// Spel uitgespeeld
		showVictoryScreen();
		return;
	}
	
	// Pause the game loop
	if (animationFrameId !== null) {
		cancelAnimationFrame(animationFrameId);
		animationFrameId = null;
	}
	
	// Start countdown and then initialize the new level
	startCountdown(() => {
		initGame();
		start();
	}, `Level ${level+1}: ${levels[level].name}`);
}

function checkCollisions() {
	// Check botsing met sterren
	stars.forEach(star => {
		if (!star.collected && player.collidesWith(star)) {
			star.collected = true;
			
			// Pause game loop when losing a life
			if (animationFrameId !== null) {
				cancelAnimationFrame(animationFrameId);
				animationFrameId = null;
			}
			
			if (player.lives > 1) {
				// Still has lives left
				player.loseLife();
				startCountdown(() => {
					start();
				}, "Je hebt een leven verloren!");
			} else {
				// Game over
				player.loseLife();
				showGameOver();
			}
		}
	});

	// Check botsing met planeet (level gehaald)
	if (player.collidesWith(planet)) {
		nextLevel();
	}
}

function update() {
	if (!gameStarted || gameOver || countdownActive) return;
	
	player.update();
	stars.forEach(star => star.update());
	checkCollisions();
}

// Debug functie om hitboxen te tekenen (optioneel)
function drawHitboxes() {
	if (!gameStarted) return;
	
	ctx.strokeStyle = 'red';
	ctx.lineWidth = 2;
	
	// Teken speler hitbox
	const playerHitbox = player.getHitbox();
	ctx.strokeRect(playerHitbox.x, playerHitbox.y, playerHitbox.width, playerHitbox.height);
	
	// Teken ster hitboxen
	stars.forEach(star => {
		if (!star.collected) {
			const starHitbox = star.getHitbox();
			ctx.strokeRect(starHitbox.x, starHitbox.y, starHitbox.width, starHitbox.height);
		}
	});
	
	// Teken planeet hitbox
	const planetHitbox = planet.getHitbox();
	ctx.strokeRect(planetHitbox.x, planetHitbox.y, planetHitbox.width, planetHitbox.height);
}

function draw() {		
	if (!gameStarted) return;

	ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
	ctx.fillRect(0, 0, canvasWidth, canvasHeight);

	player.draw();	
	planet.draw();
	stars.forEach(star => {
		if (!star.collected) {
			star.draw();
		}
	});

	// Teken hitboxen (voor debugging)
	// drawHitboxes();

	ctx.fillStyle = '#fff';
	ctx.font = 'bold 24px Arial';
	ctx.fillText("LIVES: " + player.lives, 20, 30);
	ctx.fillText("LEVEL " + (level+1) + ': ' + levels[level].name, canvasWidth-400, 30);
}
