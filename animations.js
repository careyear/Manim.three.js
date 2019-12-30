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
export let fill = mesh => ({
    name: "fill",
    animate: () => {
        mesh.opacity += 0.005;
    },
    reset: () => {},
    terminateCond: () => (mesh.opacity >= 0.4)
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
