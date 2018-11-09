var options = {
  element: 0,
};

// Particles colors
var protonColor = 0x0000ff;
var neutronColor = 0xff0000;
var electronColor = 0x808080;

// Starting values
var particleRadius;
var particleRadiusIncrement;
var randomWalkFactor;
var nucleusRadius = 50;
var numProtons;
var numNeutrons;
var numElectrons;
var nucleusElements = [];
var electrons = [];
var shells = [];
var geo;
var mat;
var shell;
var particlesGeo;
var animationFrame;

var canvas, scene, camera, renderer, stats

// Status monitor
var stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );

// Canvas
canvas = document.getElementById( "canvas" );
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Scene
scene = new THREE.Scene();

// Add the camera
var aspectRatio = window.innerWidth / (window.innerHeight);
camera = new THREE.OrthographicCamera(-200*aspectRatio, 200*aspectRatio, 200, -200, 1, 10000);
camera.position.z = 500;
scene.add(camera);

// Renderer
renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, canvas: canvas});
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor( 0x000000, 1 );
document.body.appendChild(renderer.domElement);

// Add controls
var controls;
controls = new THREE.OrbitControls( camera, renderer.domElement );
// controls.addEventListener( 'change', renderer );

// Clear scene
function clearScene(obj){
  while(obj.children.length > 0){
    clearScene(obj.children[0])
    obj.remove(obj.children[0]);
  }
  if(obj.geometry) obj.geometry.dispose();
  if(obj.material) obj.material.dispose();
  if(obj.texture) obj.texture.dispose();
  nucleusElements = [];
  electrons = [];
  shells = [];
}

// Random point generator inside a sphere
function getPoint(radius) {
  var u = Math.random();
  var v = Math.random();
  var theta = u * 2.0 * Math.PI;
  var phi = Math.acos(2.0 * v - 1.0);
  var r = Math.cbrt(Math.random())*radius;
  var sinTheta = Math.sin(theta);
  var cosTheta = Math.cos(theta);
  var sinPhi = Math.sin(phi);
  var cosPhi = Math.cos(phi);
  var x = r * sinPhi * cosTheta;
  var y = r * sinPhi * sinTheta;
  var z = r * cosPhi;
  var point = new THREE.Vector3(x, y, z)
  return point;
}

// Draw each neutron particle
function drawNucleusParticle(color){
  var sphereCenter = getPoint(nucleusRadius - particleRadius);
  var mat = new THREE.MeshPhongMaterial({color: color, shininess: 90});
  var particle = new THREE.Mesh(particlesGeo, mat);
  particle.scale.set(particleRadius, particleRadius, particleRadius);
  particle.position.add(sphereCenter);
  nucleusElements.push(particle);
  scene.add(particle);
}

// Draw the element with its protons, neutrons and electrons
function drawElement(){

  clearScene(scene)

  // Add lights
  // Ambient light
  var ambientLight = new THREE.AmbientLight( 0xffffff ); // soft white light
  scene.add(ambientLight);

  // Camera Flash light
  var flashlight = new THREE.SpotLight(0xffffff, 1, 0);
  camera.add(flashlight);
  flashlight.position.set(0,0,100);
  flashlight.target = camera;

  numProtons = data.elements[options.element].number;
  numNeutrons = Math.round(data.elements[options.element].atomic_mass)
  - data.elements[options.element].number;
  numElectrons = data.elements[options.element].shells;
  numShells = data.elements[options.element].shells.length;

  // Variables
  particleRadius = Math.pow(Math.pow(nucleusRadius, 3) * 0.01/(numProtons + numNeutrons), 1/3);
  particleRadiusIncrement = 0.1;
  randomWalkFactor = 0.1;

  // Add shells
  mat = new THREE.MeshBasicMaterial({color: 0xffffff, opacity: 0.05, transparent: true });
  for(var i = 0; i <  numShells+ 1; i++) {
    geo = new THREE.SphereGeometry(nucleusRadius + i * 20, 100, 100);
    shell = new THREE.Mesh(geo, mat);
    scene.add(shell);
    shells.push(shell)
  }

  // Nucleus elements
  particlesGeo = new THREE.SphereGeometry(1, 20, 20);
  particlesGeo.dynamic = true;
  // Draw protons
  for(var i = 0; i < numProtons; i++) {
    drawNucleusParticle(protonColor);
  }

  // Draw neutrons
  for(var i = 0; i < numNeutrons; i++) {
    drawNucleusParticle(neutronColor);
  }

  // Add electrons
  var electron = null, plane = new THREE.Plane(), point = new THREE.Vector3();
  geo = new THREE.SphereBufferGeometry(5, 16, 16);
  mat = new THREE.MeshPhongMaterial({color: electronColor});
  for(var i = 0; i < numShells; ++i){
    for (var j = 0; j < numElectrons[i]; ++j){
      electron = new THREE.Mesh(geo, mat);
      electrons.push(electron);
      electron.angle = new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize();
      electron.orbitSpeed = 0.03;//((Math.random() * 0.05) + 0.02)*(Math.round(Math.random())*2-1);
      plane.normal.copy(electron.angle);
      point.set(Math.random(), Math.random(), Math.random());
      plane.projectPoint(point, electron.position);
      electron.position.setLength(nucleusRadius + 20 * (i+1));
      electron.position.applyAxisAngle(electron.angle, Math.random() / 10);
      scene.add(electron);
    }
  }

  // Run Animation
  animate();
}

