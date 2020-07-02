import {Animation} from './index.js';
import {Text, Circle, Arrow, Line} from './mobjects.js';

(async () => {
	let anim = new Animation({autoplay: false});

	let text = new Text(anim);
	await text.construct("Thanks!", '#00CCFF', 6, {x: -1, y: 0});
	text.write(170000);
	text.checkpoint();
	text.undraw(170000);

	anim.play();
})();