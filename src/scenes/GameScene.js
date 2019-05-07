import Phaser from 'phaser';
import Tank from '../components/tank';

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

		this.physics.add.collider(this.enemyPlayer, this.player);

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
		this.physics.add.collider(this.treesLayer, this.bullets, (bullet, tree) => {
			bullet.destroy();
			if (tree.index === this.destroyTreeId) {
				this.map.removeTileAt(tree.x, tree.y);
			}
		});
		this.physics.add.collider(
			this.enemyPlayer,
			this.bullets,
			(bullet, enemy) => {
				bullet.destroy();
				enemy.destroy();
			}
		);
		this.physics.add.collider(
			this.enemyPlayer,
			this.bullets,
			(bullet, enemy) => {
				bullet.destroy();
				enemy.destroy();
			}
		);
		this.physics.add.collider(
			this.player,
			this.enemyBullets,
			(bullet, player) => {
				bullet.destroy();
				player.destroy();
			}
		);
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
	}

	update() {
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

		this.player.update(playerKeys, this.bullets);
		this.enemyPlayer.update(enemyPlayerKeys, this.enemyBullets);
		this.player.destroyBullets(this.bullets);
		this.player.destroyBullets(this.enemyBullets);
	}
}
