import {
    ArrowHelper,
    BoxBufferGeometry,
    BufferAttribute,
    BufferGeometry,
    Color,
    DirectionalLight,
    DoubleSide,
    Geometry,
    HemisphereLight,
    LineBasicMaterial,
    LineDashedMaterial,
    Mesh,
    MeshBasicMaterial,
    MeshStandardMaterial,
    PerspectiveCamera,
    Scene,
    Shape,
    ShapeGeometry,
    SphereGeometry,
    sRGBEncoding,
    TextureLoader,
    Vector3,
    WebGLRenderer,
    Group
} from './node_modules/three/src/Three.js';
import {SVGLoader} from "./SVGLoader.js";
import {Mathjax, promisifyLoader} from "./index.js";

class Mobject {
	constructor(anim) {
		this.anim = anim;
		this.object = null;
	}
	construct = () => {};
	static easeInOut = t => t<.5 ? 2*t*t : -1+(4-2*t)*t;
	draw = size => {
		let ret = {
			name: "draw",
			fraction: 0,
			animate: () => {
				ret.fraction += 0.01;
				if(this.object.children && this.object.children.length > 0) {
					this.object.children.forEach(obj => obj.material.dashSize = ret.fraction * size);
				}
				else
					this.object.material.dashSize = ret.fraction * size;
			},
			reset: () => {
				ret.fraction = 0;
			},
			terminateCond: () => (ret.fraction >= 1)
		};
		this.anim.addAnimation(ret);
	};
	undraw = () => size => {
		let ret = {
			name: "undraw",
			fraction: 1,
			animate: () => {
				ret.fraction -= 0.03;
				if(this.object.children) {
					this.object.children.forEach(obj => obj.material.dashSize = ret.fraction * size);
				}
				else this.object.material.dashSize = Math.max(0, ret.fraction * size);
			},
			reset: () => {
				ret.fraction = 1;
			},
			terminateCond: () => (ret.fraction <= 0)
		};
		this.anim.addAnimation(ret);
	};

	checkpoint = () => this.anim.addAnimation({name: "checkpoint"});

	delay = () => this.anim.addAnimation({name: "delay"});

