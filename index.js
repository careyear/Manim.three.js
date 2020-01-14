import {
    ArrowHelper,
    BoxBufferGeometry,
    BufferAttribute,
    BufferGeometry,
    CircleGeometry,
    Color,
    DirectionalLight,
    DoubleSide,
    FontLoader,
    Geometry,
    GridHelper,
    HemisphereLight,
    Line,
    LineBasicMaterial,
    LineDashedMaterial,
    Mesh,
    ShapeBufferGeometry,
    MeshBasicMaterial,
    MeshStandardMaterial,
    PerspectiveCamera,
    Scene,
    Shape,
    ShapeGeometry,
    SphereGeometry,
    sRGBEncoding,
    TextGeometry,
    TextureLoader,
    Vector3,
    WebGLRenderer,
    Group
} from './node_modules/three/src/Three.js';
import {OrbitControls} from './node_modules/three/examples/jsm/controls/OrbitControls.js';
import {SVGLoader} from "./node_modules/three/examples/jsm/loaders/SVGLoader.js";
import {draw} from "./animations.js";


export class Animation {
// let canvasX = ?widthOfCanvas?, canvasY = ?heightOfCanvas?;

    constructor(controls = true) {
        this.isPlaying = false;
        this.hasPlayed = [];
        this.animations = []; // Animations are a dictionary = {name, function, terminate_condition, ...letiables}
        this.start = 0; // the index from which to start playing animations, for optimized animations
        this.delay = 0;

        /* This way of animating is not provably optimal but works well with small number
        * of animations. We will think of better ways after this crude implementation works
        * as planned.
        */
        this.container = document.getElementById('scene-container');

        this.scene = new Scene();
        this.scene.background = new Color(0x000000);


        this.createCamera();
        this.createLights();

        this.createRenderer();
        if (controls)
            this.createControls();
        window.addEventListener('resize', () => {
            // set the aspect ratio to match the new browser window aspect ratio
            this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        
            // update the camera's frustum
            this.camera.updateProjectionMatrix();
        
            // update the size of the renderer AND the canvas
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        
        });


        this.renderer.setAnimationLoop(null);

    };
    createRenderer = () => {
        this.renderer = new WebGLRenderer({antialias: true});

				this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);

        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);
    };

    createCamera = () => {

        this.camera = new PerspectiveCamera(
            50, // FOV
            this.container.clientWidth / this.container.clientHeight, // aspect

            0.1, // near clipping plane
            1000, // far clipping plane
        );

        this.camera.position.set(0, 0, 10);

    };

    createControls = () => {
        new OrbitControls(this.camera, this.renderer.domElement);
    };
    createLights = () => {

        const ambientLight = new HemisphereLight(
            0xddeeff, // bright sky color
            0x202020, // dim ground color
            5, // intensity
        );
        this.scene.add(ambientLight);

        const mainLight = new DirectionalLight(0xffffff, 5);
        mainLight.position.set(10, 10, 10);

        this.scene.add(ambientLight, mainLight);
    };

    createMeshes = (geometry, texturePath, i, j, k, angleX, angleY, angleZ) => {

        const textureLoader = new TextureLoader();

        const texture = textureLoader.load(texturePath);

        texture.encoding = sRGBEncoding;
        texture.anisotropy = 16;

        const material = new MeshStandardMaterial({
            map: texture,
            side: DoubleSide  // creates a double sided object
        });

        let mesh = new Mesh(geometry, material);
        mesh.position.x = i;
        mesh.position.y = j;
        mesh.position.z = k;
        mesh.rotation.x = angleX;
        mesh.rotation.y = angleY;
        mesh.rotation.z = angleZ;
        this.scene.add(mesh);
        return mesh;
    };
    createLine = (x1, y1, x2, y2) => {
        let geometry = new BufferGeometry();
        geometry.setAttribute('position', new BufferAttribute(new Float32Array([
            x1, y1, 0,
            x2, y2, 0
        ]), 3));
        geometry.setAttribute('lineDistance',
            new BufferAttribute(new Float32Array([new Vector3(x1, y1, 0).distanceTo(new Vector3(x2, y2, 0))]),
                1));
        let line = new Line(geometry, new LineDashedMaterial({color: 0xffffff, dashSize: 0, gapSize: 1e10}));
        this.scene.add(line);
        return line;
    };
    createLineShapes = (shape, color, animate, x, y, z, rx, ry, rz) => {
        // shape.autoClose = true;
        if (animate) {
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

            let line = new Line(geometry, new LineDashedMaterial({color: color, dashSize: 0, gapSize: 1e10}));
            line.position.set(x, y, z);
            line.rotation.set(rx, ry, rz);
            this.scene.add(line);
            return line;
        } else {
            let points = shape.getPoints();
            let geometry = new BufferGeometry().setFromPoints(points);
            let line = new Line(geometry, new LineBasicMaterial({color: color}));
            this.scene.add(line);
            return line;
        }
    };
    fill = (line, color, opacity, x = 0, y = 0, z = 0) => {
        let material = new MeshBasicMaterial({color: color, side: DoubleSide, transparent: true, opacity: opacity});
        let mesh = new Mesh(line, material);
        mesh.position.set(x, y, z);
        this.scene.add(mesh);
        return material;
    };
    addText = (text, color, textSize, x = 0, y = 0, animate = true) => {

        let content = "$$" + text + "$$";
        
        MathJax.Hub.Register.StartupHook("End", () => {
        
            // creates and adds a span element containing the SVG
            let contentSpan = MathJax.HTML.addElement(
                this.container,
                "span",
                {
                    id: "animatedTextMathJax", style:
                        {
                            top: 200 + "vh",
                            left: 200 + "vw",
                            visibility: "hidden",
                            fontSize: textSize + "%",
                        }
                },
                [content]
            );
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, contentSpan], () => {
                contentSpan.style.display = "none";
            });
        
            MathJax.Hub.Queue(() => {
                // gets the parent SVG element
                let mainSVG = document.querySelector("#animatedTextMathJax > .MathJax_SVG_Display > .MathJax_SVG > svg");
                mainSVG.setAttribute( "xmlns", "http://www.w3.org/2000/svg" );

                let mainSVG_string = new XMLSerializer().serializeToString(mainSVG);
                let url = URL.createObjectURL(new Blob([mainSVG_string], {type: 'image/svg+xml'}));
                let loader = new SVGLoader();

                loader.load(url, ( data ) => {

                    let paths = data.paths;

                    let group = new Group();
                    group.scale.multiplyScalar( 0.00008 * textSize);
                    group.position.x = x;
                    group.position.y = y;
                    group.scale.y *= -1;

                    for ( let i = 0; i < paths.length; i ++ ) {

                        let shapes = paths[i].toShapes(true);

                        for (let j = 0; j < shapes.length; j++) {

                            let shape = shapes[j];
                            let geometry = new BufferGeometry().fromGeometry(new ShapeGeometry(shape));let points = [];
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
                            let mesh = new Mesh(geometry, new LineDashedMaterial({color: color, dashSize: 0, gapSize: 100000}));

                            group.add(mesh);
                            this.addAnimation(draw(mesh, 150000));

						}

                    }
                    this.scene.add( group );
                    console.log("PLAY");
                    this.play();
                    // this.record();
                });
            });
        });
    };
    createPlotGrid = (topLeftX, topLeftY, bottomRightX, bottomRightY, animate = true) => {
        if (animate) {
            let axis = [];
            let geometry_y = new BufferGeometry();
            let points_y = [];
            for (let y = bottomRightY; y <= topLeftY; y += 0.2)
                points_y.push(new Vector3((topLeftX + bottomRightX) / 2, y, 0));
            let y_points = new Float32Array(points_y.length * 3);
            let y_numPoints = points_y.length;
            let y_lineDistances = new Float32Array(y_numPoints);
            geometry_y.setAttribute('position', new BufferAttribute(y_points, 3));
            geometry_y.setAttribute('lineDistance', new BufferAttribute(y_lineDistances, 1));
            // populate
            for (let i = 0, index = 0, l = y_numPoints; i < l; i++, index += 3) {
                y_points[index] = points_y[i].x;
                y_points[index + 1] = points_y[i].y;
                y_points[index + 2] = points_y[i].z;
                if (i > 0)
                    y_lineDistances[i] = y_lineDistances[i - 1] + points_y[i - 1].distanceTo(points_y[i]);
            }

            let geometry_x = new BufferGeometry();
            let points_x = [];
            for (let x = topLeftX; x <= bottomRightX; x += 0.2)
                points_x.push(new Vector3(x, (topLeftY + bottomRightY) / 2, 0));
            let x_points = new Float32Array(points_x.length * 3);
            let x_numPoints = points_x.length;
            let x_lineDistances = new Float32Array(x_numPoints);
            geometry_x.setAttribute('position', new BufferAttribute(x_points, 3));
            geometry_x.setAttribute('lineDistance', new BufferAttribute(x_lineDistances, 1));
            // populate
            for (let i = 0, index = 0, l = x_numPoints; i < l; i++, index += 3) {
                x_points[index] = points_x[i].x;
                x_points[index + 1] = points_x[i].y;
                x_points[index + 2] = points_x[i].z;
                if (i > 0)
                    x_lineDistances[i] = x_lineDistances[i - 1] + points_x[i - 1].distanceTo(points_x[i]);
            }
            // console.log(lineDistances[numPoints - 1]);
            axis.push(new Line(geometry_x, new LineDashedMaterial(
                {
                    color: 0xffffff,
                    dashSize: 0,
                    gapSize: 1e10,
                    linewidth: 5,
                })));

            // console.log(lineDistances[numPoints - 1]);
            axis.push(new Line(geometry_y, new LineDashedMaterial(
                {
                    color: 0xffffff,
                    dashSize: 0,
                    gapSize: 1e10,
                    linewidth: 5,
                })));
            return axis;
        } else {
            let geometry_y = new BufferGeometry();
            geometry_y.setAttribute('position', new BufferAttribute(new Float32Array([
                ((bottomRightX + topLeftX) / 2), topLeftY, 0,
                ((bottomRightX + topLeftX) / 2), ((topLeftY + bottomRightY) / 2), 0,
                ((bottomRightX + topLeftX) / 2), bottomRightY, 0
            ]), 3));
            let y_axis = new Line(geometry_y, new LineBasicMaterial({color: 0xffffff}));
            let geometry_x = new BufferGeometry();
            geometry_x.setAttribute('position', new BufferAttribute(new Float32Array([
                topLeftX, ((topLeftY + bottomRightY) / 2), 0,
                ((bottomRightX + topLeftX) / 2), ((topLeftY + bottomRightY) / 2) , 0,
                bottomRightX, ((topLeftY + bottomRightY) / 2), 0
            ]), 3));
            let x_axis = new Line(geometry_x, new LineBasicMaterial({color: 0xffffff}));
            this.scene.add(x_axis);
            this.scene.add(y_axis);
        }
    };
    createGraph2D = (func, segCnt, zoom, animate = true) => {
        if (animate) {
            let geometry = new BufferGeometry();
            let eps = 14 / segCnt;
            let points_t = [];
            for (let x = -7; x <= 7; x += eps)
                points_t.push(new Vector3(x, func(x * zoom), 0));
            // points_t.push(new Vector3(-5, func(-5), 0));
            let points = new Float32Array(points_t.length * 3);
            let numPoints = points_t.length;
            let lineDistances = new Float32Array(numPoints);
            geometry.setAttribute('position', new BufferAttribute(points, 3));
            geometry.setAttribute('lineDistance', new BufferAttribute(lineDistances, 1));
            // populate
            for (let i = 0, index = 0, l = numPoints; i < l; i++, index += 3) {
                points[index] = points_t[i].x;
                points[index + 1] = points_t[i].y;
                points[index + 2] = points_t[i].z;
                if (i > 0)
                    lineDistances[i] = lineDistances[i - 1] + points_t[i - 1].distanceTo(points_t[i]);
            }
            // console.log(lineDistances[numPoints - 1]);
            return new Line(geometry, new LineDashedMaterial(
                {
                    color: 0x4444ff,
                    dashSize: 0,
                    gapSize: 1e10,
                    linewidth: 5,
                }));
        } else {
            let geometry = new Geometry();
            let eps = 10 / segCnt;
            for (let x = -5; x <= 5; x += eps)
                geometry.vertices.push(new Vector3(x, func(x * zoom), 0));
            return new Line(geometry, new LineBasicMaterial({color: 0x4444ff}));
        }
    };
    createGraph2DParametric = (xfunc, yfunc, from, to, segCnt, zoom, animate = true) => {
        if (animate) {
            let geometry = new BufferGeometry();
            let eps = (to - from) / segCnt;
            let points_t = [];
            for (let t = from; t <= to; t += eps)
                points_t.push(new Vector3(xfunc(t * zoom), yfunc(t * zoom), 0));
            // points_t.push(new Vector3(-5, func(-5), 0));
            let points = new Float32Array(points_t.length * 3);
            let numPoints = points_t.length;
            let lineDistances = new Float32Array(numPoints);
            geometry.setAttribute('position', new BufferAttribute(points, 3));
            geometry.setAttribute('lineDistance', new BufferAttribute(lineDistances, 1));
            // populate
            for (let i = 0, index = 0, l = numPoints; i < l; i++, index += 3) {
                points[index] = points_t[i].x;
                points[index + 1] = points_t[i].y;
                points[index + 2] = points_t[i].z;
                if (i > 0)
                    lineDistances[i] = lineDistances[i - 1] + points_t[i - 1].distanceTo(points_t[i]);
            }
            // console.log(lineDistances[numPoints - 1]);
            return new Line(geometry, new LineDashedMaterial(
                {
                    color: 0x4444ff,
                    dashSize: 0,
                    gapSize: 1e10,
                    linewidth: 5,
                }));
        } else {
            let geometry = new Geometry();
            let eps = (to - from) / segCnt;
            for (let t = from; t <= to; t += eps)
                geometry.vertices.push(new Vector3(xfunc(t * zoom), yfunc(t * zoom), 0));
            return new Line(geometry, new LineBasicMaterial({color: 0x4444ff}));
        }
    };
    graphTransform = (fromfunc, tofunc, segCnt, zoom, fraction) => {
        let geometry = new BufferGeometry();
            let eps = 14 / segCnt;
            let points_t = [];
            for (let x = -7; x <= 7; x += eps)
                points_t.push(new Vector3(x, fraction * tofunc(x * zoom) + (1 - fraction) * fromfunc(x * zoom), 0));
            // points_t.push(new Vector3(-5, func(-5), 0));
            let points = new Float32Array(points_t.length * 3);
            let numPoints = points_t.length;
            let lineDistances = new Float32Array(numPoints);
            geometry.setAttribute('position', new BufferAttribute(points, 3));
            geometry.setAttribute('lineDistance', new BufferAttribute(lineDistances, 1));
            // populate
            for (let i = 0, index = 0, l = numPoints; i < l; i++, index += 3) {
                points[index] = points_t[i].x;
                points[index + 1] = points_t[i].y;
                points[index + 2] = points_t[i].z;
                if (i > 0)
                    lineDistances[i] = lineDistances[i - 1] + points_t[i - 1].distanceTo(points_t[i]);
            }
            // console.log(lineDistances[numPoints - 1]);
            let line = new Line(geometry, new LineDashedMaterial(
                {
                    color: 0x4444ff,
                    dashSize: 1000,
                    gapSize: 1e10,
                    linewidth: 5,
                }));
            this.scene.add(line);
            return line;
    };
    graphTransformParametric = (fromxfunc,fromyfunc, toxfunc, toyfunc, from, to, segCnt, zoom, fraction) => {
        let geometry = new BufferGeometry();
            let eps = (to - from) / segCnt;
            let points_t = [];
            for (let t = from; t <= to; t += eps)
                points_t.push(new Vector3(fraction * toxfunc(t * zoom) + (1 - fraction) * fromxfunc(t * zoom), fraction * toyfunc(t * zoom) + (1 - fraction) * fromyfunc(t * zoom), 0));
            let points = new Float32Array(points_t.length * 3);
            let numPoints = points_t.length;
            let lineDistances = new Float32Array(numPoints);
            geometry.setAttribute('position', new BufferAttribute(points, 3));
            geometry.setAttribute('lineDistance', new BufferAttribute(lineDistances, 1));
            // populate
            for (let i = 0, index = 0, l = numPoints; i < l; i++, index += 3) {
                points[index] = points_t[i].x;
                points[index + 1] = points_t[i].y;
                points[index + 2] = points_t[i].z;
                if (i > 0)
                    lineDistances[i] = lineDistances[i - 1] + points_t[i - 1].distanceTo(points_t[i]);
            }
            // console.log(lineDistances[numPoints - 1]);
            let line = new Line(geometry, new LineDashedMaterial(
                {
                    color: 0x4444ff,
                    dashSize: 1000,
                    gapSize: 1e10,
                    linewidth: 5,
                }));
            this.scene.add(line);
            return line;
    };
    graphTransformParametricCartesian = (fromxfunc, fromyfunc, tofunc, from, to, segCnt, zoom, fraction) => {
        let geometry = new BufferGeometry();
            let eps = 14 / segCnt;
            let points_t = [];
            for (let x = -7, t = from; x <= 7; x += eps, t += eps)
                points_t.push(new Vector3(fraction * x + (1 - fraction) * fromxfunc(t * zoom), fraction * tofunc(x * zoom) + (1 - fraction) * fromyfunc(t * zoom), 0));
            // points_t.push(new Vector3(-5, func(-5), 0));
            let points = new Float32Array(points_t.length * 3);
            let numPoints = points_t.length;
            let lineDistances = new Float32Array(numPoints);
            geometry.setAttribute('position', new BufferAttribute(points, 3));
            geometry.setAttribute('lineDistance', new BufferAttribute(lineDistances, 1));
            // populate
            for (let i = 0, index = 0, l = numPoints; i < l; i++, index += 3) {
                points[index] = points_t[i].x;
                points[index + 1] = points_t[i].y;
                points[index + 2] = points_t[i].z;
                if (i > 0)
                    lineDistances[i] = lineDistances[i - 1] + points_t[i - 1].distanceTo(points_t[i]);
            }
            // console.log(lineDistances[numPoints - 1]);
            let line = new Line(geometry, new LineDashedMaterial(
                {
                    color: 0x4444ff,
                    dashSize: 1000,
                    gapSize: 1e10,
                    linewidth: 5,
                }));
            this.scene.add(line);
            return line;
    };
    graphTransformCartesianParametric = (fromfunc, toxfunc, toyfunc, from, to, segCnt, zoom, fraction) => {
        let geometry = new BufferGeometry();
            let eps = (to - from) / segCnt;
            let points_t = [];
            for (let t = from, x = -7; t <= to; t += eps, x += eps)
                points_t.push(new Vector3(fraction * toxfunc(t * zoom) + (1 - fraction) * x, fraction * toyfunc(t * zoom) + (1 - fraction) * fromfunc(x * zoom), 0));
            let points = new Float32Array(points_t.length * 3);
            let numPoints = points_t.length;
            let lineDistances = new Float32Array(numPoints);
            geometry.setAttribute('position', new BufferAttribute(points, 3));
            geometry.setAttribute('lineDistance', new BufferAttribute(lineDistances, 1));
            // populate
            for (let i = 0, index = 0, l = numPoints; i < l; i++, index += 3) {
                points[index] = points_t[i].x;
                points[index + 1] = points_t[i].y;
                points[index + 2] = points_t[i].z;
                if (i > 0)
                    lineDistances[i] = lineDistances[i - 1] + points_t[i - 1].distanceTo(points_t[i]);
            }
            // console.log(lineDistances[numPoints - 1]);
            let line = new Line(geometry, new LineDashedMaterial(
                {
                    color: 0x4444ff,
                    dashSize: 1000,
                    gapSize: 1e10,
                    linewidth: 5,
                }));
            this.scene.add(line);
            return line;
    };

