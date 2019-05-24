import Phaser from 'phaser';
import io from 'socket.io-client';
import Tank from '../components/tank';
import constants from '../constants';

export default class Game extends Phaser.Scene {
	constructor() {
		super({
			key: 'Game'
		});
		this.map = null;
		this.treesLayer = null;
		this.cursors = null;
		this.bullets = null;
		this.rebornTankTime = 4000;
		this.destroyTreeId = 57;
		this.players = {};
		this.listPlayer = [];

		this.playerConfig = {
			scene: this,
			key: 'tank_first',
			x: 350 + Math.random() * 100,
			y: 350 - Math.random() * 100,
			texture: 'tank_blue',
			scale: 0.6,
			width: 84,
			height: 92,
			velocity: 0,
			acceleration: 5,
			angle: 0
		};
		this.defaultBulletConfig = {
			defaultKey: 'bullet',
			maxSize: 20,
			runChildUpdate: true
		};

		this.playerSocket = io('http://localhost:3000');
		this.playerSocket.on('connect', this.onConnect.bind(this));
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
		const tileset = this.map.addTilesetImage('all_tiles', 'tiles');
		this.background = this.map.createStaticLayer('BackLayer', tileset, 0, 0);
		this.treesLayer = this.map.createDynamicLayer('TreesLayer', tileset, 0, 0);
		this.treesLayer.setCollisionByProperty({ collides: true });

		this.playerSocket.on('player disconnect', playerId => {
			if (!this.players[playerId]) {
				return;
			}
			this.players[playerId].destroy();
			delete this.players[playerId];
		});

		this.createPlayer();
		this.cursors = this.input.keyboard.createCursorKeys();

		this.playerSocket.on('tanks info', this.updatePlayers.bind(this));
		this.playerSocket.on('new player', info =>
			this.createEnemyPlayer(this, info)
		);
		this.playerSocket.on('destroyed tree', (tree) => {
			if (this.map && Object.keys(tree).length) {
				this.map.removeTileAt(tree.x, tree.y);
			}
		});

		const toMenuText = this.add.text(20, 20, `Menu`, {
			fontSize: '32px',
			fontWeight: '300'
		});
		toMenuText.setInteractive({
			useHandCursor: true
		});
		toMenuText.on('pointerout', () => {
			toMenuText.setColor(constants.colors.menuItem);
		});
		toMenuText.on('pointerover', () => {
			toMenuText.setColor(constants.colors.hoverMenuItem);
		});
		toMenuText.on('pointerdown', () => {
			this.scene.start('Menu');
		});
	}

	update() {
		const playerKeys = {
			left: this.cursors.left,
			right: this.cursors.right,
			down: this.cursors.down,
			up: this.cursors.up,
			fire: this.cursors.space
		};

		this.player.update(playerKeys, this.bullets);
		this.player.destroyBullets(this.bullets);
		this.sharePosition();
	}

	createPlayer() {
		this.player = new Tank(this.playerConfig);
		this.bullets = this.physics.add.group(this.defaultBulletConfig);
		this.physics.add.collider(this.player, this.treesLayer);
		this.physics.add.collider(this.player, this.enemyPlayer);
		this.physics.add.collider(
			this.player,
			this.enemyBullets,
			(bullet, player) => {
				bullet.destroy();
				player.destroy();

				this.playerSocket.on('endgame', playerId => {
					if (!this.players[playerId]) {
						return;
					}
					this.players[playerId].destroy();
					delete this.players[playerId];
				});

				this.scene.start('Result', { result: 'Lose' });
			}
		);
		this.physics.add.collider(this.treesLayer, this.bullets, (bullet, tree) => {
			bullet.destroy();
			if (tree.index === this.destroyTreeId) {
				this.map.removeTileAt(tree.x, tree.y);
			}
		});
	}

	createEnemyPlayer(scene, info) {
		const enemyConfig = {
			scene: this,
			key: 'tank_second',
			x: info.x,
			y: info.y,
			texture: 'tank_red',
			width: 38,
			height: 46,
			velocity: 0,
			acceleration: 0
		};
		const enemy = new Tank(enemyConfig);
		this.bullets = this.physics.add.group(this.defaultBulletConfig);
		this.enemyBullets = this.physics.add.group(this.defaultBulletConfig);
		this.physics.add.collider(enemy, this.treesLayer);
		this.physics.add.collider(enemy, this.player);
		this.physics.add.collider(enemy, this.bullets, (bullet, enemyTank) => {
			bullet.destroy();
			enemyTank.destroy();

			this.scene.start('Result', { result: 'Win' });
		});
		this.physics.add.collider(
			scene.treesLayer,
			this.bullets,
			(bullet, tree) => {
				bullet.destroy();
				if (tree.index === this.destroyTreeId) {
					const { x, y } = tree;
					scene.map.removeTileAt(x, y);
					this.playerSocket.emit('destroyed tree', { x, y });
				}
			}
		);
		this.players[info.id] = enemy;
	}

	onConnect() {
		console.log('Connected');
	}

	sharePosition() {
		const { x, y, angle } = this.player;
		this.playerSocket.emit('tank info', { x, y, angle });
	}

	updatePlayers(info) {
		if (info.id === this.playerSocket.id) return;
		if (!this.players[info.id]) {
			this.createEnemyPlayer(this, info);
			return;
		}

		this.players[info.id].x = info.x;
		this.players[info.id].y = info.y;
		this.players[info.id].angle = info.angle;
	}
}
