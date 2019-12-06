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
    WebGLRenderer,
    Vector3,
    ArrowHelper,
    CircleGeometry,
    SphereGeometry,
    DoubleSide,
    FontLoader,
    TextGeometry
} from './node_modules/three/src/Three.js';
import {OrbitControls} from './node_modules/three/examples/jsm/controls/OrbitControls.js';
// these need to be accessed inside more than one function so we'll declare them first
let container;
let camera;
let renderer;
let scene;
let mesh;

function init() {

  container = document.querySelector( '#scene-container' );

  scene = new Scene();
  scene.background = new Color( 0x000000 );

  createCamera();
  createControls();
  createLights();
  createMeshes(createCube(), 'textures/uv_test_bw.png', 0, 1, 0, 0);
  createMeshes(createSphere(), 'textures/boxes.jpg', 2, 1, 2, 1);
  createMeshes(createCircle(), 'textures/wood.jpg', 0, 0, 0, Math.PI / 2);
  createArrow( -2, 0, 0 );
  createText("Helllooo!!!");
  createRenderer();
  createStaticText("Lorem Ipsum Dolor Sit Amet", 20, 40);

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

  new OrbitControls( camera, container );

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

function createMeshes(geometry, texturePath, i, j, k, angleX) {

  const textureLoader = new TextureLoader();

  const texture = textureLoader.load( texturePath );

  texture.encoding = sRGBEncoding;
  texture.anisotropy = 16;

  const material = new MeshStandardMaterial( {
    map: texture,
    side: DoubleSide  // creates a double sided object
  } );

  mesh = new Mesh( geometry, material );
  mesh.position.x = i;
  mesh.position.y = j;
  mesh.position.z = k;
  mesh.rotation.x = angleX;
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

// shapes

function createCube(){

  let geometry = new BoxBufferGeometry( 2, 2, 2 );

  return geometry;

}

function createCircle(){

  let geometry = new CircleGeometry( 5, 45 );

  return geometry;
}

function createSphere(){
  let geometry = new SphereGeometry( 1, 50, 50 );

  return geometry;
}

function createArrow(i, j, k){

  let dir = new Vector3( 0, 1, 0 );
  // makes it a unit vector
  dir.normalize();

  let origin = new Vector3( i, j, k );
  let length = 3;
  let hex = 0xffff11; /////////////////////// why does 0xff1 yield blue???

  let geometry = new ArrowHelper( dir, origin, length, hex );

  scene.add(geometry);

}

function createText(content){

  let loader = new FontLoader();
  let geometry;
  loader.load( 'fonts/helvetiker_regular.typeface.json', (font) => {
    geometry = new TextGeometry(content, {
      font: font,
      size: 1,
      height: 0.1,
      curveSegments: 10,
      bevelEnabled: false
    } );
      const material = new MeshStandardMaterial( {
        color: 0x112233,
       // side: DoubleSide  // creates a double sided object
      } );

      let text = new Mesh(geometry, material);
      text.position.set(0, 0, 3);
      //new OrbitControls(text, container);
      scene.add(text);
  } );
}

function createStaticText(content, x, y){

  //to get the coordinates of the top left corner of canvas
  let rect = container.getBoundingClientRect();
  let canvasX = rect.left, canvasY = rect.top;

  let textX = x + canvasX;
  let textY = y + canvasY;

  let node = document.createElement("span");
  let textnode = document.createTextNode(content);
  node.appendChild(textnode);
  container.appendChild(node);
  node.style.top = textX + "px";
  node.style.left = textY + "px";
  node.style.color = "#fff";
  node.setAttribute("id", "fixedText");

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
