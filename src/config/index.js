import Phaser from 'phaser';

export default {
	type: Phaser.AUTO,
	width: '100%',
	height: '100%',
	physics: {
		default: 'arcade',
		arcade: {
			debug: true
		}
	}
};
