import {Animation} from './index.js';
import {Text, Circle, Arrow, Line, GraphTheory} from './mobjects.js';

(async () => {
	let bg = new Animation({controls: false, autoReplay: false});

	let gbg = new GraphTheory(bg);
	await gbg.construct({
		nodes: [
			{x: 4 - 0.35, y: 0.5, label: "C"},
			{x: 4 + 0.35, y: 0.5, label: "Y"},
			{x: 4, y: 0, label: "\\overrightarrow{u}", labelColor: '#e6df2c'}
		],
		edges: [[0, 1], [1, 2], [0, 2]]
	}, false, 0.35);
	gbg.draw();

	bg.play();
})();