import Phaser from 'phaser';
import io from 'socket.io-client';
import Tank from '../components/tank';

// TODO: refactoring, create tank and bullets component
export default class GameScene extends Phaser.Scene {
	constructor() {
		super('Game');
		this.map = null;
		this.treesLayer = null;
		this.cursors = null;
		this.bullets = null;
		this.rebornTankTime = 4000;
		this.destroyTreeId = 57;
		this.newKeys = null;

		this.enemyConfig = {
			scene: this,
			key: 'tank_second',
			x: 100,
			y: 150,
			texture: 'tank_red',
			width: 38,
			height: 46,
			velocity: 0,
			acceleration: 5
		};
		this.playerConfig = {
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
		};
		this.defaultBulletConfig = {
			defaultKey: 'bullet',
			maxSize: 20,
			runChildUpdate: true
		};
		this.playerSocket = io('http://localhost:3000');
		this.playerSocket.on('connect', this.onConnect);
		// this.playerSocket.on('tanks info', console.log);
	}

	preload() {
		this.load.image('tank_blue', 'assets/tank_blue.png');
		this.load.image('tank_red', 'assets/tank_red.png');
		this.load.image('bullet', 'assets/bullet.png');

		this.load.image('tiles', 'assets/all_tiles.png');
		this.load.tilemapTiledJSON('map', 'assets/map.json');
	}

	create() {
		this.otherPlayers = this.physics.add.group();
		// create map with tiles and collides
		this.map = this.make.tilemap({ key: 'map' });
		const tileset = this.map.addTilesetImage('all_tiles', 'tiles');
		this.background = this.map.createStaticLayer('BackLayer', tileset, 0, 0);
		this.treesLayer = this.map.createDynamicLayer('TreesLayer', tileset, 0, 0);
		this.treesLayer.setCollisionByProperty({ collides: true });

		// create tanks with configs
		this.playerSocket.on('currentPlayers', players => {
			Object.keys(players).forEach(id => {
				if (players[id].playerId === this.playerSocket.id) {
					this.addPlayer(this, players[id]);
				} else {
					this.addOtherPlayers(this, players[id]);
				}
			});
		});

		this.playerSocket.on('newPlayer', playerInfo => {
			this.addOtherPlayers(this, playerInfo);
		});

		this.playerSocket.on('disconnect', playerId => {
			if (this.otherPlayers) {
				this.otherPlayers.getChildren().forEach(otherPlayer => {
					if (playerId === otherPlayer.playerId) {
						otherPlayer.destroy();
					}
				});
			}
		});

		this.playerSocket.on('playerMoved', playerInfo => {
			this.otherPlayers.getChildren().forEach(otherPlayer => {
				if (playerInfo.playerId === otherPlayer.playerId) {
					otherPlayer.setRotation(playerInfo.rotation);
					otherPlayer.setPosition(playerInfo.x, playerInfo.y);
				}
			});
		});

		// this.createPlayer(this);
		// this.createEnemyPlayer(this);

		// detect keyboard
		this.newKeys = this.input.keyboard.addKeys('W,S,A,D,C');
		this.cursors = this.input.keyboard.createCursorKeys();

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

		if (this.player) {
			this.player.update(playerKeys, this.bullets);
			this.player.destroyBullets(this.bullets);
		}
		if (this.enemyPlayer) {
			this.enemyPlayer.update(enemyPlayerKeys, this.enemyBullets);
			this.enemyPlayer.destroyBullets(this.enemyBullets);
		}
		/**
		 * EXECUTE THIS FUNCTION ONLY WHEN ARROWS IS DOWN!!!
		 */
		this.sharePosition();

		if (this.ship) {
			if (this.cursors.left.isDown) {
				this.ship.setAngularVelocity(-150);
			} else if (this.cursors.right.isDown) {
				this.ship.setAngularVelocity(150);
			} else {
				this.ship.setAngularVelocity(0);
			}

			if (this.cursors.up.isDown) {
				this.physics.velocityFromRotation(
					this.ship.rotation + 1.5,
					100,
					this.ship.body.acceleration
				);
			} else {
				this.ship.setAcceleration(0);
			}

			this.physics.world.wrap(this.ship, 5);

			// emit player movement
			const { x } = this.ship;
			const { y } = this.ship;
			const r = this.ship.rotation;
			if (
				this.ship.oldPosition &&
				(x !== this.ship.oldPosition.x ||
					y !== this.ship.oldPosition.y ||
					r !== this.ship.oldPosition.rotation)
			) {
				this.playerSocket.emit('playerMovement', {
					x: this.ship.x,
					y: this.ship.y,
					rotation: this.ship.rotation
				});
			}
			// save old position data
			this.ship.oldPosition = {
				x: this.ship.x,
				y: this.ship.y,
				rotation: this.ship.rotation
			};
		}
	}

