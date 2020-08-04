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
	Quaternion
} from './node_modules/three/build/three.module.js';
import {SVGLoader} from "./SVGLoader.js";
import {Mathjax, promisifyLoader} from "./index.js";

export const constants = {
	ORIGIN: {
		x: 0,
		y: 0,
		z: 0
	},
	COLOR: {
		DARK_BLUE: "#236B8E",
		DARK_BROWN: "#8B4513",
		LIGHT_BROWN: "#CD853F",
		BLUE_E: "#1C758A",
		BLUE_D: "#29ABCA",
		BLUE_C: "#58C4DD",
		BLUE_B: "#9CDCEB",
		BLUE_A: "#C7E9F1",
		TEAL_E: "#49A88F",
		TEAL_D: "#55C1A7",
		TEAL_C: "#5CD0B3",
		TEAL_B: "#76DDC0",
		TEAL_A: "#ACEAD7",
		GREEN_E: "#699C52",
		GREEN_D: "#77B05D",
		GREEN_C: "#83C167",
		GREEN_B: "#A6CF8C",
		GREEN_A: "#C9E2AE",
		YELLOW_E: "#E8C11C",
		YELLOW_D: "#F4D345",
		YELLOW_C: "#FFFF00",
		YELLOW_B: "#FFEA94",
		YELLOW_A: "#FFF1B6",
		GOLD_E: "#C78D46",
		GOLD_D: "#E1A158",
		GOLD_C: "#F0AC5F",
		GOLD_B: "#F9B775",
		GOLD_A: "#F7C797",
		RED_E: "#CF5044",
		RED_D: "#E65A4C",
		RED_C: "#FC6255",
		RED_B: "#FF8080",
		RED_A: "#F7A1A3",
		MAROON_E: "#94424F",
		MAROON_D: "#A24D61",
		MAROON_C: "#C55F73",
		MAROON_B: "#EC92AB",
		MAROON_A: "#ECABC1",
		PURPLE_E: "#644172",
		PURPLE_D: "#715582",
		PURPLE_C: "#9A72AC",
		PURPLE_B: "#B189C6",
		PURPLE_A: "#CAA3E8",
		WHITE: "#FFFFFF",
		BLACK: "#000000",
		LIGHT_GRAY: "#BBBBBB",
		LIGHT_GREY: "#BBBBBB",
		GRAY: "#888888",
		GREY: "#888888",
		DARK_GREY: "#444444",
		DARK_GRAY: "#444444",
		DARKER_GREY: "#222222",
		DARKER_GRAY: "#222222",
		GREY_BROWN: "#736357",
		PINK: "#D147BD",
		LIGHT_PINK: "#DC75CD",
		GREEN_SCREEN: "#00FF00",
		ORANGE: "#FF862F",
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
		this.checkpoint = this.anim.checkpoint;
	}
	delay = () => {
		this.checkpoint();
		this.anim.addAnimation(v => {});
		this.checkpoint();
	};
	construct = () => {};
	static easeInOut = t => t<.5 ? 2*t*t : -1+(4-2*t)*t;
	static easeInOutQuint = t => t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t;
	draw = size => this.anim.addAnimation(frac => f(this.object, obj => obj.material.dashSize = Mobject.easeInOutQuint(frac) * size));
	undraw = size => this.anim.addAnimation(frac => f(this.object, obj => obj.material.dashSize = Mobject.easeInOutQuint(1 - frac) * size));
	fadeIn = () => {
		let ret = {
			name: "fade in",
			fraction: 0,
			animate: () => {
				ret.fraction += 1.0 / 60;
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
			fraction: 0,
			animate: () => {
				ret.fraction += 1.0 / 60;
				if(this.object.children)
					this.object.children.forEach(obj => {obj.material.transparent = true; obj.material.opacity = Math.max(0, 1 - ret.fraction)});
				else {
					this.object.material.transparent = true;
					this.object.material.opacity = Math.max(0, 1 - ret.fraction);
				}
			},
			reset: () => {
				ret.fraction = 0;
				if(this.object.children)
					this.object.children.forEach(obj => {obj.material.transparent = true; obj.material.opacity = Math.max(0, 1 - ret.fraction)});
				else {
					this.object.material.transparent = true;
					this.object.material.opacity = Math.max(0, 1 - ret.fraction);
				}
			},
			terminateCond: () => (ret.fraction >= 1)
		};
		this.anim.addAnimation(ret);
	};
	moveBy = ({x, y, z=0}) => {
		let {x: ix, y: iy, z: iz} = this.position;
		x *= 2;
		y *= 2;
		z *= 2;
		this.position = {x, y, z};
		this.anim.addAnimation(value => {
			let mul = Mobject.easeInOut(value);
			this.object.position.set(ix + x * mul,
				iy + y * mul,
				iz + z * mul,
			);
		});
	};
	moveTo = ({x, y, z=0}) => {
		let {x: ix, y: iy, z: iz} = this.position;
		x *= 2;
		y *= 2;
		z *= 2;
		this.position = {x, y, z};
		this.anim.addAnimation(value => {
			let mul = Mobject.easeInOut(value);
			this.object.position.set(ix + (x - ix) * mul,
				iy + (y - iy) * mul,
				iz + (z - iz) * mul,
			);
		});
	};
	fill = ({color, opacity, animate = false, to = 1}) => {
		let step = (to - opacity) / 58.38;
		let material = new MeshBasicMaterial({color: color, side: DoubleSide, transparent: true, opacity: opacity});
		let mesh = new Mesh(this.object.children[0].geometry, material);
		mesh.position.set(this.object.position.x, this.object.position.y, this.object.position.z);
		this.object.add(mesh);
		this.anim.addAnimation(value => mesh.material.opacity = value);
	};
	scale = ({by}) => {
		let init_x = this.scaleVector.x;
		let init_y = this.scaleVector.y;
		let init_z = this.scaleVector.z;

		this.scaleVector = {
			x: this.scaleVector.x * by,
			y: this.scaleVector.y * by,
			z: this.scaleVector.z * by
		};
		this.anim.addAnimation(frac => {
			this.object.scale.x = init_x * (by + (1 - by) * Mobject.easeInOut(1 - frac));
			this.object.scale.y = init_y * (by + (1 - by) * Mobject.easeInOut(1 - frac));
			this.object.scale.z = init_z * (by + (1 - by) * Mobject.easeInOut(1 - frac));
		});
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

export class Text extends Mobject {
	construct = ({content, color, size, position: {x, y, z = 0}, animate = true}) => {
		this.color = color;
		this.size = size;
		x *= 2;
		y *= 2;
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
                group.scale.multiplyScalar(0.00008 * size);
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

export let textTransform = (t1, nc) => {
	let t2 = new Text(t1.anim);
	t2.construct({content: nc, size: t1.size, color: t1.color, position: t1.position});
	t2.draw(300000);
	t1.undraw(300000);
	return t2;
};

export class Arrow extends Mobject {
	construct = ({position: {x: x1, y: y1, z: z1 = 0}, head: {x: x2, y: y2, z: z2 = 0}, color, animate = true}) => {
        let dir = new Vector3(x2 - x1, y2 - y1, z2 - z1);
        // makes it a unit vector
        dir.normalize();

        let origin = new Vector3(x1, y1, z1);
        origin.multiplyScalar(2);

        let length = 2 * Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1) + (z2 - z1) * (z2 - z1));

        this.object = new ArrowHelper(dir, origin, animate ? 0.001 : length, color);
		this.length = length;
        this.anim.scene.add(this.object);
        this.position = {
        	x: 2 * x1,
			y: 2 * y1,
			z: 2 * z1
		};
        this.head = {
        	position: {
        		x: 2 * x2,
				y: 2 * y2,
				z: 2 * z2
			}
		};
	};
	draw = () => {
		let length = this.length;
		this.anim.addAnimation(value => this.object.setLength(length * Arrow.easeInOut(value), Math.min(0.2 * length * Arrow.easeInOut(value), 0.2), 0.5 * Math.min(0.2 * length * Arrow.easeInOut(value), 0.2)));
	};
	undraw = () => this.anim.addAnimation(value => this.object.setLength(this.length * Arrow.easeInOut(1 - value), Math.min(0.2 * this.length * Arrow.easeInOut(1 - value), 0.2), 0.5 * Math.min(0.2 * this.length * Arrow.easeInOut(1 - value), 0.2)));
	headTo = ({x = this.head.position.x, y = this.head.position.y, z = this.head.position.z}) => {
		// this.object.setDirection(new Vector3(1, -1, 0));
		let {x: xx, y: yy, z: zz} = this.head.position;
		x *= 2;
		y *= 2;
		z *= 2;
		this.anim.addAnimation(value => {
			value = Mobject.easeInOut(value);
			let v = new Vector3(
				value * x + (1 - value) * xx - this.object.position,
				value * y + (1 - value) * yy - this.object.position,
				value * z + (1 - value) * zz - this.object.position,
			);
			v.normalize();
			this.object.setDirection(v);
			let oldDist = new Vector3(this.object.position.x, this.object.position.y, this.object.position.z).distanceTo(new Vector3(xx, yy, zz));
			let newDist = new Vector3(this.object.position.x, this.object.position.y, this.object.position.z).distanceTo(new Vector3(x, y, z));
			let vvalue = value * newDist + (1 - value) * oldDist;
			this.object.setLength(vvalue, Math.min(0.2 * vvalue, 0.2), 0.5 * Math.min(0.2 * vvalue, 0.2));
		});
		this.length =  new Vector3(this.position.x, this.position.y, this.position.z).distanceTo(new Vector3(x, y, z));
		this.head.position = {x, y, z};
	};
	// tailTo = ({x = this.position.x, y = this.position.y, z = this.position.z}) => {
	// 	// this.object.setDirection(new Vector3(1, -1, 0));
	// 	let {x: xx, y: yy, z: zz} = this.position;
	// 	this.anim.addAnimation(value => {
	// 		let mul = Mobject.easeInOut(value);
	// 		this.object.position.set(2 * (xx + (x - xx) * mul),
	// 			2 * (yy + (y - yy) * mul),
	// 			2 * (zz + (z - zz) * mul)
	// 		);
	// 		let v = new Vector3(
	// 			value * x + (1 - value) * xx,
	// 			value * y + (1 - value) * yy,
	// 			value * z + (1 - value) * zz,
	// 		);
	// 		// v.normalize();
	// 		// this.object.setDirection(v);
	// 		// let oldDist = new Vector3(this.head.position.x, this.head.position.y, this.head.position.z).distanceTo(new Vector3(xx, yy, zz));
	// 		// let newDist = new Vector3(this.head.position.x, this.head.position.y, this.head.position.z).distanceTo(new Vector3(x, y, z));
	// 		// let vvalue = value * newDist + (1 - value) * oldDist;
	// 		// vvalue *= 2;
	// 		// console.log(vvalue);
	// 		// this.object.setLength(vvalue, Math.min(0.2 * vvalue, 0.2), 0.5 * Math.min(0.2 * vvalue, 0.2));
	// 	});
	// 	this.length =  2 * (new Vector3(this.head.position.x, this.head.position.y, this.head.position.z).distanceTo(new Vector3(x, y, z)));
	// 	this.position = {x, y, z};
	// };
}

export class Line extends Arrow {
	draw = () => {
		let length = this.length;
		this.anim.addAnimation(value => this.object.setLength(length * Arrow.easeInOut(value), 0.0001, 0.0001));
	};
	undraw = () => this.anim.addAnimation(value => this.object.setLength(this.length * Arrow.easeInOut(1 - value), 0.0001, 0.0001));
	headTo = ({x = this.head.position.x, y = this.head.position.y, z = this.head.position.z}) => {
		// this.object.setDirection(new Vector3(1, -1, 0));
		let {x: xx, y: yy, z: zz} = this.head.position;
		x *= 2;
		y *= 2;
		z *= 2;
		this.anim.addAnimation(value => {
			value = Mobject.easeInOut(value);
			let v = new Vector3(
				value * x + (1 - value) * xx - this.object.position.x,
				value * y + (1 - value) * yy - this.object.position.y,
				value * z + (1 - value) * zz - this.object.position.z,
			);
			v.normalize();
			this.object.setDirection(v);
			let oldDist = new Vector3(this.object.position.x, this.object.position.y, this.object.position.z).distanceTo(new Vector3(xx, yy, zz));
			let newDist = new Vector3(this.object.position.x, this.object.position.y, this.object.position.z).distanceTo(new Vector3(x, y, z));
			let vvalue = value * newDist + (1 - value) * oldDist;
			this.object.setLength(vvalue, 0.0001, 0.0001);
		});
		this.length =  new Vector3(this.position.x, this.position.y, this.position.z).distanceTo(new Vector3(x, y, z));
		this.head.position = {x, y, z};
	};
}

export class Graph2D extends Mobject {
	construct = ({origin: {x, y}, dimension: {l, b}, grid = 0}) => {
		this.object = new Group();
		let x_axis = new Line(this.anim);
		let y_axis = new Line(this.anim);
		x_axis.construct({position: {x: x - b / 2.0, y}, head: {x: x + b / 2.0, y}, color: '#ffffff'});
		y_axis.construct({position: {x, y: y - l / 2.0}, head: {x, y: y + l / 2.0}, color: '#ffffff'});
		this.object.add(y_axis.object);
		this.object.add(x_axis.object);
		this.position = {x, y};
		if(grid) {
			for(let i = y + grid;i <= y + l / 2.0; i += grid) {
				let l = new Line(this.anim);
				l.construct({position: {x: x - b / 2.0, y: i}, head: {x: x + b / 2.0, y: i}, color: '#3b5aff'});
				this.object.add(l.object);
			}
			for(let i = y - grid;i >= y - l / 2.0; i -= grid) {
				let l = new Line(this.anim);
				l.construct({position: {x: x - b / 2.0, y: i}, head: {x: x + b / 2.0, y: i}, color: '#3b5aff'});
				this.object.add(l.object);
			}
			for(let i = x + grid;i <= x + b / 2.0; i += grid) {
				let line = new Line(this.anim);
				line.construct({position: {x: i, y: y - l / 2.0}, head: {x: i, y: y + l / 2.0}, color: '#3b5aff'});
				this.object.add(line.object);
			}
			for(let i = x - grid;i >= x - b / 2.0; i -= grid) {
				let line = new Line(this.anim);
				line.construct({position: {x: i, y: y - l / 2.0}, head: {x: i, y: y + l / 2.0}, color: '#3b5aff'});
				this.object.add(line.object);
			}
		}
		this.anim.scene.add(this.object);
	};

	transform = m => {

	};
}

export class GraphTheory extends Mobject {
	construct = async ({graph, directed = false, radius = 0.25, animate = true}) => {
        this.object = new Group();
        this.edges = [];
        for(let i = 0; i < graph.nodes.length; i++) {
            let node = graph.nodes[i];
            let circle = new Circle(this.anim);
            circle.construct({radius, position: node, color: node.color ? node.color : '#ffffff', numberOfSegments: 1000, animate});
            this.object.add(circle.object);
        }
        for(let i = 0; i < graph.edges.length; i++) {
            let edge = graph.edges[i];
            if(directed) {
            	let arrow = new Arrow(this.anim);
            	arrow.construct({position: graph.nodes[edge[0]], head: graph.nodes[edge[1]], color: 0xffffff, animate: true});
				this.object.add(arrow.object);
			} else {
            	let line = new Line(this.anim);
            	this.edges.push({from: edge[0], to: edge[1], line});
            	let x = graph.nodes[edge[0]].x - graph.nodes[edge[1]].x, y = graph.nodes[edge[0]].y - graph.nodes[edge[1]].y;
            	let length = Math.sqrt(x * x + y * y);
            	let ratio = radius / length;
            	line.construct({position: {x: graph.nodes[edge[0]].x - ratio * x / 2, y: graph.nodes[edge[0]].y - ratio * y / 2},
					head: {x: graph.nodes[edge[1]].x + ratio * x / 2, y: graph.nodes[edge[1]].y + ratio * y / 2}, color: 0xffffff, animate: true});
                this.object.add(line.object);
        	}
        }
        for(let i = 0; i < graph.nodes.length; i++) {
            let {label = (i + 1).toString(10), labelColor = "#ffffff"} = graph.nodes[i];
            let text = new Text(this.anim);
            await text.construct({content: label, color: labelColor, size: 12 * radius, position: {x: 2 * (graph.nodes[i].x - radius) + 1.6 * radius, y: 2 * (graph.nodes[i].y - radius) + 1.6 * radius, z: 0.02}});
            this.object.add(text.object);
        }
        this.anim.scene.add(this.object);
        this.position = {
        	x: this.object.position.x,
			y: this.object.position.y,
			z: this.object.position.z
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
				size = this.radius * 8;
			else
				size = 300000;
			this.anim.addAnimation(value => {console.log(value);f(obj, obj => obj.material.dashSize = Mobject.easeInOutQuint(value) * size)});
		}
	};
	undraw = () => {
		for(let i = 0;i < this.object.children.length; i++) {
			let obj = this.object.children[i];
			let size = 0;
			if(i < this.graph.nodes.length + this.graph.edges.length)
				size = this.radius * 8;
			else
				size = 300000;
			this.anim.addAnimation(value => f(obj, obj => obj.material.dashSize = Mobject.easeInOutQuint(value) * size));
		}
	};
	addEdge = ({from, to, color = "#ffffff"}) => {
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
	removeEdge = ({from, to}) => {
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
	construct = ({radius, position: {x, y, z=0}, color = '#ffffff', numberOfSegments = 1000, animate = true}) => {
		radius *= 2;
        let shape = new Shape().moveTo(radius, 0);
        for (let i = 1; i <= numberOfSegments; i++) {
            let theta = (i / numberOfSegments) * Math.PI * 2;
            shape = shape.lineTo(
                Math.cos(theta) * radius,
                Math.sin(theta) * radius
            );
        }
        let group = new Group();
        let obj = this.anim.createLineShapes(shape, color, animate, x, y, 0.001, 0, 0, 0);
        group.add(obj);
        this.object = obj;
        this.anim.scene.add(group);
        this.object.position.set(2*x, 2*y, 0);
		this.position = {
			x: this.object.position.x,
			y: this.object.position.y,
			z: this.object.position.z,
		};
    };
}

export class Point extends Circle {
	construct = ({position: {x, y, z=0}, color, animate = true}) => {
		let shape = new Shape().moveTo(0.08, 0);
        for (let i = 1; i <= 1000; i++) {
            let theta = (i / 1000) * Math.PI * 2;
            shape = shape.lineTo(
                Math.cos(theta) * 0.08,
                Math.sin(theta) * 0.08
            );
        }
        let group = new Group();
        group.add(this.anim.createLineShapes(shape, color, animate, x, y, 0.001, 0, 0, 0));
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
	construct = async ({position: {x, y}, array, fontSize}) => {
		let len = array.length;
		console.log("LENGTH: ", len);
		let b = 0.1 * fontSize;
		let h = 0.1 * fontSize;
		this.object = new Group();
		for(let i = x; i < x + len * b; i += b) {
			let sq = new Polygon(this.anim);
			sq.construct({points: [{x: i, y}, {x: i+b, y}, {x: i+b, y: y+h}, {x: i, y: y+h}]});
			this.object.add(sq.object);
		}
		for(let i = 0;i < len; i++) {
			let text = new Text(this.anim);
			await text.construct({content: array[i], position: {x: x + (i + 0.15) * 0.5 * b, y: y + 0.013 * fontSize}, color: '#ffffff', size: fontSize});
			this.object.add(text.object);
			console.log(text.object);
			console.log(i, len);
		}
		this.size = fontSize;
		this.anim.scene.add(this.object);
		this.position = {x, y};
	};

	draw = () => {
		for(let i = 0;i < this.object.children.length; i++) {
			let obj = this.object.children[i];
			let size = 0;
			console.log(i, this.object.children.length);
			if(i < this.object.children.length / 2)
				size = this.size / 2;
			else
				size = 300000;
			this.anim.addAnimation(value => f(obj, obj => obj.material.dashSize = Mobject.easeInOutQuint(value) * size));
		}
	};

	undraw = () => {
		for(let i = 0;i < this.object.children.length; i++) {
			let obj = this.object.children[i];
			let size = 0;
			console.log(i, this.object.children.length);
			if(i < this.object.children.length / 2)
				size = this.size / 2;
			else
				size = 300000;
			this.anim.addAnimation(value => f(obj, obj => obj.material.dashSize = Mobject.easeInOutQuint(1 - value) * size));
		}
	};
}

export class Polygon extends Mobject {
	construct = ({points, color = '#FFFFFF'}) => {
		console.log(points);
        let shape = new Shape().moveTo(0, 0).lineTo(0, 0);

        for (let i = 1; i < points.length; i++)
            shape.lineTo(points[i].x - points[0].x, points[i].y - points[0].y);
        shape.lineTo(0, 0);
        for (let i = 1; i < points.length; i++)
            shape.lineTo(points[i].x - points[0].x, points[i].y - points[0].y);
        shape.autoClose = true;

        this.object = this.anim.createLineShapes(shape, color, true, 0, 0, 0, 0, 0, 0);
        this.object.position.x = points[0].x;
        this.object.position.y = points[0].y;
        this.object.position.z = points[0].z ? points[0].z : 0;
        this.anim.scene.add(this.object);
        this.position = {
			x: this.object.position.x,
			y: this.object.position.y,
			z: this.object.position.z,
		};
    };
}
