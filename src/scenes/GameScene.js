import Phaser from 'phaser';
import Bullets from '../components/bullets';
import Tank from '../components/tank';

const TANK_MAX_VELOCITY = 100;
const SHOOTING_TIMEOUT_MS = 500;

// TODO: refactoring, create tank and bullets component
export default class GameScene extends Phaser.Scene {
	constructor() {
		super('Game');
		this.velocity = 0;
		this.enemyVelocity = 0;
		this.acceleration = 5;
		this.enemyAcceleration = 5;
		this.lastFired = +new Date();
		this.lastFiredEnemy = +new Date();
		this.isCollision = false;
		this.map = null;
		this.treesLayer = null;
		this.cursors = null;
		this.bullets = new Bullets({
			defaultKey: 'bullet',
			maxSize: 20,
			runChildUpdate: true
		});
		this.bulletLifeTime = 4000;
		this.destroyTreeId = 57;
		this.newKeys = null;
	}

	preload() {
		this.load.image('tank_blue', 'assets/tank_blue.png');
		this.load.image('tank_red', 'assets/tank_red.png');
		this.load.image('bullet', 'assets/bullet.png');

		this.load.image('tiles', 'assets/all_tiles.png');
		this.load.tilemapTiledJSON('map', 'assets/map.json');
	}

	create() {
		// this.newKeys.W.on('down', () => {
		// 	if (this.enemyVelocity < TANK_MAX_VELOCITY) {
		// 		this.enemyVelocity += this.enemyAcceleration;
		// 	}
		// });
		this.map = this.make.tilemap({ key: 'map' });
		// set layers
		const tileset = this.map.addTilesetImage('all_tiles', 'tiles');

		this.background = this.map.createStaticLayer('BackLayer', tileset, 0, 0);
		this.treesLayer = this.map.createDynamicLayer('TreesLayer', tileset, 0, 0);

		this.treesLayer.setCollisionByProperty({ collides: true });

		// collide trees and tank

		this.player = new Tank({
			scene: this,
			key: 'tank_first',
			x: 350,
			y: 350,
			texture: 'tank_blue',
			scale: 0.6,
			width: 84,
			height: 92,
			velocity: 0,
			acceleration: 5
		});

		this.enemyPlayer = new Tank({
			scene: this,
			key: 'tank_second',
			x: 100,
			y: 150,
			texture: 'tank_red',
			width: 38,
			height: 46,
			velocity: 0,
			acceleration: 5
		});

		this.physics.add.collider(this.player, this.enemy);
		this.physics.add.collider(this.player, this.treesLayer);

		this.physics.add.collider(this.enemyPlayer, this.enemy);
		this.physics.add.collider(this.enemyPlayer, this.treesLayer);

		// detect keyboard
		this.newKeys = this.input.keyboard.addKeys('W,S,A,D,C');

		this.cursors = this.input.keyboard.createCursorKeys();

		// bullet
		this.bullets = this.physics.add.group({
			defaultKey: 'bullet',
			maxSize: 20,
			runChildUpdate: true
		});

		this.enemyBullets = this.physics.add.group({
			defaultKey: 'bullet',
			maxSize: 20,
			runChildUpdate: true
		});

		// overlap

		// this.physics.add.overlap(this.enemy, this.bullets, this.destroyBullet);
		this.physics.add.collider(this.treesLayer, this.bullets, (bullet, tree) => {
			bullet.destroy();
			// destroy tree with id
			if (tree.index === this.destroyTreeId) {
				this.map.removeTileAt(tree.x, tree.y);
			}
		});

		this.physics.add.collider(
			this.treesLayer,
			this.enemyBullets,
			(bullet, tree) => {
				bullet.destroy();
				// destroy tree with id
				if (tree.index === this.destroyTreeId) {
					this.map.removeTileAt(tree.x, tree.y);
				}
			}
		);
		/**
		 * Only for debug, remove later
		 */
		// console.log(this.tank);
		// console.log(this.physics);
		// console.log(this);
		console.log(this.newKeys);
	}

