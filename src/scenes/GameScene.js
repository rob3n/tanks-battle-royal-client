import Phaser from 'phaser';

let tank;
let map;
let enemy;
let background;
let treesLayer;

let cursors;
const coll = false;

export default class GameScene extends Phaser.Scene {
	constructor() {
		super('Game');
		this.speed = 200;
	}

	preload() {
		this.load.image('tank_blue', 'assets/tank_blue.png');

		this.load.image('tiles', 'assets/all_tiles.png');
		this.load.tilemapTiledJSON('map', 'assets/map.json');
	}

	create() {
		map = this.make.tilemap({ key: 'map' });
		// set layers
		const tileset = map.addTilesetImage('all_tiles', 'tiles');

		background = map.createStaticLayer('BackLayer', tileset, 0, 0);
		treesLayer = map.createStaticLayer('TreesLayer', tileset, 0, 0);

		treesLayer.setCollisionByProperty({ collides: true });

		// create tank sprite with physics
		tank = this.physics.add.sprite(230, 350, 'tank_blue');
		enemy = this.physics.add.sprite(350, 350, 'tank_blue');

		tank.setCollideWorldBounds(true);
		tank.scaleX = 0.6;
		tank.scaleY = 0.6;

		enemy.setCollideWorldBounds(true);
		enemy.scaleX = 0.6;
		enemy.scaleY = 0.6;

		// collide trees and tank
		this.physics.add.collider(tank, treesLayer);
		this.physics.add.collider(enemy, treesLayer);
		this.physics.add.collider(tank, enemy);

		// detect keyboard
		cursors = this.input.keyboard.createCursorKeys();
	}

	update() {
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
