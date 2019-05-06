import Phaser from 'phaser';
import Bullets from './bullets';

const TANK_MAX_VELOCITY = 100;
const SHOOTING_TIMEOUT_MS = 500;
const BULLET_SPEED = 300;

// need added bullets logic: WIP

export default class Tank extends Phaser.Physics.Arcade.Sprite {
	constructor(config) {
		super(config.scene, config.x, config.y, config.key);
		this.velocity = 0;
		this.acceleration = 5;
		this.lastFired = +new Date();
		this.bullets = new Bullets({
			defaultKey: 'bullet',
			maxSize: 20,
			runChildUpdate: true
		});

		config.scene.physics.world.enable(this);
		config.scene.add.existing(this);
		this.setScale(config.scale, config.scale);
		this.setTexture(config.texture);
		this.setMaxVelocity(TANK_MAX_VELOCITY, TANK_MAX_VELOCITY);
		this.setCollideWorldBounds(true);
		this.setSize(config.width, config.height);
		// centered
		this.setOffset(1, 1);
		this.setVelocity(config.velocity, config.velocity);
		this.setAcceleration(config.acceleration);
		this.setAngle(0);
	}

	update(keys) {
		const input = {
			left: keys.left.isDown,
			right: keys.right.isDown,
			down: keys.down.isDown,
			up: keys.up.isDown,
			fire: keys.fire.isDown
		};

		if (input.up && this.velocity < TANK_MAX_VELOCITY) {
			this.velocity += this.acceleration;
		}

		if (input.down && this.velocity > (TANK_MAX_VELOCITY * -1) / 2) {
			if (this.velocity > 0) {
				this.velocity -= this.acceleration * 2;
			} else {
				this.velocity -= this.acceleration / 2;
			}
		}

		// check variants for condition: WIP
		this.setVelocity(
			this.velocity * Math.cos((this.angle - 90) * 0.01745),
			this.velocity * Math.sin((this.angle - 90) * 0.01745)
		);

		if (input.left) {
			this.setAngularVelocity((-5 * this.velocity) / 10);
		} else if (input.right) {
			this.setAngularVelocity((5 * this.velocity) / 10);
		} else {
			this.setAngularVelocity(0);
		}

		/**
		 * PROTOTYPE OF SHOOTING; WIP
		 */
		const fireTimestamp = +new Date();
		if (input.fire && fireTimestamp - this.lastFired > SHOOTING_TIMEOUT_MS) {
			this.lastFired = fireTimestamp;
			// this.fire();
		}
	}

	fire(bullets) {
		const bullet = bullets.create(this.x, this.y);
		if (bullet) {
			bullet.setAngle(this.angle);
			bullet.setVelocity(
				BULLET_SPEED * Math.cos((this.angle - 90) * 0.01745),
				BULLET_SPEED * Math.sin((this.angle - 90) * 0.01745)
			);
		}
	}

	destroyBullets() {
		const bullets = this.bullets.children.entries;
		if (bullets.length) {
			for (let i = 0; i < bullets.length; i += 1) {
				const bullet = bullets[i];

				if (bullet.y <= 0) {
					bullet.destroy();
				}

				if (bullet.y >= this.cameras.main.height) {
					bullet.destroy();
				}

				if (bullet.x <= 0) {
					bullet.destroy();
				}
			}
		}
	}
}