	update(time, delta) {
		this.fire();
		this.destroyBullets();
		this.destroyEnemyBullets();
		const playerKeys = {
			left: this.cursors.left,
			right: this.cursors.right,
			down: this.cursors.down,
			up: this.cursors.up,
			fire: this.cursors.space
		};

		const enemyPlayerKeys = {
			left: this.newKeys.A,
			right: this.newKeys.D,
			down: this.newKeys.S,
			up: this.newKeys.W,
			fire: this.newKeys.C
		};

		this.player.update(playerKeys, time, delta);
		this.enemyPlayer.update(enemyPlayerKeys, time, delta);
	}

	fire() {
		const bullet = this.bullets.create(300, 400);

		// if (bullet) {
		// 	bullet.setAngle(this.tank.angle);
		// 	bullet.setVelocity(
		// 		300 * Math.cos((this.tank.angle - 90) * 0.01745),
		// 		300 * Math.sin((this.tank.angle - 90) * 0.01745)
		// 	);
		// }
	}

	destroyBullets() {
		const bullets = this.bullets.children.entries;
		if (bullets.length) {
			for (let i = 0; i < bullets.length; i += 1) {
				const bullet = bullets[i];

				if (bullet.y <= 0) {
					bullet.destroy();
				}

				if (bullet.y >= this.cameras.main.height) {
					bullet.destroy();
				}

				if (bullet.x <= 0) {
					bullet.destroy();
				}
			}
		}
	}

	fireEnemy() {
		const bullet = this.enemyBullets.create(this.enemy.x, this.enemy.y);

		if (bullet) {
			bullet.setAngle(this.enemy.angle);
			bullet.setVelocity(
				BULLET_SPEED * Math.cos((this.enemy.angle - 90) * 0.01745),
				BULLET_SPEED * Math.sin((this.enemy.angle - 90) * 0.01745)
			);
		}
	}

	destroyEnemyBullets() {
		const bullets = this.enemyBullets.children.entries;
		if (bullets.length) {
			for (let i = 0; i < bullets.length; i += 1) {
				const bullet = bullets[i];

				if (bullet.y <= 0) {
					bullet.destroy();
				}

				if (bullet.y >= this.cameras.main.height) {
					bullet.destroy();
				}

				if (bullet.x <= 0) {
					bullet.destroy();
				}
			}
		}
	}

	rebornEnemy() {
		this.enemy = this.physics.add.sprite(350, 350, 'tank_red');
		this.enemy.setCollideWorldBounds(true);
		this.enemy.setMaxVelocity(TANK_MAX_VELOCITY, TANK_MAX_VELOCITY);
		this.enemy.setAngle(this.angle);
		this.physics.add.collider(this.enemy, this.tank);
		this.physics.add.collider(this.enemy, this.treesLayer);
		this.physics.add.collider(this.enemy, this.bullets, (tank, bullet) => {
			tank.destroy();
			bullet.destroy();

			setTimeout(() => {
				this.rebornEnemy();
			}, 3000);
		});
	}

	reborn() {
		this.tank = this.physics.add.sprite(230, 350, 'tank_blue');
		this.tank.setCollideWorldBounds(true);
		this.tank.scaleX = 0.6;
		this.tank.scaleY = 0.6;
		this.tank.setMaxVelocity(TANK_MAX_VELOCITY, TANK_MAX_VELOCITY);
		this.tank.setAngle(this.angle);
		this.physics.add.collider(this.tank, this.enemy);
		this.physics.add.collider(this.treesLayer, this.tank);
		this.physics.add.collider(this.tank, this.enemyBullets, (tank, bullet) => {
			tank.destroy();
			bullet.destroy();

			setTimeout(() => {
				this.reborn();
			}, 3000);
		});
	}
}
