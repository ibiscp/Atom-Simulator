var options = {
  element: 0,
  pause: true,
  shells: true,
  nucleusAnimation: true,
  shellNucleus: true,
  shell1: true,
  shell2: true,
  shell3: true,
  shell4: true,
  shell5: true,
  shell6: true,
  shell7: true,
};

// Particles colors
var protonColor = 0x0000FF;
var neutronColor = 0xFF0000;
var electronColor = [0x686868, 0x888888, 0xA9A9A9, 0xC8C8C8, 0xE0E0E0, 0xFFFFFF];
var valenciaColor = 0xFFFF00;

// Starting values
var particleRadius;
var nucleusRadius = 50;
var numProtons;
var numNeutrons;
var numElectrons;
var particlesGeo;
var animationFrame;
var def;

// Hierarchical model
var figure = [];
var shellsId = 0;
var nucleusElementsId = 1;
var electronsId = 2;

var canvas, scene, camera, renderer, stats, flashlight, controls;

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
// Camera Flash light
flashlight = new THREE.SpotLight(0xffffff, 1, 0);
flashlight.position.set(0,0,100);
flashlight.target = camera;
// camera.add(flashlight);

// Renderer
renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, canvas: canvas});
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor( 0x000000, 1 );
document.body.appendChild(renderer.domElement);

// Add controls
controls = new THREE.OrbitControls( camera, renderer.domElement );

// Clear scene
function clearScene(obj){
  while(obj.children.length > 0){
    clearScene(obj.children[0]);
    obj.remove(obj.children[0]);
  }
  if(obj.geometry) obj.geometry.dispose();
  if(obj.material) obj.material.dispose();
  if(obj.texture) obj.texture.dispose();
}

// Generate nucleus
function nucleusGenerator(){

  while (def < 1){
    var newDef = updateNucleus();
    if (def == 0)
    def = 0.1;
    else
    def = newDef;
  }
}

//
function setVisibility(){
  var electronCount = 0;
  var shellOptions = [options.shellNucleus, options.shell1, options.shell2, options.shell3,
                      options.shell4, options.shell5, options.shell6, options.shell7];

  // Nucleus
  figure[shellsId].object_list[0].visible = shellOptions[0] && options.shells;
  for(var i = 0; i < numProtons+numNeutrons; i++)
    figure[nucleusElementsId].object_list[i].visible = shellOptions[0];

  // For every shell
  for(var j = 0; j < numElectrons.length; j++){
    figure[shellsId].object_list[j+1].visible = shellOptions[j+1] && options.shells;
    var temp = electronCount;
    for(var i = temp; i < temp + numElectrons[j]; i++){
      figure[electronsId].object_list[i].visible = shellOptions[j+1];
      electronCount += 1;
    }
  }
}

// Reset nucleus animation
function resetNucleus(){
  // Variables
  particleRadius = Math.pow(Math.pow(nucleusRadius, 3) * 0.01/(numProtons + numNeutrons), 1/3);
  def = 0;
}

// Node for hierarchical model
function createNode(object_list, parent){
  var node = {
    object_list: object_list,
    parent: parent,
  }
  return node;
}

