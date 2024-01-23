let canvas, ctx, timer, snake, apple;
const SCL = 20, DELAY = 100;

let keys = [];
let active;

window.addEventListener("load", () => {
	// Canvas setup
	canvas = document.getElementById('board');
	canvas.width = 960;
	canvas.height = 480;

	// Canvas context and fill color
	ctx = canvas.getContext('2d');
	ctx.fillStyle = '#000';

	// Create snake and apple with random position
	// The snake will start with a direction of RIGHT if it's initial length is greater than 1
	snake = new Snake(
		Math.floor((Math.random() * canvas.width / (2 * SCL)) + (canvas.width / (4 * SCL))) * SCL,
		Math.floor((Math.random() * canvas.height / (2 * SCL)) + (canvas.height / (4 * SCL))) * SCL
	);

	if (snake.size === 1) snake.setDirection('STILL');

	apple = new Apple(0, 0);
	apple.randLocation(snake);

	draw();
	active = false;
});

document.addEventListener("keydown", (e) => {
	switch (e.key) {
		case 'a':
			keys.push('LEFT');
			break;
		case 'w':
			keys.push('UP');
			break;
		case 'd':
			keys.push('RIGHT');
			break;
		case 's':
			keys.push('DOWN');
			break;
		case 'p':
		case 'Enter':
			togglePause();
			break;
	}
});

function tick() {
	if (keys.length > 0) {
		snake.setDirection(keys.shift());
	}
	snake.move();
	snake.hitDetect();
	snake.tryToEat(apple);
}

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	snake.draw(ctx);
	apple.draw(ctx);
}

function togglePause() {
	if (active) {
		clearInterval(timer);
		active = false;
	} else {
		timer = setInterval(() => {
			tick();
			draw();
		}, DELAY);
		active = true;
	}
}

function end(score) {
	clearInterval(timer);
	active = false;
	alert(`Game over - your score was ${score}`);
	location.reload();
}

class Point {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

class Apple extends Point {
	constructor(x, y) {
		super(x, y);
		this.color = '#f00';
		this.big = false;
	}

	randLocation(snake) {
		this.big = Math.random() < 0.075;

		let collision;
		start:
		if (this.big) {
			let counter = 0;
			do {
				counter++;
				if (counter > 100) {
					this.big = false;
					break start;
				}

				collision = false; 
				// Random location anywhere on canvas
				// x and y are guaranteed to be a multiple of scl
				this.x = Math.floor(Math.random() * canvas.width / SCL) * SCL;
				this.y = Math.floor(Math.random() * canvas.height / SCL) * SCL;

				// Checking if the apple goes off the canvas
				if (this.x - SCL < 0 || this.x + SCL >= canvas.width) {
					collision = true;
					continue;
				}
				if (this.y - SCL < 0 || this.y + SCL >= canvas.height) {
					collision = true;
					continue;
				}     
	
				// Checking for intersection with snake
				for (let p of snake.tail) {
					if (snake.tail.indexOf(p) === 0) continue;
					// If the center of the apple is within 1 SCL length of any part of the snake then it will try a different location
					// This is to ensure that even if the apple is big it won't intersect the snake
					if (Math.abs(this.x - p.x) <= SCL && Math.abs(this.y - p.y) <= SCL) {
						collision = true;
						break;
					}
				}
			} while (collision);
		} else {
			do {
				collision = false;
				// Random location anywhere on canvas
				// x and y are guaranteed to be a multiple of scl
				this.x = Math.floor(Math.random() * canvas.width / SCL) * SCL;
				this.y = Math.floor(Math.random() * canvas.height / SCL) * SCL;
	
				for (let p of snake.tail) {
					if (snake.tail.indexOf(p) === 0) continue;
					if (this.x === p.x && this.y === p.y) {
						collision = true;
						break;
					}
				}
			} while (collision);
		}
	}

	draw(ctx) {
		ctx.fillStyle = this.color;
		if (this.big) {
			ctx.fillRect(this.x - SCL, this.y - SCL, SCL * 3, SCL * 3);
			ctx.fillStyle = '#900'; // Dark red
			ctx.fillRect(this.x, this.y, SCL, SCL);
		} else {
			ctx.fillRect(this.x, this.y, SCL, SCL);
		}
	}
}

class Snake extends Point {
	constructor(x, y) {
		super(x, y);
		this.direct = 'RIGHT';
		this.vx = SCL;
		this.vy = 0;
		this.color = '#000';
		this.size = 3; // Can be set to any initial value
		this.tail = [new Point(this.x, this.y)];
	}

	setDirection(dir) {
		let tempVx = this.vx;
		let tempVy = this.vy;
		let switched = false;

		this.vx = 0;
		this.vy = 0;

		switch (dir) {
			case 'LEFT':
				if (this.direct != 'RIGHT') {
					this.vx = -SCL;
					this.direct = dir;
					switched = true;
				}  
				break;
			case 'UP':
				if (this.direct != 'DOWN') {
					this.vy = -SCL;
					this.direct = dir;
					switched = true;
				}  
				break;
			case 'RIGHT':
				if (this.direct != 'LEFT') {
					this.vx = SCL;
					this.direct = dir;
					switched = true;
				}
				break;
			case 'DOWN':
				if (this.direct != 'UP'){
					this.vy = SCL;
					this.direct = dir;
					switched = true;
				}
				break;
		}

		if (!switched) {
			this.vx = tempVx;
			this.vy = tempVy;
		}
	}

	move() {
		this.x += this.vx;
		this.y += this.vy;

		if (this.size === this.tail.length)
			this.tail.pop();
		this.tail.unshift(new Point(this.x, this.y));
	}

	draw(ctx) {
		ctx.fillStyle = this.color;
		for (let p of this.tail)
			ctx.fillRect(p.x, p.y, SCL, SCL);
	}

	tryToEat(apple) {
		if (this.x !== apple.x) return;
		if (this.y !== apple.y) return;

		// How much the snake grows each time it eats an apple
		this.size += apple.big ? 30 : 3;
		apple.randLocation(this);
	}

	hitDetect() {
		if (this.x < 0 || this.y < 0)
			end(this.size);
		if (this.x > canvas.width - SCL)
			end(this.size);
		if (this.y > canvas.height - SCL)
			end(this.size);

		for (let p of this.tail) {
			if (this.tail.indexOf(p) === 0) continue;
			if (this.x === p.x && this.y === p.y) 
				end(this.size);
		}
	}
}