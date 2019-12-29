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
    HemisphereLight,
    Line,
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
    TextGeometry,
    TextureLoader,
    Vector3,
    WebGLRenderer
} from './node_modules/three/src/Three.js';
import {OrbitControls} from './node_modules/three/examples/jsm/controls/OrbitControls.js';

export class Animation {
// let canvasX = ?widthOfCanvas?, canvasY = ?heightOfCanvas?;

    constructor(controls = true) {
        this.isPlaying = false;
        this.hasPlayed = [];
        this.animations = []; // Animations are a dictionary = {name, function, terminate_condition, ...variables}
        this.start = 0; // the index from which to start playing animations, for optimized animations

        /* This way of animating is not provably optimal but works well with small number
        * of animations. We will think of better ways after this crude implementation works
        * as planned.
        */
        this.container = document.querySelector('#scene-container');

        this.scene = new Scene();
        this.scene.background = new Color(0x000000);

        this.createCamera();
        if (controls)
            this.createControls();
        this.createLights();

        this.createRenderer();
        window.addEventListener('resize', () => {
            // set the aspect ratio to match the new browser window aspect ratio
            this.camera.aspect = this.container.clientWidth / this.container.clientHeight;

            // update the camera's frustum
            this.camera.updateProjectionMatrix();

            // update the size of the renderer AND the canvas
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);

        });


        this.renderer.setAnimationLoop(() => {

            this.update();
            this.render();

        });

    };

    createCamera = () => {

        this.camera = new PerspectiveCamera(
            35, // FOV
            container.clientWidth / container.clientHeight, // aspect

            0.1, // near clipping plane
            100, // far clipping plane
        );

        this.camera.position.set(0, 0, 10);

    };

    createControls = () => {
        new OrbitControls(this.camera, this.container);
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


//	geometry -> returned by create<shapeName>() let
//	texturePath -> path to the texture file
//	i = x-coordinate for positioning
//	j = y-coordinate for positioning
//	k = z-coordinate for positioning
//	angleX = amount of rotation about X-axis

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
    createLineShapes = (shape, color, animate, x, y, z, rx, ry, rz) => {
        shape.autoClose = true;
        if(animate) {
            let geometry = new BufferGeometry().fromGeometry(new ShapeGeometry(shape));
            let points = [];
            let points_temp = geometry.attributes.position.array;
            for(let i = 0;i < points_temp.length; i += 3) {
                points.push(new Vector3(points_temp[i], points_temp[i+1], points_temp[i+2]));
            }
            let numPoints = points.length;
            let lineDistances = new Float32Array(numPoints); // 1 value per point

            geometry.setAttribute('lineDistance', new BufferAttribute(lineDistances, 1));
            // populate
            for (let i = 0, index = 0, l = numPoints; i < l; i++, index += 3)
                if (animate && i > 0)
                    lineDistances[i] = lineDistances[i - 1] + points[i - 1].distanceTo(points[i]);

            console.log(lineDistances[999]);
            let line = new Line(geometry, new LineDashedMaterial({color: color, dashSize: 1, gapSize: 1e10}));
            line.position.set(x, y, z);
            line.rotation.set(rx, ry, rz);
            this.scene.add(line);
            return line;
        } else {
            let points = shape.getPoints();
            let geometry = new BufferGeometry().setFromPoints( points );
            let line = new Line(geometry, new LineBasicMaterial({ color: color }));
            this.scene.add(line);
            return line;
        }
    };
    fill = (line, color, opacity) => {
        let material = new MeshBasicMaterial({color: color, side: DoubleSide, transparent: true, opacity: opacity});
        this.scene.add(new Mesh(line, material));
        return material;
    };
    createRenderer = () => {
        this.renderer = new WebGLRenderer({antialias: true});
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);

        this.renderer.setPixelRatio(window.devicePixelRatio);

        this.renderer.gammaFactor = 2.2;
        this.renderer.gammaOutput = true;
        this.renderer.physicallyCorrectLights = true;

        this.container.appendChild(this.renderer.domElement);
    };

// shapes

    createCube = (side, texturePath = './textures/wood.jpg', i = 0, j = 0, k = 0, angleX = 0, angleY = 0, angleZ = 0) => {
        // side = scale(side, canvasX);
        this.createMeshes(new BoxBufferGeometry(side, side, side), texturePath, i, j, k, angleX, angleY, angleZ);
    };
    createLineSquare = (sqLength, animate = false) => {
        let squareShape = new Shape()
            .moveTo(0, 0)
            .lineTo(0, sqLength)
            .lineTo(sqLength, sqLength)
            .lineTo(sqLength, 0)
            .lineTo(0, 0);
        return this.createLineShapes(squareShape, 0xffffff, animate, 0, 0, 0, 0, 0, 0);
    };

    createSphere = (radius, widthSegments, heightSegments, texturePath = './textures/wood.jpg', i = 0, j = 0, k = 0, angleX = 0, angleY = 0, angleZ = 0) => {

        // radius = scale(radius, canvasX);
        return this.createMeshes(new SphereGeometry(radius, widthSegments, heightSegments), texturePath, i, j, k, angleX, angleY, angleZ);
    };

    createLineCircle = (radius, numberOfSegments = 1000, animate = false) => {
        let shape = new Shape().moveTo(radius, 0);
        for (let i = 1; i <= numberOfSegments; i++) {
            let theta = (i / numberOfSegments) * Math.PI * 2;
            shape = shape.lineTo(
                Math.cos(theta) * radius,
                Math.sin(theta) * radius
            );
        }
        return this.createLineShapes(shape, 0xffffff, animate, 0, 0, 0, 0, 0, 0);
    };

// put is2D as true or false if you want 2D or 3D arrow respectively
    createArrow = (i1, j1, k1, i2, j2, k2, color, is2D) => {
        if (is2D) {
            k1 = 0;
            k2 = 0;
        }

        // to scale the coordinates
        // i1 = scale(i1, canvasX);
        // i2 = scale(i2, canvasX);
        // j1 = scale(j1, canvasY);
        // j2 = scale(j2, canvasY);
        // k1 = scale(k1, canvasZ);
        // k2 = scale(k2, canvasZ);

        let dir = new Vector3(i2 - i1, j2 - j1, k2 - k1);
        // makes it a unit vector
        dir.normalize();

        let origin = new Vector3(i1, j1, k1);
        let length = Math.sqrt(Math.pow((i2 - i1), 2) + Math.pow((j2 - j1), 2) + Math.pow((k2 - k1), 2));
        /////////////////////// why does 0xff1 yield blue???

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

    createText = (content) => {

        let loader = new FontLoader();
        let geometry;
        loader.load('fonts/helvetiker_regular.typeface.json', (font) => {
            geometry = new TextGeometry(content, {
                font: font,
                size: 1,
                height: 0.1,
                curveSegments: 10,
                bevelEnabled: false
            });
            const material = new MeshStandardMaterial({
                color: 0x112233,
                // side: DoubleSide  // creates a double sided object
            });

            let text = new Mesh(geometry, material);
            text.position.set(0, 0, 3);
            //new OrbitControls(text, container);
            this.scene.add(text);
        });
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
                break;
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
    };
    render = () => {
        this.renderer.render(this.scene, this.camera);
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
    };
}
