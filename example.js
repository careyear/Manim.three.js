import {Animation} from './index.js';
import {draw, checkpoint, fadeOut, fadeIn, move, delay, fill, graphTransform, undraw, unfill,animateArray, removeArray, showGraph, removeGraph, graphTransformParametricCartesian, graphTransformCartesianParametric, graphTransformParametric, showArrow, removeArrow} from "./animations.js";
import {Text, Circle, Point, Arrow, Line, Polygon, GraphTheory, constants} from './mobjects.js';

let {ORIGIN} = constants;

(async () => {
	let anim = new Animation();

	let text = new Text(anim);
	await text.construct("\\begin{matrix} \\frac{\\delta^2 f}{\\delta x^2} & \\frac{\\delta^2 f}{\\delta x \\delta y} & \\frac{\\delta^2 f}{\\delta x \\delta z} " +
		"\\\\ \\frac{\\delta^2 f}{\\delta y \\delta x} & \\frac{\\delta^2 f}{\\delta y^2} & \\frac{\\delta^2 f}{\\delta y \\delta z}" +
		" \\\\ \\frac{\\delta^2 f}{\\delta z \\delta x} & \\frac{\\delta^2 f}{\\delta z \\delta y} & \\frac{\\delta^2 f}{\\delta z^2} \\end{matrix}\\", '#ffffff', 8, ORIGIN
	);
	let text2 = new Text(anim);
	let pos = text.down(2.3);
	pos.x -= 4;
	await text2.construct("Try\\ to\\ increase\\ the\\ size\\ of\\ the\\ text\\ by\\ 1 . 2\\ times .", '#ffd829', 8, pos);

	text.draw(150000);
	text.checkpoint();
	text.moveBy({x: -10, y: 0, z: 0});
	let trackable2 = {
		name: "textSizing2",
		min: "0.1",
		max: "3",
		defaultValue: "1",
		label: "Text Size",
		animate: value => text.object.scale.multiplyScalar(value / trackable2.value),
		type: "slider"
	};
	let trackable = {
		name: "textSizing",
		type: "input",
		defaultValue: "1",
		label: "Text Size",
		animate: value => {
			if(!value) return;
			text.object.scale.multiplyScalar(value / trackable.value);
			trackable.value = value;
		},
	};
	text.checkpoint();
	text2.write(155000);
	anim.addTrackable(trackable);
	anim.addTrackable(trackable2);
	anim.addHook({
	    condition: () => trackable2.value > 1.2,
	    onSatisfied: () => console.log("SATISFIED"),
	});
	text2.undraw(155000);
	text.checkpoint();
	text.moveBy({x: 10, y: 0});
	text.checkpoint();

	anim.play();
})();