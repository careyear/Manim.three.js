import {Animation} from './index.js';
import {draw, checkpoint, delay, fill, graphTransform, undraw, unfill,animateArray, removeArray, animateGraph, graphTransformParametricCartesian, graphTransformCartesianParametric, graphTransformParametric} from "./animations.js";

let anim = new Animation();
let line = anim.createLineCircle(1, 0, 0, 1000, true);
let mesh = anim.fill(line.geometry, 0xff00ff, 0);
anim.addText("\\begin{matrix}1 & x & x^2 \\\\1 & y & y^2 \\\\1 & z & z^2 \\end{matrix}\\\\\\sum_{i=1}^{\\infty}\\frac{1}{2^i}=1", '#ffffff', 8, 4);
let graph = anim.createGraph2D((x) => x * x - 2, 100, 1, true);
let pgraph = anim.createGraph2DParametric((t) => 4 * Math.cos(t), (t) => 2 * Math.sin(t), 0, 2 * Math.PI, 100, 1, true);
anim.scene.add(graph);
anim.scene.add(pgraph);
let myGraph = {
    nodes: [{x: 1, y: 1}, {x: 3, y: 1}, {x: 3, y: 2.5}, {x: 1, y: 2.5}],
    edges: [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]
};
let Graph = anim.createGraph(myGraph);
let myGraph2 = {
    nodes: [{x: -3, y: 0.5}, {x: -3, y: 1.5}, {x: -3, y: 2.5}, {x: -1, y: 0.5}, {x: -1, y: 1.5}, {x: -1, y: 2.5}],
    edges: [[0, 3], [1, 3], [0, 4], [0, 5], [2, 5], [1, 3]]
};
let Graph2 = anim.createGraph(myGraph2);

let axis = anim.createPlotGrid(-10, 7, 10, -7, true);
anim.scene.add(axis[0]);
anim.scene.add(axis[1]);
anim.addAnimation(draw(axis[0],100));
anim.addAnimation(draw(axis[1],100));

let arr = anim.createArray(5, -4, 2, 0.5, true);
animateArray(anim, arr);
anim.addAnimation(checkpoint());
removeArray(anim, arr);
anim.addAnimation(draw(line, 10));
anim.addAnimation(fill(mesh, 0.005, 0.4));
anim.addAnimation(checkpoint());
anim.addAnimation(undraw({shape: line}, 10));
anim.addAnimation(unfill(mesh));
anim.addAnimation(checkpoint());
anim.addAnimation(draw(line, 10));
anim.addAnimation(fill(mesh, 0.005, 0.4));
anim.addAnimation(checkpoint());
anim.addAnimation(undraw({shape: line}, 10));
anim.addAnimation(unfill(mesh));
anim.addAnimation(checkpoint());
anim.addAnimation(draw(graph, 100));
anim.addAnimation(checkpoint());
let temp = graphTransform(anim, graph, x => x * x - 2, x => x * x * x, 100, 1);
anim.addAnimation(temp);
anim.addAnimation(checkpoint());
anim.addAnimation(delay());
anim.addAnimation(checkpoint());
let temp2 = graphTransform(anim, temp, x => x * x * x, x => Math.sin(x), 100, 1);
anim.addAnimation(temp2);
anim.addAnimation(checkpoint());
anim.addAnimation(delay());
anim.addAnimation(checkpoint());
anim.addAnimation(undraw({shape: temp2}, 10));
anim.addAnimation(checkpoint());
anim.addAnimation(draw(pgraph, 30));
anim.addAnimation(checkpoint());
let temp3 = graphTransformParametricCartesian(
    anim,pgraph,
    (t) => 4 * Math.cos(t), (t) => 2 * Math.sin(t),
    (x) => x,
    0, 2 * Math.PI, 100, 1
);
anim.addAnimation(temp3);
anim.addAnimation(checkpoint());
anim.addAnimation(delay())
let temp4 = graphTransformCartesianParametric(
    anim,temp3,
    (x) => x,
    (t) => 4 * Math.cos(t), (t) => 2 * Math.sin(t),
    0, 2 * Math.PI, 100, 1
);
anim.addAnimation(temp4);
anim.addAnimation(checkpoint());
anim.addAnimation(delay());
let temp5 = graphTransformParametric(
    anim,temp4,
    (t) => 4 * Math.cos(t), (t) => 2 * Math.sin(t),
    (t) => 3 * Math.cos(t), (t) => 3 * Math.sin(t),
    0, 2 * Math.PI, 100, 1
);
anim.addAnimation(temp5);
anim.addAnimation(checkpoint());
anim.addAnimation(undraw({shape: temp5}, 30));
anim.addAnimation(checkpoint());
animateGraph(anim, myGraph, Graph);
animateGraph(anim, myGraph2, Graph2);
