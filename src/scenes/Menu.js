import Phaser from 'phaser';
import constants from '../constants';

export default class Menu extends Phaser.Scene {
	constructor() {
		super({
			key: 'Menu'
		});
		this.music = null;
	}

	init() {}

	preload() {
		this.load.image('background', 'assets/menubg.png');
		this.load.audio('menuTrack', 'assets/2Pac.mp3');
	}

	create() {
		const background = this.add.image(0, 0, 'background').setOrigin(0);
		background.setDisplaySize(
			this.game.renderer.width,
			this.game.renderer.height
		);
		this.add.text(
			this.game.renderer.width / 2 - 300,
			200,
			'Tanks: Battle Royale',
			{
				fontSize: '54px',
				fontWeight: '300'
			}
		);

		const music = this.sound.add('menuTrack');
		const soundButton = this.add.text(20, 20, 'Play sound', {
			fontSize: '32px'
		});
		soundButton.setColor(constants.colors.disableItem);
		soundButton.setInteractive({
			useHandCursor: true
		});
		soundButton.on('pointerdown', () => {
			if (this.music === null) {
				soundButton.setColor(constants.colors.menuItem);
				music.play();
				this.music = true;
				return;
			}
			if (this.music) {
				soundButton.setColor(constants.colors.disableItem);
				music.pause();
				this.music = false;
				return;
			}
			soundButton.setColor(constants.colors.menuItem);
			this.music = true;
			music.resume();
		});

		const playButton = this.add.text(
			this.game.renderer.width / 2 - 55,
			500,
			'Play',
			{
				fontSize: '32px'
			}
		);
		playButton.setInteractive({
			useHandCursor: true
		});
		playButton.on('pointerover', () => {
			playButton.setColor(constants.colors.hoverMenuItem);
		});
		playButton.on('pointerout', () => {
			playButton.setColor(constants.colors.menuItem);
		});
		playButton.on('pointerdown', () => {
			music.stop();
			this.scene.start('Game');
		});

		const optionsButton = this.add.text(
			this.game.renderer.width / 2 - 75,
			550,
			'Options',
			{
				fontSize: '32px'
			}
		);
		optionsButton.setColor(constants.colors.disableItem);
	}
}
