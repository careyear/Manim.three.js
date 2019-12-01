import {
    Mesh,
    Scene,
    Color,
    PerspectiveCamera,
    BoxBufferGeometry,
    MeshStandardMaterial,
    WebGLRenderer,
    DirectionalLight
} from './node_modules/three/src/Three.js';

// these need to be accessed inside more than one function so we'll declare them first
let container;
let camera;
let renderer;
let scene;
let mesh;
let light;

function init() {

    // Get a reference to the container element that will hold our scene
    container = document.querySelector( '#scene-container' );

    // create a Scene
    scene = new Scene();

    scene.background = new Color( 0x8FBCD4 );

    // set up the options for a perspective camera
    const fov = 35; // fov = Field Of View
    const aspect = container.clientWidth / container.clientHeight;

    const near = 0.1;
    const far = 100;

    camera = new PerspectiveCamera( fov, aspect, near, far );

    // every object is initially created at ( 0, 0, 0 )
    // we'll move the camera back a bit so that we can view the scene
    camera.position.set( 0, 0, 10 );

    // create a geometry
    const geometry = new BoxBufferGeometry( 2, 2, 2 );

    // create a default (white) Basic material
    const material = new MeshStandardMaterial( { color: 0x800080 } );

    // create a Mesh containing the geometry and material
    mesh = new Mesh( geometry, material );

    // add the mesh to the scene object
    scene.add( mesh );

    // Create a directional light
    light = new DirectionalLight( 0xffffff, 5.0 );

    // move the light back and up a bit
    light.position.set( 10, 10, 10 );

    // remember to add the light to the scene
    scene.add( light );

    // create a WebGLRenderer and set its width and height
    renderer = new WebGLRenderer({antialias: true});
    renderer.setSize( container.clientWidth, container.clientHeight );

    renderer.setPixelRatio( window.devicePixelRatio );

    // add the automatically created <canvas> element to the page
    container.appendChild( renderer.domElement );
}

function animate() {
  // render, or 'create a still image', of the scene
    requestAnimationFrame(animate);

    // increase the mesh's rotation each frame
    mesh.rotation.z += 0.01;
    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.01;

    renderer.render( scene, camera );

}

// call the init function to set everything up
init();

// then call the animate function to render the scene
animate();