	fadeIn = () => {
		let ret = {
			name: "fade in",
			fraction: 0,
			animate: () => {
				ret.fraction += 0.02;
				if(this.object.children)
					this.object.children.forEach(obj => {obj.material.transparent = true; obj.material.opacity = Math.min(1, ret.fraction)});
				else {
					this.object.material.transparent = true;
					this.object.material.opacity = Math.min(1, ret.fraction);
				}
			},
			reset: () => {
				ret.fraction = 1;
			},
			terminateCond: () => (ret.fraction >= 1)
		};
		this.anim.addAnimation(ret);
	};
	fadeOut = () => {
		let ret = {
			name: "fade out",
			fraction: 1,
			animate: () => {
				ret.fraction -= 0.02;
				if(this.object.children)
					this.object.children.forEach(obj => {obj.material.transparent = true; obj.material.opacity = Math.max(0, ret.fraction)});
				else {
					this.object.material.transparent = true;
					this.object.material.opacity = Math.max(0, ret.fraction);
				}
			},
			reset: () => {
				ret.fraction = 0;
			},
			terminateCond: () => (ret.fraction <= 0)
		};
		this.anim.addAnimation(ret);
	};
	moveBy = (x, y, z=0) => {
		let ret = {
			name: "move object",
			fraction: 0,
			init_x: this.position.x,
			init_y: this.position.y,
			init_z: this.position.z,
			animate: () => {
				ret.fraction += 0.02;
				let mul = Mobject.easeInOut(ret.fraction);
				this.object.position.set(ret.init_x + x * mul,
					ret.init_y + y * mul,
					ret.init_z + z * mul,
					);
			},
			reset: () => {
				ret.fraction = 0;
			},
			terminateCond: () => (ret.fraction >= 1)
		};
		this.position = {x: this.position.x + x, y: this.position.y + y, z: this.position.z + z};
		this.anim.addAnimation(ret);
	};
	fill = (color, opacity, animate = false, to = 1, step = 0.02) => {
		let material = new MeshBasicMaterial({color: color, side: DoubleSide, transparent: true, opacity: opacity});
		let mesh = new Mesh(this.object.children[0].geometry, material);
		mesh.position.set(this.object.position.x, this.object.position.y, this.object.position.z);
		this.object.add(mesh);
		this.anim.addAnimation({
			name: "fill",
			animate: () => {
				mesh.material.opacity += step;
			},
			reset: () => {
			},
			terminateCond: () => (mesh.material.opacity >= to)
		});
	};
	unfill = (step = 0.02) => {
		this.anim.addAnimation({
			name: "unfill",
			animate: () => {
				this.object.children[1].material.opacity -= step;
			},
			reset: () => {
			},
			terminateCond: () => (this.object.children[1].material.opacity <= 0)
		});
	};
	scale = (by, step = 0.02) => {
		let ret = {
			name: "scale",
			init_x: this.scaleVector.x,
			init_y: this.scaleVector.y,
			init_z: this.scaleVector.z,
			fraction: 1,
			mul: by < 1 ? -1 : 1,
			animate: () => {
				ret.fraction -= step;
				this.object.scale.x = ret.init_x * (by + (1 - by) * Mobject.easeInOut(ret.fraction));
				this.object.scale.y = ret.init_y * (by + (1 - by) * Mobject.easeInOut(ret.fraction));
				this.object.scale.z = ret.init_z * (by + (1 - by) * Mobject.easeInOut(ret.fraction));
			},
			reset: () => {},
			terminateCond: () => (ret.fraction <= 0)
		};
		this.scaleVector = {
			x: this.scaleVector.x * by,
			y: this.scaleVector.y * by,
			z: this.scaleVector.z * by
		};
		this.anim.addAnimation(ret);
	};
	up = () => ({

	});
	down = () => ({

	});
	left = () => ({

	});
	right = () => ({

	})
}

export class Line extends Mobject {

}

export class Text extends Mobject {
	construct = (content, color, textSize, x = 0, y = 0, z = 0, animate = true) => {
		Mathjax.texReset();
        return Mathjax.tex2svgPromise(content)
            .then(node => {
                let mainSVG = node.getElementsByTagName("svg")[0];
                let uses = mainSVG.getElementsByTagName("use");
                let defs = mainSVG.getElementsByTagName("defs")[0];
                let len = uses.length, app = [], par = [], rem = [];
                for(let i = 0;i < len; i++)
                {
                    let domElement = uses[i], id = domElement.attributes["xlink:href"];
                    app.push(defs.querySelector(id.value));
                    par.push(domElement.parentNode);
                    rem.push(domElement);
                }
                for(let i = 0;i < len; i ++) {
                    par[i].append(app[i].cloneNode(false));
                    par[i].removeChild(rem[i]);
                }
                mainSVG.removeChild(defs);
                mainSVG.setAttribute("xmlns", "http://www.w3.org/2000/svg");
                let url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(mainSVG)], {type: 'image/svg+xml'}));
                const SVGPromiseLoader = promisifyLoader(new SVGLoader());

