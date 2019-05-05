import Phaser from 'phaser';

const TANK_MAX_VELOCITY = 200;
const SHOOTING_TIMEOUT_MS = 500;
const BULLET_SPEED = 300;

export default class GameScene extends Phaser.Scene {
	constructor() {
		super('Game');
		this.velocity = 0;
		this.acceleration = 5;
		this.lastFired = +new Date();
		this.isCollision = false;
		this.map = null;
		this.tank = null;
		this.enemy = null;
		this.treesLayer = null;
		this.cursors = null;
		this.bullets = null;
		this.bulletLifeTime = 4000;
		this.destroyTreeId = 57;
	}

	preload() {
		this.load.image('tank_blue', 'assets/tank_blue.png');
		this.load.image('bullet', 'assets/bullet.png');

		this.load.image('tiles', 'assets/all_tiles.png');
		this.load.tilemapTiledJSON('map', 'assets/map.json');
	}

	create() {
		this.map = this.make.tilemap({ key: 'map' });
		// set layers
		const tileset = this.map.addTilesetImage('all_tiles', 'tiles');

		this.background = this.map.createStaticLayer('BackLayer', tileset, 0, 0);
		this.treesLayer = this.map.createDynamicLayer('TreesLayer', tileset, 0, 0);

		this.treesLayer.setCollisionByProperty({ collides: true });

		// create tank sprite with physics
		this.tank = this.physics.add.sprite(230, 350, 'tank_blue');
		this.enemy = this.physics.add.sprite(350, 350, 'tank_blue');

		this.tank.setCollideWorldBounds(true);
		this.tank.scaleX = 0.6;
		this.tank.scaleY = 0.6;
		this.tank.setMaxVelocity(TANK_MAX_VELOCITY, TANK_MAX_VELOCITY);
		this.tank.setAngle(this.angle);

		this.enemy.setCollideWorldBounds(true);
		this.enemy.scaleX = 0.6;
		this.enemy.scaleY = 0.6;

		// collide trees and tank
		this.physics.add.collider(this.tank, this.treesLayer);
		this.physics.add.collider(this.enemy, this.treesLayer);
		this.physics.add.collider(this.tank, this.enemy);

		// detect keyboard
		this.cursors = this.input.keyboard.createCursorKeys();

		// bullet
		this.bullets = this.physics.add.group({
			defaultKey: 'bullet',
			maxSize: 20,
			runChildUpdate: true
		});

		// overlap

		this.physics.add.overlap(this.enemy, this.bullets, this.destroyBullet);
		this.physics.add.collider(this.treesLayer, this.bullets, (bullet, tree) => {
			bullet.destroy();
			// destroy tree with id
			if (tree.index === this.destroyTreeId) {
				this.map.removeTileAt(tree.x, tree.y);
			}
		});

		/**
		 * Only for debug, remove later
		 */
		console.log(this.tank);
		console.log(this.physics);
		console.log(this.map);
	}

	update() {
		// second variant destroy bullet over map
		// if (this.bullets.children.entries.length) {
		// 	this.bullets.children.entries.map(bullet => {
		// 		if (bullet.x < 0) {
		// 			bullet.destroy();
		// 		} else if (bullet.y < 0) {
		// 			bullet.destroy();
		// 		}
		// 	});
		// }
		if (!this.isCollision) {
			/**
			 * PROTOTYPE OF MOVEMENT; WIP
			 */
			if (this.cursors.up.isDown) {
				this.velocity += this.acceleration;
			}

			if (this.cursors.down.isDown) {
				this.velocity -= this.acceleration;
			}

			this.tank.setVelocity(
				this.velocity * Math.cos((this.tank.angle - 90) * 0.01745),
				this.velocity * Math.sin((this.tank.angle - 90) * 0.01745)
			);

			if (this.cursors.left.isDown) {
				this.tank.setAngularVelocity((-5 * this.velocity) / 10);
			} else if (this.cursors.right.isDown) {
				this.tank.setAngularVelocity((5 * this.velocity) / 10);
			} else {
				this.tank.setAngularVelocity(0);
			}

			/**
			 * PROTOTYPE OF SHOOTING; WIP
			 */
			const fireTimestamp = +new Date();
			if (
				this.cursors.space.isDown &&
				fireTimestamp - this.lastFired > SHOOTING_TIMEOUT_MS
			) {
				this.lastFired = fireTimestamp;
				const bull = this.fire();

				// first variant with destroy bullet over map
				setTimeout(() => {
					bull.destroy();
				}, this.bulletLifeTime);
			}
		}
	}

	fire() {
		const bullet = this.bullets.create(this.tank.x, this.tank.y);

		if (bullet) {
			bullet.setAngle(this.tank.angle);
			bullet.setVelocity(
				BULLET_SPEED * Math.cos((this.tank.angle - 90) * 0.01745),
				BULLET_SPEED * Math.sin((this.tank.angle - 90) * 0.01745)
			);

			return bullet;
		}
		return null;
	}

	destroyBullet(enemy, bullet) {
		// Remove the enemy
		console.log(enemy, bullet);
		// Remove the Bullet
		bullet.destroy();
	}
}
