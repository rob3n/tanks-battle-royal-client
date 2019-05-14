import Phaser from 'phaser';
import Menu from '../scenes/Menu';
import Game from '../scenes/Game';
import Result from '../scenes/Result';

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
	scene: [Menu, Game, Result]
};