// Draw element
drawElement();

// Update electrons
function updateElectrons(){
  var obj = null;
  for(var i = 0; i < electrons.length; ++i){
    obj = electrons[i]
    obj.position.applyAxisAngle(obj.angle, obj.orbitSpeed);
  }
}

// Update nucleus
function updateNucleus(){
  var totalDeformation = 0;

  for(var i = 0; i < nucleusElements.length; i++) {
    // Do random walk
    var randomWalk = getPoint(randomWalkFactor);
    nucleusElements[i].position.add(randomWalk);

    // Calculate deformation between spheres and rearrange
    for(var j = 0; j < nucleusElements.length; j++) {
      if(i === j) continue;
      deformation = Math.max(1/2*(2*particleRadius-nucleusElements[i].position.distanceTo(nucleusElements[j].position)), 0);
      repulsion = new THREE.Vector3().copy(nucleusElements[i].position).sub(nucleusElements[j].position).normalize().multiplyScalar(deformation);
      if(deformation > 0) {
        totalDeformation += deformation;
        nucleusElements[i].position.add(repulsion);
        nucleusElements[j].position.sub(repulsion);
      }
    }
    // Calculate deformation on outer sphere and rearrange
    var deformation = Math.max(nucleusElements[i].position.distanceTo(shells[0].position) - nucleusRadius + particleRadius, 0);
    var repulsion = new THREE.Vector3().copy(nucleusElements[i].position).normalize().multiplyScalar(-deformation);
    if (deformation > 0){
      nucleusElements[i].position.add(repulsion);
      totalDeformation += deformation;
    }
  }
  // console.log(particleRadius)
  if (totalDeformation == 0){
    particleRadius += particleRadiusIncrement;
    particleRadiusIncrement *= 1.01;
    randomWalkFactor += 0.0001;
  }
  else{
    particleRadius -= particleRadiusIncrement;
    particleRadiusIncrement *= 0.99;
    randomWalkFactor -= 0.0001;
  }
  for(var i = 0; i < nucleusElements.length; i++){
    nucleusElements[i].scale.set(particleRadius, particleRadius, particleRadius);
    particlesGeo.verticesNeedUpdate = true;
  }
  return totalDeformation;
}

// Animation function
var fps = 60;
var now;
var then = Date.now();
var interval = 1000/fps;
var delta;
function animate() {


  animationFrame = requestAnimationFrame(animate);

  now = Date.now();
  delta = now - then;

  if (delta > interval) {
    then = now - (delta % interval);

    // Update controls
    controls.update();

    stats.begin();
    // console.log(particleRadiusIncrement)
    // console.log((numProtons+numNeutrons)*Math.pow(particleRadius,3)/Math.pow(nucleusRadius,3))
    // if (particleRadius/nucleusRadius < 0.47)
    if ((numProtons+numNeutrons)*Math.pow(particleRadius,3)/Math.pow(nucleusRadius,3) < 0.36)
    updateNucleus();

    // Update electrons
    updateElectrons();

    stats.end();

    // Render
    renderer.render(scene, camera);
  }
}
