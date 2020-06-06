import {Animation} from './index.js';
import {draw, checkpoint, fadeOut, fadeIn, move, delay, fill, graphTransform, undraw, unfill,animateArray, removeArray, showGraph, removeGraph, graphTransformParametricCartesian, graphTransformCartesianParametric, graphTransformParametric, showArrow, removeArrow} from "./animations.js";
import {Text, Circle, Point, Arrow} from './mobjects.js';

(async () => {
    let anim = new Animation();

    let text = new Text(anim);
    await text.construct("\\begin{matrix} \\frac{\\delta^2 f}{\\delta x^2} & \\frac{\\delta^2 f}{\\delta x \\delta y} & \\frac{\\delta^2 f}{\\delta x \\delta z} " +
        "\\\\ \\frac{\\delta^2 f}{\\delta y \\delta x} & \\frac{\\delta^2 f}{\\delta y^2} & \\frac{\\delta^2 f}{\\delta y \\delta z}" +
        " \\\\ \\frac{\\delta^2 f}{\\delta z \\delta x} & \\frac{\\delta^2 f}{\\delta z \\delta y} & \\frac{\\delta^2 f}{\\delta z^2} \\end{matrix}\\", '#ffffff', 8, 0, 0
    );
    text.draw(150000);
    text.checkpoint();
    text.moveBy(-10, 0, 0);
    text.checkpoint();
    let circle = new Circle(anim);
    circle.construct(2, 0, 0);
    circle.draw(15);
    circle.checkpoint();
    circle.fill('#0000ff', 0, true, 0.5);
    circle.checkpoint();
    circle.unfill();
    circle.checkpoint();
    text.moveBy(10, 0, 0);
    let point = new Point(anim);
    point.construct(0, 0, '#fffe23');
    text.checkpoint();
    text.scale(2);
    text.checkpoint();
    text.delay();
    text.checkpoint();
    text.scale(0.5);
    let arrow = new Arrow(anim);
    arrow.construct(0, 0, 0, -10, 1, 0, '#00ffff');
    arrow.draw();
    // anim.addAnimation(move(anim, text, -8, -2, 0));
    // anim.addAnimation(checkpoint());
    // anim.addAnimation(fadeOut(anim, text));
    // anim.addAnimation(checkpoint());
    // anim.addAnimation(draw(axis, 50));
    // anim.addAnimation(showArrow(anim, arrow, Math.sqrt(2)));
    // anim.addAnimation(checkpoint());
    // let pos = axis.position;
    // anim.addAnimation(move(anim, arrow, pos.x - arrow.position.x, pos.y - arrow.position.y, 0));
    anim.play();
})();