	addPlayer(scene, playerInfo) {
		scene.ship = scene.physics.add
			.image(playerInfo.x, playerInfo.y, 'tank_blue')
			.setOrigin(0.5, 0.5)
			.setDisplaySize(53, 40);

		scene.ship.setDrag(100);
		scene.ship.setAngularDrag(100);
		scene.ship.setMaxVelocity(200);
	}

	addOtherPlayers(scene, playerInfo) {
		const otherPlayer = scene.add
			.sprite(playerInfo.x, playerInfo.y, 'tank_red')
			.setOrigin(0.5, 0.5)
			.setDisplaySize(53, 40);

		otherPlayer.playerId = playerInfo.playerId;
		if (scene.otherPlayers) {
			scene.otherPlayers.add(otherPlayer);
		}
	}

	createPlayer(scene) {
		this.player = new Tank(this.playerConfig);
		this.bullets = this.physics.add.group(this.defaultBulletConfig);
		this.enemyBullets = this.physics.add.group(this.defaultBulletConfig);
		this.physics.add.collider(this.player, this.treesLayer);
		this.physics.add.collider(this.player, this.enemyPlayer);
		this.physics.add.collider(
			this.player,
			this.enemyBullets,
			(bullet, enemy) => {
				bullet.destroy();
				enemy.destroy();

				setTimeout(() => {
					this.createPlayer(scene);
				}, this.rebornTankTime);
			}
		);
		this.physics.add.collider(
			scene.treesLayer,
			this.enemyBullets,
			(bullet, tree) => {
				bullet.destroy();
				// destroy tree with id
				if (tree.index === this.destroyTreeId) {
					scene.map.removeTileAt(tree.x, tree.y);
				}
			}
		);
	}

	createEnemyPlayer(scene) {
		this.enemyPlayer = new Tank(this.enemyConfig);
		this.bullets = this.physics.add.group(this.defaultBulletConfig);
		this.enemyBullets = this.physics.add.group(this.defaultBulletConfig);
		this.physics.add.collider(this.enemyPlayer, this.treesLayer);
		this.physics.add.collider(this.enemyPlayer, this.player);
		this.enemyPlayer.setPos(500, 500);
		this.physics.add.collider(
			this.enemyPlayer,
			this.bullets,
			(bullet, enemy) => {
				bullet.destroy();
				enemy.destroy();

				setTimeout(() => {
					this.createEnemyPlayer(scene);
				}, this.rebornTankTime);
			}
		);
		this.physics.add.collider(
			scene.treesLayer,
			this.bullets,
			(bullet, tree) => {
				bullet.destroy();
				// destroy tree with id
				if (tree.index === this.destroyTreeId) {
					scene.map.removeTileAt(tree.x, tree.y);
				}
			}
		);
	}

	onConnect() {
		console.log('Connected');
	}

	sharePosition() {
		if (this.enemyPlayer) {
			const { x, y } = this.enemyPlayer;

			this.playerSocket.emit('tank info', {
				x,
				y
			});
		}
	}
}