// shapes

    createCube = (side, texturePath = './textures/wood.jpg', i = 0, j = 0, k = 0, angleX = 0, angleY = 0, angleZ = 0) => {
        // side = scale(side, canvasX);
        this.createMeshes(new BoxBufferGeometry(side, side, side), texturePath, i, j, k, angleX, angleY, angleZ);
    };
    createLineSquare = (sqLength, x, y, animate = false) => {
        let squareShape = new Shape()
            .moveTo(x, y)
            .lineTo(x, y)
            .lineTo(x + sqLength, y)
            .lineTo(x + sqLength, y - sqLength)
            .lineTo(x, y - sqLength);
        return this.createLineShapes(squareShape, 0xffffff, animate, 0, 0, 0, 0, 0, 0);
    };

    createSphere = (radius, widthSegments, heightSegments, texturePath = './textures/wood.jpg', i = 0, j = 0, k = 0, angleX = 0, angleY = 0, angleZ = 0) => {

        // radius = scale(radius, canvasX);
        return this.createMeshes(new SphereGeometry(radius, widthSegments, heightSegments), texturePath, i, j, k, angleX, angleY, angleZ);
    };

    createLineCircle = (radius, x, y, numberOfSegments = 1000, animate = true) => {
        let shape = new Shape().moveTo(radius, 0);
        for (let i = 1; i <= numberOfSegments; i++) {
            let theta = (i / numberOfSegments) * Math.PI * 2;
            shape = shape.lineTo(
                Math.cos(theta) * radius,
                Math.sin(theta) * radius
            );
        }
        return this.createLineShapes(shape, 0xffffff, animate, x, y, 0.001, 0, 0, 0);
    };
    
    createArray = (numberOfElements, x , y, size, animate = true) => {
        let ret = [];
        for(let i = 0; i < numberOfElements; i++)
        {
            ret.push(this.createLineSquare(size, x + (i * size), y , animate));
        }
        return ret;
    };
