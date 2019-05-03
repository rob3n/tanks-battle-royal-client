// import Phaser from 'phaser'

// export default class Tank extends Phaser.GameObjects.Sprite {
// 	constructor(config) {
// 		super(config.scene, config.x, config.y, config.key, config.cursors)
// 		config.scene.physics.world.enable(this)
// 		config.scene.add.existing(this)
// 		this.cursors = config.cursors
// 	}

// 	update() {
// 		const { width, height } = this.sys.game.canvas
// 		if (this.cursors.up.isDown && this.y >= 25) {
// 			this.y -= 5
// 			this.angle = -180
// 		} else if (this.cursors.down.isDown && this.y <= height - 25) {
// 			this.y += 5
// 			this.angle = 0
// 		}

// 		if (this.cursors.left.isDown && this.x >= 25) {
// 			this.x -= 5
// 			this.angle = 90
// 		} else if (this.cursors.right.isDown && this.x <= width - 25) {
// 			this.x += 5
// 			this.angle = -90
// 		}

// 		if (this.cursors.left.isDown && this.cursors.up.isDown) {
// 			this.angle = 135
// 		} else if (this.cursors.left.isDown && this.cursors.down.isDown) {
// 			this.angle = 45
// 		}

// 		if (this.cursors.right.isDown && this.cursors.up.isDown) {
// 			this.angle = -135
// 		} else if (this.cursors.right.isDown && this.cursors.down.isDown) {
// 			this.angle = -45
// 		}
// 	}
// }
