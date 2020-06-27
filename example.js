import {Animation} from './index.js';
import {Text, Circle, Arrow, Line} from './mobjects.js';

(async () => {
	let anim = new Animation({});

	let l1 = new Arrow(anim);
	l1.construct({x: -0.5, y: 1}, {x: -0.5, y: -0.5}, '#3b5aff');
	let l2 = new Arrow(anim);
	l2.construct({x: 0.5, y: 1}, {x: 0.5, y: -0.5}, '#3b5aff');
	let c1 = new Circle(anim);
	c1.construct(0.5, {x: -0.5, y: -0.5});
	let c2 = new Circle(anim);
	c2.construct(0.25, {x: 0.5, y: -0.5});

	let p = new Circle(anim);
	p.construct(1, {x: 0, y: 1});

	let lt1 = new Line(anim);
	lt1.construct({x: 0, y: 1}, {x: 0, y: 1.75}, '#ffffff');

	let lt2 = new Line(anim);
	lt2.construct({x: -1, y: 1.75}, {x: 1, y: 1.75}, '#ffffff');

	lt1.draw(12);
	lt2.draw(12);
	l1.draw(12);
	l2.draw(12);
	c1.draw(12);
	c2.draw(6);
	p.draw(12);

	let trackable = {
		name: "textSizing",
		min: "0.1",
		max: "3",
		defaultValue: "1",
		label: "Load size",
		init_x: c2.position.x,
		animate: value => c2.object.scale.multiplyScalar(value / trackable.value),
		type: "slider"
	};
	anim.addTrackable(trackable);
	anim.addHook({
		condition: () => trackable.value > 2,
		onSatisfied: () => {},
	});
	anim.removeTrackable("textSizing");

	l1.scale(0.5);
	l2.scale(1.5);
	c2.moveBy({x: 0, y: -1.5});
	c1.moveBy({x: 0, y: 1.5});

	l1.checkpoint();

	lt1.undraw(12);
	lt2.undraw(12);
	l1.undraw();
	l2.undraw();
	c1.undraw(12);
	c2.undraw(8);
	p.undraw(12);

	l1.checkpoint();
	let text = new Text(anim);
	text.construct("This\\ is\\ just\\ a\\ very\\ basic\\ animation.", '#ffffff', 8, {x: -5, y: 0.5});
	text.write(170000);
	let text2 = new Text(anim);
	text2.construct("Think\\ of\\ the\\ possibilities!", '#68c4ff', 8, {x: -4	, y: -0.5});
	text2.write(170000);
	text.checkpoint();

	anim.play();
})();