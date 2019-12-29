import {
    ArrowHelper,
    BoxBufferGeometry,
    CircleGeometry,
    Color,
    DirectionalLight,
    DoubleSide,
    FontLoader,
    Geometry,
    HemisphereLight,
    Line,
    LineBasicMaterial,
    Mesh,
    MeshStandardMaterial,
    PerspectiveCamera,
    Scene,
    SphereGeometry,
    sRGBEncoding,
    TextGeometry,
    TextureLoader,
    Vector3,
    WebGLRenderer
} from './node_modules/three/src/Three.js';
import {OrbitControls} from './node_modules/three/examples/jsm/controls/OrbitControls.js';
// import {BoxBufferGeometry} from "./node_modules/three/src/Three";
// these need to be accessed inside more than one let so we'll declare them first

export class Animation {

// for coordinates
// let canvasX = ?widthOfCanvas?, canvasY = ?heightOfCanvas?;

    constructor(controls = true) {

        this.container = document.querySelector('#scene-container');

        this.scene = new Scene();
        this.scene.background = new Color(0x000000);

        this.createCamera();
        if (controls)
            this.createControls();
        this.createLights();
        // createMeshes(createCircle(2, 100, 0, 2 * Math.PI), 'textures/wood.jpg', 0, 0, 0, 0, 0, 0);
        // createArrow( 0, 0, 0, 1, 0, 0, 0xff0000, false ); // x-axis
        // createArrow( 0, 0, 0, 0, 1, 0, 0x00ff00, false ); // y-axis
        // createArrow( 0, 0, 0, 0, 0, 1, 0x0000ff, false ); // z-axis
        //   createArrow(1, 1, 1, 2, 2, 2, 0xffffff, false);


        // let blah = [[0, 0, 0], [1, 2.5, 0], [2, 0, 0], [0, 1.75, 0], [2, 1.75, 0], [0, 0, 0]];
        // createPolygon(0xffffff, blah);

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

        this.mesh = new Mesh(geometry, material);
        this.mesh.position.x = i;
        this.mesh.position.y = j;
        this.mesh.position.z = k;
        this.mesh.rotation.x = angleX;
        this.mesh.rotation.y = angleY;
        this.mesh.rotation.z = angleZ;
        this.scene.add(this.mesh);

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

    createCircle = (radius, numberOfSegments, startAngle, endAngle, texturePath = './textures/wood.jpg', i = 0, j = 0, k = 0, angleX = 0, angleY = 0, angleZ = 0) => {

        // radius = scale(radius, canvasX);

        this.createMeshes(new CircleGeometry(radius, numberOfSegments, startAngle, endAngle), texturePath, i, j, k, angleX, angleY, angleZ);
    };

    createSphere = (radius, widthSegments, heightSegments, texturePath = './textures/wood.jpg', i = 0, j = 0, k = 0, angleX = 0, angleY = 0, angleZ = 0) => {

        // radius = scale(radius, canvasX);
        this.createMeshes(new SphereGeometry(radius, widthSegments, heightSegments), texturePath, i, j, k, angleX, angleY, angleZ);
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

    update = () => {
        // increase the mesh's rotation each frame
        // mesh.rotation.z += 0.01;
        // mesh.rotation.x += 0.01;
        // mesh.rotation.y += 0.01;
    };
    render = () => {
        this.renderer.render(this.scene, this.camera);
    };
    play = () => {
        this.renderer.setAnimationLoop(() => {
            this.update();
            this.render();
        });
    };
    stop = () => {
        this.renderer.setAnimationLoop(null);
    };
}
