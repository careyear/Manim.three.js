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
    TextGeometry,
    LineBasicMaterial,
    Geometry,
    Line
} from './node_modules/three/src/Three.js';
import {OrbitControls} from './node_modules/three/examples/jsm/controls/OrbitControls.js';
// these need to be accessed inside more than one function so we'll declare them first
let container;
let camera;
let renderer;
let scene;
let mesh;

// for coordinates
// let canvasX = ?widthOfCanvas?, canvasY = ?heightOfCanvas?;


function init() {

  container = document.querySelector( '#scene-container' );

  scene = new Scene();
  scene.background = new Color( 0x000000 );

  createCamera();
  createControls();
  createLights();
  createMeshes(createCircle(2, 100, 0, 2 * Math.PI), 'textures/wood.jpg', 0, 0, 0, 0, 0, 0);
  createArrow( 0, 0, 0, 1, 0, 0, 0xff0000, false ); // x-axis
  createArrow( 0, 0, 0, 0, 1, 0, 0x00ff00, false ); // y-axis
  createArrow( 0, 0, 0, 0, 0, 1, 0x0000ff, false ); // z-axis

  let blah = [[0, 0, 0], [1, 2.5, 0], [2, 0, 0], [0, 1.75, 0], [2, 1.75, 0], [0, 0, 0]];
  createPolygon(0xffffff, blah);

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



//	geometry -> returned by create<shapeName>() function
//	texturePath -> path to the texture file
//	i = x-coordinate for positioning
//	j = y-coordinate for positioning
//	k = z-coordinate for positioning
//	angleX = amount of rotation about X-axis

function createMeshes(geometry, texturePath, i, j, k, angleX, angleY, angleZ) {

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
  mesh.rotation.y = angleY;
  mesh.rotation.z = angleZ;
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

function createCube( side ){

  // side = scale(side, canvasX);
  let geometry = new BoxBufferGeometry( side, side, side );

  return geometry;

}

function createCircle( radius, numberOfSegments, startAngle, endAngle ){

  // radius = scale(radius, canvasX);
  let geometry = new CircleGeometry( radius, numberOfSegments, startAngle, endAngle );

  return geometry;
}

function createSphere( radius, widthSegments, heightSegments ){

  // radius = scale(radius, canvasX);
  let geometry = new SphereGeometry( radius, widthSegments, heightSegments );

  return geometry;
}


// put is2D as true or false if you want 2D or 3D arrow respectively
function createArrow( i1, j1, k1, i2, j2, k2, color, is2D ){
	
  if(is2D)
	 k1 = 0, k2 = 0;

  // to scale the coordinates
  // i1 = scale(i1, canvasX);
  // i2 = scale(i2, canvasX);
  // j1 = scale(j1, canvasY);
  // j2 = scale(j2, canvasY);
  // k1 = scale(k1, canvasZ);
  // k2 = scale(k2, canvasZ);

  let dir = new Vector3( i2 - i1, j2 - j1, k2 - k1 );
  // makes it a unit vector
  dir.normalize();

  let origin = new Vector3( i1, j1, k1 );
  let length = Math.sqrt( Math.pow((i2 - i1), 2) + Math.pow((j2 - j1), 2) + Math.pow((k2 - k1), 2) );
  let hex = color; /////////////////////// why does 0xff1 yield blue???

  let geometry = new ArrowHelper( dir, origin, length, hex );

  scene.add(geometry);

}

// for example, arr = [[0, 0, 0], [1, 1, 1], [5, 2, 8]]
function createPolygon(hex, arr){
  
  let material = new LineBasicMaterial({
    color: hex
  });

  let geometry = new Geometry();

  let l = arr.length;

// add all the points to the geometry, can also scale them if required
  for(let i = 0; i < l; i++)
    geometry.vertices.push(new Vector3(arr[i][0], arr[i][1], arr[i][2]));

  let line = new Line(geometry, material);
  scene.add(line);

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


// need to find what `original` is
function scale(coordinate, original){
    return coordinate / 1000 * original; // 1000 = artificial width and height of the canvas
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
