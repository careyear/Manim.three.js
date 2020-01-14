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
export let animateGraph = (anim, graph, geometry) => {
    for(let i in geometry) {
    let obj = geometry[i];
    anim.addAnimation(draw(obj, 3));
    if(i < graph.nodes.length) {
        anim.addAnimation(fill(anim.fill(obj.geometry, 0x000000, 0, graph.nodes[i].x, graph.nodes[i].y, 0.001), 1));

    }
}
};
export let animateArray = (anim, geometry) => {
    for (let i in geometry) {
        let obj = geometry[i];
        anim.addAnimation(draw(obj,3));
    }
};
export let removeArray = (anim, geometry) => {
    for(let i in geometry) {
        let obj = geometry[i];
        anim.addAnimation(undraw({shape: obj},2));
    }
};

