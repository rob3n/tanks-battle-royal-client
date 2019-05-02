import Phaser from 'phaser'
import GameScene from './scenes/GameScene'
import config from './config'

class Game extends Phaser.Game {
	constructor() {
		super(config)

		this.scene.add('Game', GameScene)
		this.scene.start('Game')
	}
}

window.onload = () => {
	window.game = new Game()
}
