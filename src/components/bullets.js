import Phaser from 'phaser';

export default class Bullets extends Phaser.Physics.Arcade.Group {
	constructor(config) {
		super(config);
		this.velocity = 0;
	}
}
