export default function createBackground(scene) {
	const image = scene.add.image(
		scene.cameras.main.width / 2,
		scene.cameras.main.height / 2,
		'sky'
	);

	const scaleX = scene.cameras.main.width / image.width;
	const scaleY = scene.cameras.main.height / image.height;
	const scale = Math.max(scaleX, scaleY);
	image.setScale(scale).setScrollFactor(0);
}