// Reset variables
function reset(){
  // Clear Scene
  clearScene(scene);

  // Figure vector
  figure = [];

  // Reset nucleus animation
  resetNucleus();

  // Add camera
  camera.add(flashlight);
  scene.add(camera);

  // Ambient light
  var ambientLight = new THREE.AmbientLight( 0xffffff ); // soft white light
  scene.add(ambientLight);
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

// Check if the value to be shown is null
function checkNull(value, unit){
  if (value == null)
  return "";
  else
  return value + " " + unit;
}

// Set element description
function setDescription(){
  document.getElementById("symbol").textContent=data.elements[options.element].symbol;
  document.getElementById("name").textContent=data.elements[options.element].name;
  document.getElementById("summary").textContent=data.elements[options.element].summary;
  document.getElementById("category").innerHTML=data.elements[options.element].category;
  document.getElementById("atomic_mass").innerHTML=data.elements[options.element].atomic_mass;
  document.getElementById("density").innerHTML=checkNull(data.elements[options.element].density, "g/L");
  document.getElementById("melt").innerHTML=checkNull(data.elements[options.element].melt, "K");
  document.getElementById("molar_heat").innerHTML=checkNull(data.elements[options.element].molar_heat, "J/(mol·K)");
  document.getElementById("boil").innerHTML=checkNull(data.elements[options.element].boil, "K");
  document.getElementById("number").innerHTML=data.elements[options.element].number;
  document.getElementById("period").innerHTML=data.elements[options.element].period;
  document.getElementById("group").innerHTML=data.elements[options.element].xpos;
  document.getElementById("phase").innerHTML=data.elements[options.element].phase;
  document.getElementById("discovered_by").innerHTML=checkNull(data.elements[options.element].discovered_by);
  document.getElementById("named_by").innerHTML=checkNull(data.elements[options.element].named_by);
  document.getElementById("source").innerHTML=data.elements[options.element].source;
  document.getElementById("source").setAttribute('href', data.elements[options.element].source);
  // document.getElementById("spectral_img").setAttribute('src', data.elements[options.element].spectral_img);
  document.getElementById("protons").innerHTML=numProtons;
  document.getElementById("neutrons").innerHTML=numNeutrons;
  document.getElementById("electrons").innerHTML=numElectrons.reduce(function(a, b) { return a + b; }, 0);
  document.getElementById("valencia").innerHTML=numElectrons[numElectrons.length-1];
}

// Hide or show shells
function toggleShells(){
  for(var i = 0; i <  numShells + 1; i++) {
    figure[shellsId].object_list[i].visible = options['shells'];
  }
  renderer.render(scene, camera);
}

// Draw each neutron particle
function drawNucleusParticle(colorP){
  var sphereCenter = getPoint(nucleusRadius - particleRadius);
  var mat = new THREE.MeshPhongMaterial({color: colorP, shininess: 90});
  var particle = new THREE.Mesh(particlesGeo, mat);
  particle.scale.set(particleRadius, particleRadius, particleRadius);
  particle.position.add(sphereCenter);
  scene.add(particle);
  return particle;
}

// Draw the element with its protons, neutrons and electrons
function drawElement(){
  // Define number of elements
  numProtons = data.elements[options.element].number;
  numNeutrons = Math.round(data.elements[options.element].atomic_mass)
  - data.elements[options.element].number;
  numElectrons = data.elements[options.element].shells;
  numShells = data.elements[options.element].shells.length;

  // Reset simulator
  reset();

  // Set element description
  setDescription()

  // Create empty nodes for hierarchical model
  for( var i=0; i<3; i++) figure[i] = createNode(null, null);

  // Add shells
  var shells = [];
  var shellMat = new THREE.MeshBasicMaterial({color: 0xffffff, opacity: 0.03, transparent: true});
  var shellGeo, shell;
  for(var i = 0; i <  numShells + 1; i++) {
    if (i == 0)
      shellGeo = new THREE.SphereGeometry(nucleusRadius, 50, 50);
    else
      shellGeo = new THREE.SphereGeometry(nucleusRadius + i * 20 + 20, 50, 50);
    shell = new THREE.Mesh(shellGeo, shellMat);
    shell.visible = options['shells'];
    scene.add(shell);
    shells.push(shell)
  }
  figure[shellsId] = createNode( shells, null );

  // Nucleus elements
  var nucleusElements = [];
  particlesGeo = new THREE.SphereGeometry(1, 20, 20);
  particlesGeo.dynamic = true;
  // Draw protons
  for(var i = 0; i < numProtons; i++)
    nucleusElements.push(drawNucleusParticle(protonColor));

  // Draw neutrons
  for(var i = 0; i < numNeutrons; i++)
    nucleusElements.push(drawNucleusParticle(neutronColor));
  figure[nucleusElementsId] = createNode( nucleusElements, shellsId );

  // Add electrons
  var electrons = [];
  var electron = null, plane = new THREE.Plane(), point = new THREE.Vector3();
  var electronGeo = new THREE.SphereBufferGeometry(5, 16, 16);
  for(var i = 0; i < numShells; ++i){
    var colorE;
    if (i == numShells - 1)
    colorE = valenciaColor;
    else
    colorE = electronColor[i];
    var electronMat = new THREE.MeshBasicMaterial({color: colorE});
    for (var j = 0; j < numElectrons[i]; ++j){
      electron = new THREE.Mesh(electronGeo, electronMat);
      electron.angle = new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize();
      electron.orbitSpeed = (0.05 - 0.005 * i)*(Math.round(Math.random())*2-1);
      plane.normal.copy(electron.angle);
      point.set(Math.random(), Math.random(), Math.random());
      plane.projectPoint(point, electron.position);
      electron.position.setLength(nucleusRadius + 20 + 20 * (i+1));
      electron.position.applyAxisAngle(electron.angle, Math.random() / 10);
      scene.add(electron);
      electrons.push(electron);
    }
  }
  figure[electronsId] = createNode( electrons, shellsId );

  // Generate nucleus without animation
  if (!options['nucleusAnimation'])
    nucleusGenerator();

  // Run Animation
  animate();
}

// Draw element
drawElement();

// Update electrons
function updateElectrons(){
  var obj = null;
  for(var i = 0; i < figure[electronsId].object_list.length; ++i){
    obj = figure[electronsId].object_list[i]
    obj.position.applyAxisAngle(obj.angle, obj.orbitSpeed);
  }
}

// Update nucleus
function updateNucleus(){
  var energy = 0;
  var deformation, repulsion;
  var counter = 1;
  particleRadius += 0.05;//(nucleusRadius - particleRadius)*0.1

  // Increase radius
  for(var i = 0; i < figure[nucleusElementsId].object_list.length; i++) {
    figure[nucleusElementsId].object_list[i].scale.set(particleRadius, particleRadius, particleRadius);
    particlesGeo.verticesNeedUpdate = true;
  }

  for(var i = 0; i < figure[nucleusElementsId].object_list.length; i++) {
    // Do random walk
    var randomWalk = getPoint(0.2);
    figure[nucleusElementsId].object_list[i].position.add(randomWalk);

    // Calculate deformation energy between spheres
    for(var j = 0; j < figure[nucleusElementsId].object_list.length; j++) {
      if(i === j) continue;
      deformation = Math.max(1/2*(2*particleRadius-figure[nucleusElementsId].object_list[i].position.distanceTo(figure[nucleusElementsId].object_list[j].position)), 0);
      repulsion = new THREE.Vector3().copy(figure[nucleusElementsId].object_list[i].position).sub(figure[nucleusElementsId].object_list[j].position).normalize().multiplyScalar(deformation);
      figure[nucleusElementsId].object_list[i].position.add(repulsion);
      figure[nucleusElementsId].object_list[j].position.sub(repulsion);
      energy += Math.pow(deformation, 2);
      if (deformation > 0)
      counter += 1;
    }

    // Calculate deformation on outer sphere
    deformation = Math.max(figure[nucleusElementsId].object_list[i].position.distanceTo(figure[shellsId].object_list[0].position) - nucleusRadius + particleRadius, 0);
    repulsion = new THREE.Vector3().copy(figure[nucleusElementsId].object_list[i].position).normalize().multiplyScalar(-deformation);
    figure[nucleusElementsId].object_list[i].position.add(repulsion);
    energy += Math.pow(deformation, 2);
    if (deformation > 0)
    counter += 1;
  }

  return energy/counter;
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

    // Start stats
    stats.begin();

    if (options['pause']){
      // Update nucleus
      if (def < 1){
        var newDef = updateNucleus();
        if (def == 0)
        def = 0.1;
        else
        def = newDef;
      }

      // Update electrons
      updateElectrons();
    }

    // End stats
    stats.end();

    // Render
    renderer.render(scene, camera);
  }
}
