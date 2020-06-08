import {Animation} from './index.js';
import {draw, checkpoint, fadeOut, fadeIn, move, delay, fill, graphTransform, undraw, unfill,animateArray, removeArray, showGraph, removeGraph, graphTransformParametricCartesian, graphTransformCartesianParametric, graphTransformParametric, showArrow, removeArrow} from "./animations.js";
import {Text, Circle, Point, Arrow, Line, constants} from './mobjects.js';

let {ORIGIN} = constants;

(async () => {
    let anim = new Animation();

    let text = new Text(anim);
    await text.construct("\\begin{matrix} \\frac{\\delta^2 f}{\\delta x^2} & \\frac{\\delta^2 f}{\\delta x \\delta y} & \\frac{\\delta^2 f}{\\delta x \\delta z} " +
        "\\\\ \\frac{\\delta^2 f}{\\delta y \\delta x} & \\frac{\\delta^2 f}{\\delta y^2} & \\frac{\\delta^2 f}{\\delta y \\delta z}" +
        " \\\\ \\frac{\\delta^2 f}{\\delta z \\delta x} & \\frac{\\delta^2 f}{\\delta z \\delta y} & \\frac{\\delta^2 f}{\\delta z^2} \\end{matrix}\\", '#ffffff', 8, ORIGIN
    );
    text.draw(150000);
    text.checkpoint();
    text.moveBy({x: -10, y: 0, z: 0});
    text.checkpoint();
    let circle = new Circle(anim);
    circle.construct(2, ORIGIN);
    circle.draw(15);
    circle.checkpoint();
    circle.fill('#0000ff', 0, true, 0.2);
    circle.checkpoint();
    text.moveBy({x: 10, y: 0, z: 0});
    let point = new Point(anim);
    point.construct(ORIGIN, '#fffe23');
    text.checkpoint();
    text.scale(2);
    text.checkpoint();
    text.delay();
    text.checkpoint();
    text.scale(0.5);
    let arrow = new Arrow(anim);
    arrow.construct(ORIGIN, {x: -5, y: 1, z: 0}, '#00ffff');
    arrow.draw();
    circle.moveTo(arrow.head.position);
    point.moveTo(circle.position);
    point.checkpoint();
    arrow.undraw();
    text.undraw(150000);
    let line = new Line(anim);
    line.construct(ORIGIN, circle.position, '#ffff00');
    line.checkpoint();
    line.draw(5.2);
    anim.play();
})();