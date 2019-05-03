import Phaser from 'phaser';

let tank;
let enemy;
let enemy2;
let wallsLayer;

let cursors;
const coll = false;

export default class GameScene extends Phaser.Scene {
	constructor() {
		super('Game');
		this.speed = 200;
	}

	preload() {
		this.load.image('tank_blue', 'assets/tank_blue.png');
		this.load.image('map_tiles', 'assets/default.png');
		this.load.image('map', 'assets/map_tiles.png');
		this.load.image('sky', 'http://labs.phaser.io/assets/skies/nebula.jpg');
	}

	create() {
		const level = [
			[
				49,
				17,
				17,
				17,
				17,
				17,
				17,
				17,
				17,
				17,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2,
				2
			],
			[8, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
			[2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
			[2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
			[2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
			[2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
			[2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
			[2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
			[2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
			[2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
			[2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
			[2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
			[2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
			[2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
		];

		const walls = [
			['', 56, '', '', '', '', '', '', '', '', ''],
			['', 56, '', '', '', '', '', '', '', '', '']
		];

		const w = 64;

		const map = this.make.tilemap({
			data: level,
			tileWidth: w,
			tileHeight: w
		});

		const obj = this.make.tilemap({
			data: walls,
			tileWidth: w,
			tileHeight: w
		});

		const tiles = map.addTilesetImage('map_tiles');
		const wallsTiles = obj.addTilesetImage('map_tiles');

		const mapLayer = map.createStaticLayer(0, tiles, 0, 0);
		wallsLayer = obj.createStaticLayer(0, wallsTiles, 64, 64);
		wallsLayer.setCollision(56);

		tank = this.physics.add.sprite(50, 150, 'tank_blue');
		enemy = this.physics.add.sprite(350, 150, 'tank_blue');
		enemy2 = this.physics.add.sprite(450, 150, 'tank_blue');

		tank.setCollideWorldBounds(true);
		enemy.setCollideWorldBounds(true);
		enemy2.setCollideWorldBounds(true);
		// wallsLayer.setCollideWorldBounds(true);

		console.log(wallsLayer);
		tank.scaleX = 0.5;
		tank.scaleY = 0.5;

		this.physics.add.collider(tank, wallsLayer);
		cursors = this.input.keyboard.createCursorKeys();
	}

	update() {
		this.physics.world.collide(tank, enemy, () => {
			console.log(1);
		});
		this.physics.world.collide(tank, wallsLayer, () => {
			console.log(1);
		});
		this.physics.world.collide(enemy, enemy2);

		const { width, height } = this.sys.game.canvas;
		if (!coll) {
			if (cursors.up.isDown && tank.y >= 25) {
				tank.body.setVelocityY(-this.speed);
				tank.angle = -180;
			} else if (cursors.down.isDown && tank.y <= height - 25) {
				// tank.y += 5;
				tank.body.setVelocityY(this.speed);
				tank.angle = 0;
			} else {
				tank.body.setVelocityY(0);
			}

			if (cursors.left.isDown && tank.x >= 25) {
				// tank.x -= 5;
				tank.body.setVelocityX(-this.speed);
				tank.angle = 90;
			} else if (cursors.right.isDown && tank.x <= width - 25) {
				tank.body.setVelocityX(this.speed);
				// tank.x += 5;
				tank.angle = -90;
			} else {
				tank.body.setVelocityX(0);
			}

			if (cursors.left.isDown && cursors.up.isDown) {
				tank.angle = 135;
			} else if (cursors.left.isDown && cursors.down.isDown) {
				tank.angle = 45;
			}

			if (cursors.right.isDown && cursors.up.isDown) {
				tank.angle = -135;
			} else if (cursors.right.isDown && cursors.down.isDown) {
				tank.angle = -45;
			}
		}
	}
}
