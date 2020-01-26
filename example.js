import {Animation} from './index.js';
import {draw, checkpoint, delay, fill, graphTransform, undraw, unfill,animateArray, removeArray, showGraph, removeGraph, graphTransformParametricCartesian, graphTransformCartesianParametric, graphTransformParametric, showArrow, removeArrow} from "./animations.js";


(async () => {
    let anim = new Animation();
    let arrow = anim.createArrow(0, 0, 0, 1, 1, 0, 0.0002, 0xffffff, true);
    let line = anim.createLineCircle(1, 0, 0, 1000, true);
    let mesh = anim.fill(line.geometry, 0xff00ff, 0);
    let graph = anim.createGraph2D((x) => x * x - 2, 100, 1, true);
    let pgraph = anim.createGraph2DParametric((t) => 4 * Math.cos(t), (t) => 2 * Math.sin(t), 0, 2 * Math.PI, 100, 1, true);
    anim.scene.add(graph);
    anim.scene.add(pgraph);
    let myGraph = {
        nodes: [{x: 1, y: 1}, {x: 3, y: 1}, {x: 3, y: 2.5}, {x: 1, y: 2.5}],
        edges: [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]
    };
    let myGraph2 = {
        nodes: [{x: -3, y: 0.5}, {x: -3, y: 1.5}, {x: -3, y: 2.5}, {x: -1, y: 0.5}, {x: -1, y: 1.5}, {x: -1, y: 2.5}],
        edges: [[0, 3], [1, 3], [0, 4], [0, 5], [2, 5], [1, 3]]
    };

    let axis = anim.createPlotGrid(-10, 7, 10, -7, true);
    anim.scene.add(axis[0]);
    anim.scene.add(axis[1]);
    let mesh_array = await anim.addText("\\begin{matrix}1 0 & x & x^2 \\\\1 & y & y^2 \\\\1 & xy & z^2 \\end{matrix}\\", '#ffffff', 8, 3, 2);

    anim.addAnimation(showArrow(anim, arrow, Math.sqrt(2)));
    anim.addAnimation(checkpoint());
    anim.addAnimation(removeArrow(anim, arrow, Math.sqrt(2)));
    //
    for (let i = 0; i < mesh_array.length; i++)
        anim.addAnimation(draw(mesh_array[i], 150000));
    anim.addAnimation(checkpoint());
    anim.addAnimation(draw(axis[0], 100));
    anim.addAnimation(draw(axis[1], 100));
    anim.addAnimation(checkpoint());
    for (let i = 0; i < mesh_array.length; i++)
        anim.addAnimation(undraw({shape: mesh_array[i]}, 150000));
    anim.addAnimation(checkpoint());
    anim.addAnimation(delay());
    let arr = await anim.createArray(["A_0", "A_1", "A_2", "A_4"], -4, 2, 0.5, true);
    animateArray(anim, arr, 4);
    anim.addAnimation(checkpoint());
    anim.addAnimation(delay());
    removeArray(anim, arr, 4);
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
        anim, pgraph,
        (t) => 4 * Math.cos(t), (t) => 2 * Math.sin(t),
        (x) => x,
        0, 2 * Math.PI, 100, 1
    );
    anim.addAnimation(temp3);
    anim.addAnimation(checkpoint());
    anim.addAnimation(delay());
    let temp4 = graphTransformCartesianParametric(
        anim, temp3,
        (x) => x,
        (t) => 4 * Math.cos(t), (t) => 2 * Math.sin(t),
        0, 2 * Math.PI, 100, 1
    );
    anim.addAnimation(temp4);
    anim.addAnimation(checkpoint());
    anim.addAnimation(delay());
    let temp5 = graphTransformParametric(
        anim, temp4,
        (t) => 4 * Math.cos(t), (t) => 2 * Math.sin(t),
        (t) => 3 * Math.cos(t), (t) => 3 * Math.sin(t),
        0, 2 * Math.PI, 100, 1
    );
    anim.addAnimation(temp5);
    anim.addAnimation(checkpoint());
    anim.addAnimation(undraw({shape: temp5}, 30));
    anim.addAnimation(undraw({shape: axis[0]}, 100));
    anim.addAnimation(undraw({shape: axis[1]}, 100));
    anim.addAnimation(checkpoint());
    anim.addAnimation(delay());
    let Graph = await anim.createGraph(myGraph);
    showGraph(anim, myGraph, Graph);
    let Graph2 = await anim.createGraph(myGraph2, true);
    showGraph(anim, myGraph2, Graph2, true);
    let array = await anim.addText("\\sum_{i=1}^{\\infty}\\frac{1}{2^i}=1", '#ffffff', 8, -1, -1);
    for (let i = 0; i < array.length; i++)
        anim.addAnimation(draw(array[i], 400000));
    anim.addAnimation(checkpoint());
    anim.addAnimation(delay());
    for (let i = 0; i < array.length; i++)
        anim.addAnimation(undraw({shape: array[i]}, 400000));
    anim.addAnimation(checkpoint());
    removeGraph(anim, myGraph, Graph);
    removeGraph(anim, myGraph2, Graph2, true);
    // anim.record();
    anim.play();
})();