import {
    ArrowHelper,
    BufferAttribute,
    BufferGeometry,
    DoubleSide,
	Line as LineThree,
    LineDashedMaterial,
    Mesh,
    MeshBasicMaterial,
    Shape,
    ShapeGeometry,
    Vector3,
    Group,
	Geometry,
	LineBasicMaterial
} from './node_modules/three/src/Three.js';
import {SVGLoader} from "./SVGLoader.js";
import {Mathjax, promisifyLoader} from "./index.js";

export const constants = {
	ORIGIN: {
		x: 0,
		y: 0,
		z: 0
	}
};

let f = (obj, callback) => {
	if(obj.children && obj.children.length > 0)
		obj.children.forEach(objC => f(objC, callback));
	else callback(obj);
};

class Mobject {
	constructor(anim) {
		this.anim = anim;
		this.object = null;
		this.scaleVector = {
			x: 1,
			y: 1,
			z: 1
		};
	}
	construct = () => {};
	static easeInOut = t => t<.5 ? 2*t*t : -1+(4-2*t)*t;
	static easeInOutQuint = t => t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t;
	draw = size => {
		let ret = {
			name: "draw",
			fraction: 0,
			animate: () => {
				ret.fraction += 0.01;
				f(this.object, obj => obj.material.dashSize = Mobject.easeInOutQuint(ret.fraction) * size);
			},
			reset: () => {
				ret.fraction = 0;
			},
			terminateCond: () => (ret.fraction >= 1)
		};
		this.anim.addAnimation(ret);
	};
	undraw = size => {
		let ret = {
			name: "undraw",
			fraction: 1,
			animate: () => {
				ret.fraction -= 0.03;
				f(this.object, obj => obj.material.dashSize = Mobject.easeInOutQuint(ret.fraction) * size);
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
	moveBy = ({x, y, z=0}) => {
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
	moveTo = ({x, y, z=0}) => {
		let ret = {
			name: "move object",
			fraction: 0,
			init_x: this.position.x,
			init_y: this.position.y,
			init_z: this.position.z,
			animate: () => {
				ret.fraction += 0.02;
				let mul = Mobject.easeInOut(ret.fraction);
				this.object.position.set(ret.init_x + (x - ret.init_x) * mul,
					ret.init_y + (y - ret.init_y) * mul,
					ret.init_z + (z - ret.init_z) * mul,
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
	up = (mul = 1) => ({
		x: this.position.x,
		y: this.position.y + mul,
		z: this.position.z
	});
	down = (mul = 1) => ({
		x: this.position.x,
		y: this.position.y - mul,
		z: this.position.z
	});
	left = (mul = 1) => ({
		x: this.position.x - mul,
		y: this.position.y,
		z: this.position.z
	});
	right = (mul = 1) => ({
		x: this.position.x + mul,
		y: this.position.y,
		z: this.position.z
	});
	front = (mul = 1) => ({
		x: this.position.x,
		y: this.position.y,
		z: this.position.z + mul
	});
	back = (mul = 1) => ({
		x: this.position.x,
		y: this.position.y,
		z: this.position.z - mul
	});
}

export class Line extends Mobject {
	construct = ({x: x1, y: y1, z: z1 = 0}, {x: x2, y: y2, z: z2 = 0}, color, animate=true) => {
        let geometry = new BufferGeometry();
        geometry.setAttribute('position', new BufferAttribute(new Float32Array([
            x2 * 2, y2 * 2, z2 * 2,
            x1 * 2, y1 * 2, z1 * 2
        ]), 3));
        geometry.setAttribute('lineDistance',
            new BufferAttribute(new Float32Array([new Vector3(x2 * 2, y2 * 2, z2 * 2).distanceTo(new Vector3(x1 * 2, y1 * 2, z1 * 2))]),
                1));
        let line = new LineThree(geometry, new LineDashedMaterial({color, dashSize: animate ? 0 : 5, gapSize: 1e10}));
        this.object = line;
        this.anim.scene.add(line);
        this.position = {
        	x: x1 * 2,
			y: y1 * 2,
			z: z1 * 2
		};
        this.head = {
        	position: {
        		x: x2 * 2,
				y: y2 * 2,
				z: z2 * 2
			}
		};
    }
}

export class Text extends Mobject {
	construct = (content, color, textSize, {x, y, z = 0}, animate = true) => {
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
            });
	};
	write = this.draw;
}

export class Arrow extends Mobject {
	construct = ({x: x1, y: y1, z: z1 = 0}, {x: x2, y: y2, z: z2 = 0}, color, animate = true) => {
        let dir = new Vector3(x2 - x1, y2 - y1, z2 - z1);
        // makes it a unit vector
        dir.normalize();

        let origin = new Vector3(x1, y1, z1);

        let length = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1) + (z2 - z1) * (z2 - z1));

        this.object = new ArrowHelper(dir, origin, animate ? 0.001 : length, color);
		this.length = length;
        this.anim.scene.add(this.object);
        this.position = {
        	x: x1,
			y: y1,
			z: z1
		};
        this.head = {
        	position: {
        		x: x2,
				y: y2,
				z: z2
			}
		};
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
	undraw = () => {
		let ret = {
			name: "arrow animation",
			fraction: 1,
			animate: () => {
				ret.fraction -= 0.02;
				this.object.setLength(this.length * Arrow.easeInOut(ret.fraction), Math.min(0.2 * this.length * Arrow.easeInOut(ret.fraction), 0.2), 0.5 * Math.min(0.2 * this.length * Arrow.easeInOut(ret.fraction), 0.2));
			},
			reset: () => {
				ret.fraction = 0;
			},
			terminateCond: () => (ret.fraction <= 0)
		};
		this.anim.addAnimation(ret);
	};
}

export class Graph2D extends Mobject {

}

export class GraphTheory extends Mobject {
	construct = async (graph, directed = false, radius = 0.25, animate = true) => {
        this.object = new Group();
        this.edges = [];
        for(let i = 0; i < graph.nodes.length; i++) {
            let node = graph.nodes[i];
            let circle = new Circle(this.anim);
            circle.construct(radius, node, 50, animate);
            this.object.add(circle.object);
        }
        for(let i = 0; i < graph.edges.length; i++) {
            let edge = graph.edges[i];
            if(directed) {
            	let arrow = new Arrow(this.anim);
            	arrow.construct(graph.nodes[edge[0]], graph.nodes[edge[1]], 0xffffff, true);
				this.object.add(arrow.object);
			} else {
            	let line = new Line(this.anim);
            	this.edges.push({from: edge[0], to: edge[1], line});
            	let x = graph.nodes[edge[0]].x - graph.nodes[edge[1]].x, y = graph.nodes[edge[0]].y - graph.nodes[edge[1]].y;
            	let length = Math.sqrt(x * x + y * y);
            	let ratio = radius / length;
            	line.construct({x: graph.nodes[edge[0]].x - ratio * x / 2, y: graph.nodes[edge[0]].y - ratio * y / 2},
					{x: graph.nodes[edge[1]].x + ratio * x / 2, y: graph.nodes[edge[1]].y + ratio * y / 2}, 0xffffff, true);
                this.object.add(line.object);
        	}
        }
        for(let i = 0; i < graph.nodes.length; i++) {
            let {label = (i + 1).toString(10), color = "#ffffff"} = graph.nodes[i];
            let text = new Text(this.anim);
            await text.construct(label, color, 8, {x: 2 * (graph.nodes[i].x - radius) + 0.95, y: 2 * (graph.nodes[i].y - radius) + 1, z: 0.02});
            this.object.add(text.object);
        }
        this.anim.scene.add(this.object);
        this.position = {
        	x: this.object.position.x,
			y: this.object.position.y,
		};
        this.graph = graph;
        this.radius = radius;
        this.directed = directed;
    };
	draw = () => {
		for(let i = 0;i < this.object.children.length; i++) {
			let obj = this.object.children[i];
			let size = 0;
			if(i < this.graph.nodes.length + this.graph.edges.length)
				size = this.radius * 12;
			else
				size = 300000;
			let ret = {
				name: "draw",
				fraction: 0,
				animate: () => {
					ret.fraction += 0.01;
					f(obj, obj => obj.material.dashSize = Mobject.easeInOutQuint(ret.fraction) * size);
				},
				reset: () => {
					ret.fraction = 0;
				},
				terminateCond: () => (ret.fraction >= 1)
			};
			this.anim.addAnimation(ret);
		}
	};
	undraw = () => {
		for(let i = 0;i < this.object.children.length; i++) {
			let obj = this.object.children[i];
			let size = 0;
			if(i < this.graph.nodes.length + this.graph.edges.length)
				size = this.radius * 12;
			else
				size = 300000;
			let ret = {
				name: "draw",
				fraction: 1,
				animate: () => {
					ret.fraction -= 0.01;
					f(obj, obj => obj.material.dashSize = Mobject.easeInOutQuint(ret.fraction) * size);
				},
				reset: () => {
					ret.fraction = 0;
				},
				terminateCond: () => (ret.fraction < 0)
			};
			this.anim.addAnimation(ret);
		}
	};
	addEdge = (from, to, color = "#ffffff") => {
		if(this.directed) {

		} else {
			let line = new Line(this.anim);
			let x = this.graph.nodes[from].x - this.graph.nodes[to].x, y = this.graph.nodes[from].y - this.graph.nodes[to].y;
			let length = Math.sqrt(x * x + y * y);
			let ratio = this.radius / length;
			line.construct({x: this.graph.nodes[from].x - ratio * x / 2, y: this.graph.nodes[from].y - ratio * y / 2},
				{x: this.graph.nodes[to].x + ratio * x / 2, y: this.graph.nodes[to].y + ratio * y / 2}, color, true);
			this.object.add(line.object);
			line.draw(12);
			this.edges.push({from, to, line});
		}
	};
	removeEdge = (from, to) => {
		for(let i = 0;i < this.edges.length; i++)
			if(this.edges[i].from === from && this.edges[i].to === to)
			{
				this.edges[i].line.undraw(12);
				this.edges.splice(i, 1);
				break;
			}
	}
}

export class Circle extends Mobject {
	construct = (radius, {x, y, z=0}, numberOfSegments = 1000, animate = true) => {
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
    };
}

export class Point extends Circle {
	construct = ({x, y, z=0}, color, animate = true) => {
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
		this.fill(color, 0, true, 1);
	}
}

export class Array extends Mobject {

}

export class Polygon extends Mobject {
	construct = (arr, color = '#FFFFFF') => {
        let shape = new Shape().moveTo(0, 0).lineTo(0, 0);

        for (let i = 1; i < arr.length; i++)
            shape.lineTo(arr[i].x - arr[0].x, arr[i].y - arr[0].y);
        shape.lineTo(0, 0);
        for (let i = 1; i < arr.length; i++)
            shape.lineTo(arr[i].x - arr[0].x, arr[i].y - arr[0].y);
        shape.autoClose = true;

        this.object = this.anim.createLineShapes(shape, color, true, 0, 0, 0, 0, 0, 0);
        this.anim.scene.add(this.object);
        this.position = {
			x: this.object.position.x,
			y: this.object.position.y,
			z: this.object.position.z,
		};
    };
}
