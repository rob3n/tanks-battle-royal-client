import Phaser from 'phaser';
import constants from '../constants';

export default class Result extends Phaser.Scene {
	constructor() {
		super({
			key: 'Result'
		});
		this.state = null;
		console.log(123123);
	}

	init(data) {
		this.state = data.result;
	}

	preload() {
		console.log('preload');
	}

	create() {
		const resultText = this.add.text(
			this.game.renderer.width / 2 - 120,
			200,
			`You ${this.state}`,
			{
				fontSize: '54px',
				fontWeight: '300'
			}
		);
		const goToMenuText = this.add.text(
			this.game.renderer.width / 2 - 100,
			this.game.renderer.height / 2,
			`Main menu`,
			{
				fontSize: '32px',
				fontWeight: '300'
			}
		);
		goToMenuText.setInteractive({
			useHandCursor: true
		});
		goToMenuText.on('pointerover', () => {
			goToMenuText.setColor(constants.colors.hoverMenuItem);
		});
		goToMenuText.on('pointerout', () => {
			goToMenuText.setColor(constants.colors.menuItem);
		});
		goToMenuText.on('pointerdown', () => {
			this.scene.start('Menu');
		});

		const repeatText = this.add.text(
			this.game.renderer.width / 2 - 70,
			this.game.renderer.height / 2 + 50,
			`Repeat`,
			{
				fontSize: '32px',
				fontWeight: '300'
			}
		);
		repeatText.setInteractive({
			useHandCursor: true
		});
		repeatText.on('pointerout', () => {
			repeatText.setColor(constants.colors.menuItem);
		});
		repeatText.on('pointerover', () => {
			repeatText.setColor(constants.colors.hoverMenuItem);
		});
		repeatText.on('pointerdown', () => {
			this.scene.start('Game');
		});
	}
}
