import {Animation} from './index.js';

let anim = new Animation(true);
// anim.createArrow(0, 0, 0, 1, 1, 1, 'red', true);
let line = anim.createLineCircle(1, 1000, true);
let mesh = anim.fill(line.geometry, 0xff00ff, 0);
anim.addText("\\begin{matrix}1 & x & x^2 \\\\1 & y & y^2 \\\\1 & z & z^2 \\end{matrix}", '#ffffff', 50);
let graph = anim.createGraph2D((x) => x * x - 2, 100, 1, true);
anim.scene.add(graph);
anim.createPlotGrid();
let animation = [
    {
        name: "draw square",
        fraction: 0,
        animate: () => {
            animation[0].fraction = (animation[0].fraction + 0.01);
            line.material.dashSize = animation[0].fraction * 10;
        },
        reset: () => {
            animation[0].fraction = 0;
        },
        terminateCond: () => (animation[0].fraction >= 1)
    },
    {
        name: "remove square",
        fraction: 1,
        animate: () => {
            animation[1].fraction = (animation[1].fraction - 0.03);
            line.material.dashSize = animation[1].fraction * 10;
        },
        reset: () => {
            animation[1].fraction = 1;
        },
        terminateCond: () => (animation[1].fraction <= 0)
    },
    {
        name: "fill square",
        animate: () => {
            mesh.opacity += 0.005;
        },
        reset: () => {},
        terminateCond: () => (mesh.opacity >= 0.4)
    },
    {
        name: "unfill square",
        animate: () => {
            mesh.opacity -= 0.01;
        },
        reset: () => {},
        terminateCond: () => (mesh.opacity <= 0)
    },
    {
        name: "draw graph",
        fraction: 0,
        animate: () => {
            animation[4].fraction = (animation[4].fraction + 0.01);
            graph.material.dashSize = animation[4].fraction * 100;
        },
        reset: () => {
            animation[4].fraction = 0;
        },
        terminateCond: () => (animation[4].fraction >= 1)
    },
    {
        name: "graph transform",
        fraction: 0,
        past: graph,
        animate: () => {
                animation[5].fraction += 0.01;
                animation[5].past.material.dashSize = 0;
                animation[5].past = anim.graphTransform(x => x * x - 2, x => x * x * x, 100, 1, animation[5].fraction);
            },
        reset: () => {
            animation[5].fraction = 0;
        },
        terminateCond: () => (animation[5].fraction >= 1)
    },
    {
        name: "graph transform",
        fraction: 0,
        animate: () => {
            if(animation[6].fraction === 0)
                animation[6].past = animation[5].past;
            animation[6].fraction += 0.02;
            animation[6].past.material.dashSize = 0;
            animation[6].past = anim.graphTransform(x => x * x * x, x => Math.sin(x), 100, 1, animation[6].fraction);
        },
        reset: () => {
            animation[6].fraction = 0;
        },
        terminateCond: () => (animation[6].fraction >= 1)
    }
];
anim.addAnimation(animation[0]);
anim.addAnimation(animation[2]);
anim.addAnimation({name: "checkpoint"});
anim.addAnimation(animation[1]);
anim.addAnimation(animation[3]);
anim.addAnimation({name: "checkpoint"});
anim.addAnimation(animation[0]);
anim.addAnimation(animation[2]);
anim.addAnimation({name: "checkpoint"});
anim.addAnimation(animation[1]);
anim.addAnimation(animation[3]);
anim.addAnimation({name: "checkpoint"});
anim.addAnimation(animation[0]);
anim.addAnimation(animation[2]);
anim.addAnimation({name: "checkpoint"});
anim.addAnimation(animation[1]);
anim.addAnimation(animation[3]);
anim.addAnimation({name: "checkpoint"});
anim.addAnimation(animation[4]);
anim.addAnimation({name: "checkpoint"});
anim.addAnimation(animation[5]);
anim.addAnimation({name: "checkpoint"});
anim.addAnimation({name: "delay"});
anim.addAnimation({name: "checkpoint"});
anim.addAnimation(animation[6]);
anim.play();
