export let checkpoint = () => ({
   name: "checkpoint"
});
export let delay = () => ({
   name: "delay"
});
export let draw = (shape, size) => {
    let ret = {
        name: "draw",
        fraction: 0,
        animate: () => {
            ret.fraction += 0.01;
            shape.material.dashSize = ret.fraction * size;
        },
        reset: () => {
            ret.fraction = 0;
        },
        terminateCond: () => (ret.fraction >= 1)
    };
    return ret;
};
export let undraw = (shape, size) => {
    let ret = {
        name: "undraw",
        fraction: 1,
        shape: shape,
        animate: () => {
            if(ret.fraction === 1)
                ret.shape = ret.shape.shape.past || ret.shape.shape;
            ret.fraction -= 0.03;
            ret.shape.material.dashSize = ret.fraction * size;
        },
        reset: () => {
            ret.fraction = 1;
        },
        terminateCond: () => (ret.fraction <= 0)
    };
    return ret;
};
export let fill = (mesh, step = 0.005, to = 1) => ({
    name: "fill",
    animate: () => {
        mesh.opacity += step;
    },
    reset: () => {},
    terminateCond: () => (mesh.opacity >= to)
});
export let unfill = mesh => ({
    name: "unfill",
    animate: () => {
        mesh.opacity -= 0.01;
    },
    reset: () => {},
    terminateCond: () => (mesh.opacity <= 0)
});
export let graphTransform = (anim, pastInit, fromFunc, toFunc, segCnt, zoom) => {
    let ret = {
        name: "graph transform",
        fraction: 0,
        past: pastInit,
        animate: () => {
            if(ret.fraction === 0)
                ret.past = pastInit.past || pastInit;
            ret.fraction += 0.02;
            ret.past.material.dashSize = 0;
            ret.past = anim.graphTransform(fromFunc, toFunc, segCnt, zoom, ret.fraction);
        },
        reset: () => {
            ret.fraction = 0;
        },
        terminateCond: () => (ret.fraction >= 1)
    };
    return ret;
};
export let graphTransformParametric = (anim, pastInit, fromxfunc,fromyfunc, toxfunc, toyfunc, from, to, segCnt, zoom) => {
    let ret = {
        name: "graph transform parametric",
        fraction: 0,
        past: pastInit,
        animate: () => {
            if(ret.fraction === 0)
                ret.past = pastInit.past || pastInit;
            ret.fraction += 0.02;
            ret.past.material.dashSize = 0;
            ret.past = anim.graphTransformParametric(fromxfunc,fromyfunc, toxfunc, toyfunc, from, to, segCnt, zoom, ret.fraction);
        },
        reset: () => {
            ret.fraction = 0;
        },
        terminateCond: () => (ret.fraction >= 1)
    };
    return ret;
};
export let graphTransformParametricCartesian = (anim, pastInit, fromxfunc, fromyfunc, tofunc, from, to, segCnt, zoom) => {
    let ret = {
        name: "graph transform parametric cartesian",
        fraction: 0,
        past: pastInit,
        animate: () => {
            if(ret.fraction === 0)
                ret.past = pastInit.past || pastInit;
            ret.fraction += 0.02;
            ret.past.material.dashSize = 0;
            ret.past = anim.graphTransformParametricCartesian(fromxfunc, fromyfunc, tofunc, from, to, segCnt, zoom, ret.fraction);
        },
        reset: () => {
            ret.fraction = 0;
        },
        terminateCond: () => (ret.fraction >= 1)
    };
    return ret;
};
export let graphTransformCartesianParametric = (anim, pastInit, fromfunc, toxfunc, toyfunc, from, to, segCnt, zoom) => {
    let ret = {
        name: "graph transform cartesian parametric",
        fraction: 0,
        past: pastInit,
        animate: () => {
            if(ret.fraction === 0)
                ret.past = pastInit.past || pastInit;
            ret.fraction += 0.02;
            ret.past.material.dashSize = 0;
            ret.past = anim.graphTransformCartesianParametric(fromfunc, toxfunc, toyfunc, from, to, segCnt, zoom, ret.fraction);
        },
        reset: () => {
            ret.fraction = 0;
        },
        terminateCond: () => (ret.fraction >= 1)
    };
    return ret;
};
export let showGraph = (anim, graph, geometry, directed = false, radius = 0.25) => {
    for(let i = 0;i <geometry.length; i++) {
        let obj = geometry[i];
        if(i < graph.nodes.length + graph.edges.length) {
            let index = i - graph.nodes.length;
            if (directed && index >= 0) {
                let x1 = graph.nodes[graph.edges[index][0]].x;
                let y1 = graph.nodes[graph.edges[index][0]].y;
                let x2 = graph.nodes[graph.edges[index][1]].x;
                let y2 = graph.nodes[graph.edges[index][1]].y;
                anim.addAnimation(showArrow(anim, obj, Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)) - radius));
            } else
                anim.addAnimation(draw(obj, 3));
        }
        else
            anim.addAnimation(draw(obj, 300000));
        if(i < graph.nodes.length) {
            anim.addAnimation(fill(anim.fill(obj.geometry, 0x000000, 0, graph.nodes[i].x, graph.nodes[i].y, 0.001), 1));
        }
    }
};
export let removeGraph = (anim, graph, geometry, directed = false, radius = 0.25) => {
    for(let i = 0;i <geometry.length; i++) {
        let obj = geometry[i];
        if(i < graph.nodes.length + graph.edges.length) {
            let index = i - graph.nodes.length;
            if (directed && index >= 0) {
                let x1 = graph.nodes[graph.edges[index][0]].x;
                let y1 = graph.nodes[graph.edges[index][0]].y;
                let x2 = graph.nodes[graph.edges[index][1]].x;
                let y2 = graph.nodes[graph.edges[index][1]].y;
                anim.addAnimation(removeArrow(anim, obj, Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)) - radius));
            } else
                anim.addAnimation(undraw({shape: obj}, 3));
        }
        else
            anim.addAnimation(undraw({shape: obj}, 300000));
    }
};
export let animateArray = (anim, geometry, length) => {
    for (let i = 0; i < geometry.length; i++) {
        if (i >= length)
            anim.addAnimation(draw(geometry[i], 120000));
        else
            anim.addAnimation(draw(geometry[i],8));
    }
};
export let removeArray = (anim, geometry, length) => {
    for(let i = 0; i < geometry.length; i++) {
        if (i >= length)
            anim.addAnimation(undraw({shape: geometry[i]}, 120000));
        else
            anim.addAnimation(undraw({shape: geometry[i]},8));
    }
};
export let showArrow = (anim, arrow, length) => {
    let ret = {
        name: "arrow animation",
        fraction: 0,
        animate: () => {
            ret.fraction += 0.02;
            arrow.setLength(length * ret.fraction, Math.min(0.2 * length * ret.fraction, 0.2), 0.5 * Math.min(0.2 * length * ret.fraction, 0.2));
        },
        reset: () => {
            ret.fraction = 0;
        },
        terminateCond: () => (ret.fraction >= 1)
    };
    return ret;
};
export let removeArrow = (anim, arrow, length) => {
    let ret = {
        name: "arrow animation",
        fraction: 1,
        animate: () => {
            ret.fraction -= 0.02;
            arrow.setLength(length * ret.fraction);
        },
        reset: () => {
            ret.fraction = 0;
        },
        terminateCond: () => (ret.fraction <= 0)
    };
    return ret;
};