                return SVGPromiseLoader.load(url);
            })
            .then((data) => {
                let paths = data.paths;

                let group = new Group();
                group.scale.multiplyScalar(0.00008 * textSize);
                group.position.x = x;
                group.position.y = y;
                group.position.z = z;
                group.scale.y *= -1;

                for (let i = 0; i < paths.length; i++) {

                    let shapes = paths[i].toShapes(true);

                    for (let j = 0; j < shapes.length; j++) {

                        let shape = shapes[j];
                        let geometry = new BufferGeometry().fromGeometry(new ShapeGeometry(shape));
                        let points = [];
                        let points_temp = geometry.attributes.position.array;
                        for (let i = 0; i < points_temp.length; i += 3) {
                            points.push(new Vector3(points_temp[i], points_temp[i + 1], points_temp[i + 2]));
                        }
                        let numPoints = points.length;
                        let lineDistances = new Float32Array(numPoints); // 1 value per point

                        geometry.setAttribute('lineDistance', new BufferAttribute(lineDistances, 1));
                        // populate
                        for (let i = 0, index = 0, l = numPoints; i < l; i++, index += 3)
                            if (animate && i > 0)
                                lineDistances[i] = lineDistances[i - 1] + points[i - 1].distanceTo(points[i]);
                        let mesh = new Mesh(geometry, new LineDashedMaterial({
                            color: color,
                            dashSize: 0,
                            gapSize: 100000
                        }));

                        group.add(mesh);
                    }
                }
                this.object = group;
                this.anim.sprites.push(group);
                this.anim.scene.add(group);
                this.position = {
                	x: this.object.position.x,
                	y: this.object.position.y,
                	z: this.object.position.z,
				};
				this.scaleVector = {
                	x: this.object.scale.x,
                	y: this.object.scale.y,
                	z: this.object.scale.z,
				};
            });
	};
	write = this.draw;
}

export class Arrow extends Mobject {
	construct = (x1, y1, z1, x2, y2, z2, color, animate = true) => {
        let dir = new Vector3(x2 - x1, y2 - y1, z2 - z1);
        // makes it a unit vector
        dir.normalize();

        let origin = new Vector3(x1, y1, z1);

        let length = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1) + (z2 - z1) * (z2 - z1));

        this.object = new ArrowHelper(dir, origin, animate ? 0.001 : length, color);
		this.length = length;
        this.anim.scene.add(this.object);
	};
	draw = () => {
    	let ret = {
			name: "arrow draw",
			fraction: 0,
			animate: () => {
				ret.fraction += 0.02;
				this.object.setLength(this.length * Arrow.easeInOut(ret.fraction), Math.min(0.2 * this.length * Arrow.easeInOut(ret.fraction), 0.2), 0.5 * Math.min(0.2 * this.length * Arrow.easeInOut(ret.fraction), 0.2));
			},
			reset: () => {
				ret.fraction = 0;
			},
			terminateCond: () => (ret.fraction >= 1)
		};
		this.anim.addAnimation(ret);
	};
}

export class Graph2D extends Mobject {

}

export class Circle extends Mobject {
	construct = (radius, x, y, numberOfSegments = 1000, animate = true) => {
        let shape = new Shape().moveTo(radius, 0);
        for (let i = 1; i <= numberOfSegments; i++) {
            let theta = (i / numberOfSegments) * Math.PI * 2;
            shape = shape.lineTo(
                Math.cos(theta) * radius,
                Math.sin(theta) * radius
            );
        }
        let group = new Group();
        group.add(this.anim.createLineShapes(shape, 0xffffff, animate, x, y, 0.001, 0, 0, 0));
        this.object = group;
        this.anim.scene.add(group);
        this.object.position.set(x, y, 0);
		this.position = {
			x: this.object.position.x,
			y: this.object.position.y,
			z: this.object.position.z,
		};
		this.scaleVector = {
			x: this.object.scale.x,
			y: this.object.scale.y,
			z: this.object.scale.z,
		};
    };
}

export class Point extends Circle {
	construct = (x, y, color, animate = true) => {
		let shape = new Shape().moveTo(0.08, 0);
        for (let i = 1; i <= 1000; i++) {
            let theta = (i / 1000) * Math.PI * 2;
            shape = shape.lineTo(
                Math.cos(theta) * 0.08,
                Math.sin(theta) * 0.08
            );
        }
        let group = new Group();
        group.add(this.anim.createLineShapes(shape, 0xffffff, animate, x, y, 0.001, 0, 0, 0));
        this.object = group;
        this.anim.scene.add(group);
        this.object.position.set(x, y, 0);
		this.position = {
			x: this.object.position.x,
			y: this.object.position.y,
			z: this.object.position.z,
		};
		this.scaleVector = {
			x: this.object.scale.x,
			y: this.object.scale.y,
			z: this.object.scale.z,
		};
		// super.construct(0.2, x, y, 1000, animate);
		this.fill(color, 0, true, 1);
	}
}

export class Array extends Mobject {

}
