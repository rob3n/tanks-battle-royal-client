import Phaser from 'phaser';
import Menu from '../scenes/Menu';
import Game from '../scenes/Game';

export default {
	type: Phaser.AUTO,
	width: '100%',
	height: '100%',
	physics: {
		default: 'arcade',
		arcade: {
			debug: true
		}
	},
	scene: [Menu, Game]
};
