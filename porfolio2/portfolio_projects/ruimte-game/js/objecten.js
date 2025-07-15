class GameObject{	
	constructor(posX, posY, speedX, speedY, width, height, url){	
		this.X = posX;
		this.Y = posY;
		this.speedX = speedX;
		this.speedY = speedY;
		this.width = width;
		this.height = height;
		this.rotation = 0.0;
		this.url = url;
		this.image = new Image();
		if (typeof(url) != 'undefined'){
			this.image.src = url;
		}else{
			console.warn('geen url opgegeven!');
		}
		// Basis hitbox voor algemene objecten
		this.hitboxScale = 0.6;
		// Offset voor de hitbox (standaard gecentreerd)
		this.hitboxOffsetX = 0;
		this.hitboxOffsetY = 0;
	}

	// Geeft de actuele hitbox terug
	getHitbox() {
		const hitboxWidth = this.width * this.hitboxScale;
		const hitboxHeight = this.height * this.hitboxScale;
		const hitboxX = this.X + (this.width - hitboxWidth) / 2 + this.hitboxOffsetX;
		const hitboxY = this.Y + (this.height - hitboxHeight) / 2 + this.hitboxOffsetY;
		return {
			x: hitboxX,
			y: hitboxY,
			width: hitboxWidth,
			height: hitboxHeight
		};
	}

	update(){
		this.X += this.speedX;
		this.Y += this.speedY;
	}

	draw(){
		ctx.save();
		ctx.translate(this.X + this.width / 2, this.Y + this.height / 2);
		ctx.rotate(this.rotation);
		ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
		ctx.restore();
	}
}

class Player extends GameObject {
	constructor(posX, posY) {
		super(posX, posY, 3, 0, 116, 112, 'img/player.png');
		this.lives = 3;
		this.isBlinking = false;
		this.blinkCount = 0;
		this.maxBlinkCount = 6;
		this.visible = true;
		this.startX = posX;
		this.lifeMessage = null;
	}

	moveUp() {
		this.speedY = -5;
	}

	moveDown() {
		this.speedY = 5;
	}

	stop() {
		this.speedY = 0;
	}

	loseLife() {
		this.lives--;
		this.X = this.startX;
		this.isBlinking = true;
		this.blinkCount = 0;
		// Maak nieuw life loss bericht
		this.lifeMessage = {
			text: "-1 ❤️",
			x: this.X + this.width / 2,
			y: this.Y - 30,
			opacity: 1.0,
			timer: 60  // 60 frames = ongeveer 1 seconde
		};
	}

	update() {
		// Bereken nieuwe positie
		let newY = this.Y + this.speedY;
		
		// Controleer of de nieuwe positie binnen het canvas blijft
		if (newY >= 0 && newY + this.height <= canvasHeight) {
			this.Y = newY;
		} else {
			this.speedY = 0;
		}
		
		this.X += this.speedX;

		// Update knippereffect
		if (this.isBlinking) {
			if (this.blinkCount % 10 === 0) {
				this.visible = !this.visible;
			}
			this.blinkCount++;
			
			if (this.blinkCount >= this.maxBlinkCount * 10) {
				this.isBlinking = false;
				this.visible = true;
			}
		}

		// Update life message
		if (this.lifeMessage) {
			this.lifeMessage.timer--;
			this.lifeMessage.y -= 1; // Beweeg omhoog
			this.lifeMessage.opacity = this.lifeMessage.timer / 60;
			
			if (this.lifeMessage.timer <= 0) {
				this.lifeMessage = null;
			}
		}

		// Check voor uit beeld
		if (this.X > canvasWidth) {
			this.loseLife();
		}
	}

	draw() {
		if (this.visible) {
			super.draw();
		}

		// Teken life message als die er is
		if (this.lifeMessage) {
			ctx.save();
			ctx.globalAlpha = this.lifeMessage.opacity;
			ctx.fillStyle = '#ff3333';
			ctx.font = 'bold 36px Arial';
			ctx.textAlign = 'center';
			ctx.fillText(this.lifeMessage.text, this.lifeMessage.x, this.lifeMessage.y);
			ctx.restore();
		}
	}

