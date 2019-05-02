import Phaser from 'phaser'
import createBackground from '../components/background'

let tank
let cursors

export default class GameScene extends Phaser.Scene {
	constructor() {
		super('Game')
	}

	preload() {
		this.load.image('tank_blue', 'assets/tank_blue.png')
		this.load.image('sky', 'http://labs.phaser.io/assets/skies/nebula.jpg')
	}

	create() {
		createBackground(this)
		tank = this.add.sprite(100, 100, 'tank_blue')
		tank.scaleX = 0.5
		tank.scaleY = 0.5
		cursors = this.input.keyboard.createCursorKeys()
	}

	update() {
		const { width, height } = this.sys.game.canvas
		if (cursors.up.isDown && tank.y >= 25) {
			tank.y -= 5
			tank.angle = -180
		} else if (cursors.down.isDown && tank.y <= height - 25) {
			tank.y += 5
			tank.angle = 0
		}

		if (cursors.left.isDown && tank.x >= 25) {
			tank.x -= 5
			tank.angle = 90
		} else if (cursors.right.isDown && tank.x <= width - 25) {
			tank.x += 5
			tank.angle = -90
		}

		if (cursors.left.isDown && cursors.up.isDown) {
			tank.angle = 135
		} else if (cursors.left.isDown && cursors.down.isDown) {
			tank.angle = 45
		}

		if (cursors.right.isDown && cursors.up.isDown) {
			tank.angle = -135
		} else if (cursors.right.isDown && cursors.down.isDown) {
			tank.angle = -45
		}
	}
}