// put is2D as true or false if you want 2D or 3D arrow respectively
    createArrow = (i1, j1, k1, i2, j2, k2, color, is2D) => {
        if (is2D) {
            k1 = 0;
            k2 = 0;
        }

        let dir = new Vector3(i2 - i1, j2 - j1, k2 - k1);
        // makes it a unit vector
        dir.normalize();

        let origin = new Vector3(i1, j1, k1);
        let length = Math.sqrt(Math.pow((i2 - i1), 2) + Math.pow((j2 - j1), 2) + Math.pow((k2 - k1), 2));

        let geometry = new ArrowHelper(dir, origin, length, color);

        this.scene.add(geometry);

    };

// for example, arr = [[0, 0, 0], [1, 1, 1], [5, 2, 8]]
    createPolygon = (hex, arr) => {

        let material = new LineBasicMaterial({
            color: hex
        });

        let geometry = new Geometry();

        let l = arr.length;

// add all the points to the geometry, can also scale them if required
        for (let i = 0; i < l; i++)
            geometry.vertices.push(new Vector3(arr[i][0], arr[i][1], arr[i][2]));

        this.scene.add(new Line(geometry, material));

    };

    createGraph = (graph, radius = 0.25, animate = true) => {
        let ret = [];
        for(let i in graph.nodes) {
            let node = graph.nodes[i];
            // noinspection JSUnfilteredForInLoop
            ret.push(this.createLineCircle(radius, node.x, node.y, 50, animate));
        }
        for(let i in graph.edges) {
            let edge = graph.edges[i];
            ret.push(this.createLine(graph.nodes[edge[0]].x, graph.nodes[edge[0]].y, graph.nodes[edge[1]].x, graph.nodes[edge[1]].y));
        }
        return ret;
    };


    // need to find what `original` is
    scale = (coordinate, original) => {
        return coordinate / 1000 * original; // 1000 = artificial width and height of the canvas
    };

    addAnimation = (animation) => {
        if (this.isPlaying)
            return;
        this.animations.push(animation);
        this.hasPlayed.push(false);
    };

    update = () => {
        let played = false;
        for (let i = this.start; i < this.animations.length; i++) {
            let currentAnimation = this.animations[i];
            if (currentAnimation.name === "checkpoint") {
                if (!played)
                    this.start = i + 1;
                return;
            }
            else if (currentAnimation.name === "delay") {
                console.log(this.delay);
                if(this.delay === 70)
                {
                    this.hasPlayed[i] = true;
                    this.start = i + 1;
                    this.delay = 0;
                }
                else this.delay++;
                return;
            }
            if (!this.hasPlayed[i]) {
                if (currentAnimation.terminateCond()) {
                    this.hasPlayed[i] = true;
                    currentAnimation.reset();
                } else {
                    played = true;
                    currentAnimation.animate();
                }
            }
        }
        if(!played)
            this.stop();
    };
    render = () => {
        this.renderer.render(this.scene, this.camera);
        if(this.capturer)
            this.capturer.capture(this.renderer.domElement);
    };
    play = () => {
        if (this.isPlaying)
            return;
        this.isPlaying = true;
        this.renderer.setAnimationLoop(() => {
            this.update();
            this.render();
        });
    };
    stop = () => {
        this.renderer.setAnimationLoop(null);
        if(this.capturer)
        {
            this.capturer.save();
            this.capturer.stop();
        }
    };

    record = () => {
        this.capturer = new CCapture({format: 'webm', framerate: 60});
        this.capturer.start();
    };
}
