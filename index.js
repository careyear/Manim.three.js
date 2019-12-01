import {
    Scene,
    Color,
    PerspectiveCamera,
    HemisphereLight,
    DirectionalLight,
    BoxBufferGeometry,
    TextureLoader,
    sRGBEncoding,
    MeshStandardMaterial,
    Mesh,
    WebGLRenderer
} from './node_modules/three/src/Three.js';
import {OrbitControls} from './node_modules/three/examples/jsm/controls/OrbitControls.js';
// these need to be accessed inside more than one function so we'll declare them first
let container;
let camera;
let renderer;
let scene;
let mesh;
let controls;

function init() {

  container = document.querySelector( '#scene-container' );

  scene = new Scene();
  scene.background = new Color( 0x8FBCD4 );

  createCamera();
  createControls();
  createLights();
  createMeshes();
  createRenderer();

  renderer.setAnimationLoop( () => {

    update();
    render();

  } );

}

function createCamera() {

  camera = new PerspectiveCamera(
    35, // FOV
    container.clientWidth / container.clientHeight, // aspect

    0.1, // near clipping plane
    100, // far clipping plane
  );

  camera.position.set( -4, 4, 10 );

}
function createControls() {

  controls = new OrbitControls( camera, container );

}

function createLights() {

    const ambientLight = new HemisphereLight(
    0xddeeff, // bright sky color
    0x202020, // dim ground color
    5, // intensity
    );
    scene.add( ambientLight );

    const mainLight = new DirectionalLight( 0xffffff, 5);
    mainLight.position.set( 10, 10, 10 );

    scene.add( ambientLight, mainLight );

}

function createMeshes() {

  const geometry = new BoxBufferGeometry( 2, 2, 2 );

  const textureLoader = new TextureLoader();

  const texture = textureLoader.load( 'textures/uv_test_bw.png' );

  texture.encoding = sRGBEncoding;
  texture.anisotropy = 16;

  const material = new MeshStandardMaterial( {
    map: texture,
  } );

  mesh = new Mesh( geometry, material );

  scene.add( mesh );

}

function createRenderer() {

  renderer = new WebGLRenderer( { antialias: true } );
  renderer.setSize( container.clientWidth, container.clientHeight );

  renderer.setPixelRatio( window.devicePixelRatio );

  renderer.gammaFactor = 2.2;
  renderer.gammaOutput = true;
  renderer.physicallyCorrectLights = true;

  container.appendChild( renderer.domElement );

}

function update() {
    // increase the mesh's rotation each frame
    // mesh.rotation.z += 0.01;
    // mesh.rotation.x += 0.01;
    // mesh.rotation.y += 0.01;
}

function render() {
    renderer.render( scene, camera );
}
function play() {
    renderer.setAnimationLoop(() => {
        update();
        render();
    });
}
function stop() {
    renderer.setAnimationLoop(null);
}
window.addEventListener('resize', () => {
    // set the aspect ratio to match the new browser window aspect ratio
    camera.aspect = container.clientWidth / container.clientHeight;


    // update the camera's frustum
    camera.updateProjectionMatrix();

    // update the size of the renderer AND the canvas
    renderer.setSize( container.clientWidth, container.clientHeight );

});

// call the init function to set everything up
init();
play();
