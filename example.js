import {Animation} from './index.js';

let anim = new Animation(false);
anim.createArrow(0, 0, 0, 1, 1, 1, 'red', true);
anim.createCircle(1, 1000, 0, 2 * Math.PI);
anim.play();
