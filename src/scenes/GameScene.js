import Phaser from 'phaser';

const TANK_MAX_VELOCITY = 100;
const SHOOTING_TIMEOUT_MS = 500;
const BULLET_SPEED = 300;

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
		this.tank = null;
		this.enemy = null;
		this.treesLayer = null;
		this.cursors = null;
		this.bullets = null;
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
		this.map = this.make.tilemap({ key: 'map' });
		// set layers
		const tileset = this.map.addTilesetImage('all_tiles', 'tiles');

		this.background = this.map.createStaticLayer('BackLayer', tileset, 0, 0);
		this.treesLayer = this.map.createDynamicLayer('TreesLayer', tileset, 0, 0);

		this.treesLayer.setCollisionByProperty({ collides: true });

		// create tank sprite with physics
		this.tank = this.physics.add.sprite(230, 350, 'tank_blue');
		this.enemy = this.physics.add.sprite(350, 350, 'tank_red');

		this.tank.setCollideWorldBounds(true);
		this.tank.scaleX = 0.6;
		this.tank.scaleY = 0.6;
		this.tank.setMaxVelocity(TANK_MAX_VELOCITY, TANK_MAX_VELOCITY);
		this.tank.setAngle(this.angle);

		this.enemy.setCollideWorldBounds(true);

		// collide trees and tank
		this.physics.add.collider(this.tank, this.treesLayer);
		this.physics.add.collider(this.enemy, this.treesLayer);
		this.physics.add.collider(this.tank, this.enemy);

		// detect keyboard
		this.newKeys = this.input.keyboard.addKeys('W,S,A,D, C');

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

		this.physics.add.overlap(this.enemy, this.bullets, this.destroyBullet);
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

		this.physics.add.collider(this.tank, this.enemyBullets, (tank, bullet) => {
			tank.destroy();
			bullet.destroy();

			setTimeout(() => {
				this.rebornEnemy();
			}, 3000);
		});

		this.physics.add.collider(this.enemy, this.bullets, (tank, bullet) => {
			tank.destroy();
			bullet.destroy();

			setTimeout(() => {
				this.reborn();
			}, 3000);
		});

		/**
		 * Only for debug, remove later
		 */
		console.log(this.tank);
		console.log(this.physics);
		console.log(this);
	}

	update() {
		this.destroyBullets();
		this.destroyEnemyBullets();

		if (!this.isCollision) {
			/**
			 * PROTOTYPE OF MOVEMENT; WIP
			 */
			if (this.cursors.up.isDown && this.velocity < TANK_MAX_VELOCITY) {
				this.velocity += this.acceleration;
			}

			if (
				this.cursors.down.isDown &&
				this.velocity > (TANK_MAX_VELOCITY * -1) / 2
			) {
				if (this.velocity > 0) {
					this.velocity -= this.acceleration * 2;
				} else {
					this.velocity -= this.acceleration / 2;
				}
			}

			// check variants for condition: WIP
			if (this.tank.scene) {
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
					this.fire();
				}
			}

			// enemy
			this.newKeys.W.on('down', () => {
				if (this.enemyVelocity < TANK_MAX_VELOCITY) {
					this.enemyVelocity += this.enemyAcceleration;
				}
			});
			this.newKeys.S.on('down', () => {
				if (this.enemyVelocity > (TANK_MAX_VELOCITY * -1) / 2) {
					if (this.enemyVelocity > 0) {
						this.enemyVelocity -= this.enemyAcceleration * 2;
					} else {
						this.enemyVelocity -= this.enemyAcceleration / 2;
					}
				}
			});

			if (this.enemy.scene) {
				this.enemy.setVelocity(
					this.enemyVelocity * Math.cos((this.enemy.angle - 90) * 0.01745),
					this.enemyVelocity * Math.sin((this.enemy.angle - 90) * 0.01745)
				);

				this.newKeys.A.on('down', () => {
					this.enemy.setAngularVelocity((-5 * this.enemyVelocity) / 10);
				});

				this.newKeys.D.on('down', () => {
					this.enemy.setAngularVelocity((5 * this.enemyVelocity) / 10);
				});

				this.newKeys.D.on('up', () => {
					this.enemy.setAngularVelocity(0);
				});
				this.newKeys.A.on('up', () => {
					this.enemy.setAngularVelocity(0);
				});

				/**
				 * PROTOTYPE OF SHOOTING; WIP
				 */
				const enemyfireTimestamp = +new Date();

				this.newKeys.C.on('down', () => {
					if (enemyfireTimestamp - this.lastFiredEnemy > SHOOTING_TIMEOUT_MS) {
						this.lastFiredEnemy = enemyfireTimestamp;
						this.fireEnemy();
					}
				});
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
		}
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
		this.physics.add.collider(this.tank, this.enemyBullets, (tank, bullet) => {
			tank.destroy();
			bullet.destroy();

			setTimeout(() => {
				this.reborn();
			}, 3000);
		});
	}
}