	collidesWith(gameObject) {
		if (this.isBlinking) return false;

		// Verbeterde collision detection met meer punten en betere spreiding
		const rocketPoints = [
			// Neus (3 punten voor betere detectie)
			{ x: this.X + this.width * 0.95, y: this.Y + this.height * 0.5 },  // Punt
			{ x: this.X + this.width * 0.9, y: this.Y + this.height * 0.4 },   // Boven neus
			{ x: this.X + this.width * 0.9, y: this.Y + this.height * 0.6 },   // Onder neus
			
			// Bovenvleugel (3 punten)
			{ x: this.X + this.width * 0.7, y: this.Y + this.height * 0.2 },
			{ x: this.X + this.width * 0.5, y: this.Y + this.height * 0.15 },
			{ x: this.X + this.width * 0.3, y: this.Y + this.height * 0.2 },
			
			// Ondervleugel (3 punten)
			{ x: this.X + this.width * 0.7, y: this.Y + this.height * 0.8 },
			{ x: this.X + this.width * 0.5, y: this.Y + this.height * 0.85 },
			{ x: this.X + this.width * 0.3, y: this.Y + this.height * 0.8 },
			
			// Middenlijn (4 punten)
			{ x: this.X + this.width * 0.8, y: this.Y + this.height * 0.5 },
			{ x: this.X + this.width * 0.6, y: this.Y + this.height * 0.5 },
			{ x: this.X + this.width * 0.4, y: this.Y + this.height * 0.5 },
			{ x: this.X + this.width * 0.2, y: this.Y + this.height * 0.5 }
		];

		const otherHitbox = gameObject.getHitbox();

		// Check of één van de punten het object raakt
		return rocketPoints.some(point => 
			point.x >= otherHitbox.x && 
			point.x <= otherHitbox.x + otherHitbox.width &&
			point.y >= otherHitbox.y && 
			point.y <= otherHitbox.y + otherHitbox.height
		);
	}

	// Voor debug doeleinden
	getCollisionPoints() {
		return [
			// Neus (3 punten)
			{ x: this.X + this.width * 0.95, y: this.Y + this.height * 0.5 },
			{ x: this.X + this.width * 0.9, y: this.Y + this.height * 0.4 },
			{ x: this.X + this.width * 0.9, y: this.Y + this.height * 0.6 },
			
			// Bovenvleugel (3 punten)
			{ x: this.X + this.width * 0.7, y: this.Y + this.height * 0.2 },
			{ x: this.X + this.width * 0.5, y: this.Y + this.height * 0.15 },
			{ x: this.X + this.width * 0.3, y: this.Y + this.height * 0.2 },
			
			// Ondervleugel (3 punten)
			{ x: this.X + this.width * 0.7, y: this.Y + this.height * 0.8 },
			{ x: this.X + this.width * 0.5, y: this.Y + this.height * 0.85 },
			{ x: this.X + this.width * 0.3, y: this.Y + this.height * 0.8 },
			
			// Middenlijn (4 punten)
			{ x: this.X + this.width * 0.8, y: this.Y + this.height * 0.5 },
			{ x: this.X + this.width * 0.6, y: this.Y + this.height * 0.5 },
			{ x: this.X + this.width * 0.4, y: this.Y + this.height * 0.5 },
			{ x: this.X + this.width * 0.2, y: this.Y + this.height * 0.5 }
		];
	}
}

class Star extends GameObject {
	constructor(posX, posY) {
		const speed = 3; // Vaste snelheid voor alle sterren
		const direction = Math.random() >= 0.5 ? 1 : -1; // Willekeurige richting (omhoog of omlaag)
		super(posX, posY, 0, speed * direction, 60, 52, 'img/star.png');
		this.collected = false;
		// Maak de hitbox van de ster nog kleiner
		this.hitboxScale = 0.35; // 35% van originele grootte
	}

	update() {
		super.update();
		
		// Als de ster boven of onder uit beeld gaat, plaats deze dan aan de andere kant
		if (this.speedY > 0 && this.Y > canvasHeight) {
			this.Y = -this.height;
		} else if (this.speedY < 0 && this.Y < -this.height) {
			this.Y = canvasHeight;
		}
	}
}

class Planet extends GameObject {
	constructor(posX, posY, level) {
		const planetData = levels[level];
		super(posX, posY, 0, 0, planetData.width, planetData.height, 'img/' + planetData.name + '.png');
		this.name = planetData.name;
		// Maak de hitbox van de planeet iets groter voor makkelijker level completion
		this.hitboxScale = 0.7;
	}
}

