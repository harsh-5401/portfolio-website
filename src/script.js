import * as THREE from 'three';
import * as dat from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';

import bgTexture1 from '/images/1.jpg';
import bgTexture2 from '/images/2.jpg';
import bgTexture3 from '/images/3.jpg';
import bgTexture4 from '/images/4.jpg';
import sunTexture from '/images/sun.jpg';
import mercuryTexture from '/images/mercurymap.jpg';
import mercuryBump from '/images/mercurybump.jpg';
import venusTexture from '/images/venusmap.jpg';
import venusBump from '/images/venusmap.jpg';
import venusAtmosphere from '/images/venus_atmosphere.jpg';
import earthTexture from '/images/earth_daymap.jpg';
import earthNightTexture from '/images/earth_nightmap.jpg';
import earthAtmosphere from '/images/earth_atmosphere.jpg';
import earthMoonTexture from '/images/moonmap.jpg';
import earthMoonBump from '/images/moonbump.jpg';
import marsTexture from '/images/marsmap.jpg';
import marsBump from '/images/marsbump.jpg';
import jupiterTexture from '/images/jupiter.jpg';
import ioTexture from '/images/jupiterIo.jpg';
import europaTexture from '/images/jupiterEuropa.jpg';
import ganymedeTexture from '/images/jupiterGanymede.jpg';
import callistoTexture from '/images/jupiterCallisto.jpg';
import saturnTexture from '/images/saturnmap.jpg';
import satRingTexture from '/images/saturn_ring.png';
import uranusTexture from '/images/uranus.jpg';
import uraRingTexture from '/images/uranus_ring.png';
import neptuneTexture from '/images/neptune.jpg';
import plutoTexture from '/images/plutomap.jpg';

// ******  SETUP  ******
console.log("Create the scene");
const scene = new THREE.Scene();

console.log("Create a perspective projection camera");
var camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.position.set(-175, 115, 5);

console.log("Create the renderer");
const renderer = new THREE.WebGL1Renderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.toneMapping = THREE.ACESFilmicToneMapping;

console.log("Create an orbit control");
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.75;
controls.screenSpacePanning = false;

console.log("Set up texture loader");
const cubeTextureLoader = new THREE.CubeTextureLoader();
const loadTexture = new THREE.TextureLoader();

// ******  POSTPROCESSING setup ******
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

// ******  OUTLINE PASS  ******
const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
outlinePass.edgeStrength = 3;
outlinePass.edgeGlow = 1;
outlinePass.visibleEdgeColor.set(0xffffff);
outlinePass.hiddenEdgeColor.set(0x190a05);
composer.addPass(outlinePass);

// ******  BLOOM PASS  ******
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1, 0.4, 0.85);
bloomPass.threshold = 1;
bloomPass.radius = 0.9;
composer.addPass(bloomPass);

// ****** AMBIENT LIGHT ******
console.log("Add the ambient light");
var lightAmbient = new THREE.AmbientLight(0x222222, 6); 
scene.add(lightAmbient);

// ******  Star background  ******
scene.background = cubeTextureLoader.load([

  bgTexture3,
  bgTexture1,
  bgTexture2,
  bgTexture2,
  bgTexture4,
  bgTexture2
]);

// ******  CONTROLS  ******
const gui = new dat.GUI({ autoPlace: false });
const customContainer = document.getElementById('gui-container');
customContainer.appendChild(gui.domElement);

// ****** SETTINGS FOR INTERACTIVE CONTROLS  ******
const settings = {
  accelerationOrbit: 4,
  acceleration: 3.5,
  sunIntensity: 2.0,
};

gui.add(settings, 'accelerationOrbit', 0, 10).onChange(value => {
});
gui.add(settings, 'acceleration', 0, 10).onChange(value => {
});
gui.add(settings, 'sunIntensity', 1, 10).onChange(value => {
  sunMat.emissiveIntensity = value;
});

// mouse movement
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseMove(event) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

// ******  SELECT PLANET  ******
let selectedPlanet = null;
let isMovingTowardsPlanet = false;
let targetCameraPosition = new THREE.Vector3();
let offset;

function onDocumentMouseDown(event) {
  event.preventDefault();

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  var intersects = raycaster.intersectObjects(raycastTargets);

  if (intersects.length > 0) {
    const clickedObject = intersects[0].object;
    selectedPlanet = identifyPlanet(clickedObject);
    if (selectedPlanet) {
      closeInfoNoZoomOut();
      
      settings.accelerationOrbit = 0; // Stop orbital movement

      // Update camera to look at the selected planet
      const planetPosition = new THREE.Vector3();
      selectedPlanet.planet.getWorldPosition(planetPosition);
      controls.target.copy(planetPosition);
      camera.lookAt(planetPosition); // Orient the camera towards the planet

      targetCameraPosition.copy(planetPosition).add(camera.position.clone().sub(planetPosition).normalize().multiplyScalar(offset));
      isMovingTowardsPlanet = true;
    }
  }
}

function identifyPlanet(clickedObject) {
  // Logic to identify which planet was clicked based on the clicked object, different offset for camera distance
        if (clickedObject.material === mercury.planet.material) {
          offset = 10;
          return mercury;
        } else if (clickedObject.material === venus.Atmosphere.material) {
          offset = 25;
          return venus;
        } else if (clickedObject.material === earth.Atmosphere.material) {
          offset = 25;
          return earth;
        } else if (clickedObject.material === mars.planet.material) {
          offset = 15;
          return mars;
        } else if (clickedObject.material === jupiter.planet.material) {
          offset = 50;
          return jupiter;
        } else if (clickedObject.material === saturn.planet.material) {
          offset = 50;
          return saturn;
        } else if (clickedObject.material === uranus.planet.material) {
          offset = 25;
          return uranus;
        } else if (clickedObject.material === neptune.planet.material) {
          offset = 20;
          return neptune;
        } else if (clickedObject.material === pluto.planet.material) {
          offset = 10;
          return pluto;
        } 

  return null;
}

// ******  SHOW PLANET INFO AFTER SELECTION  ******
function showPlanetInfo(planet) {
  var info = document.getElementById('planetInfo');
  var name = document.getElementById('planetName');
  var details = document.getElementById('planetDetails');

  name.innerText = planet;
  details.innerHTML = planetData[planet].info; // Use innerHTML to render HTML

  info.style.display = 'block';
}
let isZoomingOut = false;
let zoomOutTargetPosition = new THREE.Vector3(-175, 115, 5);
// close 'x' button function
function closeInfo() {
  var info = document.getElementById('planetInfo');
  info.style.display = 'none';
  settings.accelerationOrbit = 1;
  isZoomingOut = true;
  controls.target.set(0, 0, 0);
  
  // Clear active state in navigation
  const navItems = document.querySelectorAll('#planet-nav li');
  navItems.forEach(item => item.classList.remove('active'));
}
window.closeInfo = closeInfo;
// close info when clicking another planet
function closeInfoNoZoomOut() {
  var info = document.getElementById('planetInfo');
  info.style.display = 'none';
  settings.accelerationOrbit = 1;
}
// ******  SUN  ******
let sunMat;

const sunSize = 697/40; // 40 times smaller scale than earth
const sunGeom = new THREE.SphereGeometry(sunSize, 32, 20);
sunMat = new THREE.MeshStandardMaterial({
  emissive: 0xFFF88F,
  emissiveMap: loadTexture.load(sunTexture),
  emissiveIntensity: settings.sunIntensity
});
const sun = new THREE.Mesh(sunGeom, sunMat);
scene.add(sun);

//point light in the sun
const pointLight = new THREE.PointLight(0xFDFFD3 , 1200, 400, 1.4);
scene.add(pointLight);


// ******  PLANET CREATION FUNCTION  ******
function createPlanet(planetName, size, position, tilt, texture, bump, ring, atmosphere, moons){

  let material;
  if (texture instanceof THREE.Material){
    material = texture;
  } 
  else if(bump){
    material = new THREE.MeshPhongMaterial({
    map: loadTexture.load(texture),
    bumpMap: loadTexture.load(bump),
    bumpScale: 0.7
    });
  }
  else {
    material = new THREE.MeshPhongMaterial({
    map: loadTexture.load(texture)
    });
  } 

  const name = planetName;
  const geometry = new THREE.SphereGeometry(size, 32, 20);
  const planet = new THREE.Mesh(geometry, material);
  const planet3d = new THREE.Object3D;
  const planetSystem = new THREE.Group();
  planetSystem.add(planet);
  let Atmosphere;
  let Ring;
  planet.position.x = position;
  planet.rotation.z = tilt * Math.PI / 180;

  // add orbit path
  const orbitPath = new THREE.EllipseCurve(
    0, 0,            // ax, aY
    position, position, // xRadius, yRadius
    0, 2 * Math.PI,   // aStartAngle, aEndAngle
    false,            // aClockwise
    0                 // aRotation
);

  const pathPoints = orbitPath.getPoints(100);
  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
  const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.03 });
  const orbit = new THREE.LineLoop(orbitGeometry, orbitMaterial);
  orbit.rotation.x = Math.PI / 2;
  planetSystem.add(orbit);

  //add ring
  if(ring)
  {
    const RingGeo = new THREE.RingGeometry(ring.innerRadius, ring.outerRadius,30);
    const RingMat = new THREE.MeshStandardMaterial({
      map: loadTexture.load(ring.texture),
      side: THREE.DoubleSide
    });
    Ring = new THREE.Mesh(RingGeo, RingMat);
    planetSystem.add(Ring);
    Ring.position.x = position;
    Ring.rotation.x = -0.5 *Math.PI;
    Ring.rotation.y = -tilt * Math.PI / 180;
  }
  
  //add atmosphere
  if(atmosphere){
    const atmosphereGeom = new THREE.SphereGeometry(size+0.1, 32, 20);
    const atmosphereMaterial = new THREE.MeshPhongMaterial({
      map:loadTexture.load(atmosphere),
      transparent: true,
      opacity: 0.4,
      depthTest: true,
      depthWrite: false
    })
    Atmosphere = new THREE.Mesh(atmosphereGeom, atmosphereMaterial)
    
    Atmosphere.rotation.z = 0.41;
    planet.add(Atmosphere);
  }

  //add moons
  if(moons){
    moons.forEach(moon => {
      let moonMaterial;
      
      if(moon.bump){
        moonMaterial = new THREE.MeshStandardMaterial({
          map: loadTexture.load(moon.texture),
          bumpMap: loadTexture.load(moon.bump),
          bumpScale: 0.5
        });
      } else{
        moonMaterial = new THREE.MeshStandardMaterial({
          map: loadTexture.load(moon.texture)
        });
      }
      const moonGeometry = new THREE.SphereGeometry(moon.size, 32, 20);
      const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
      const moonOrbitDistance = size * 1.5;
      moonMesh.position.set(moonOrbitDistance, 0, 0);
      planetSystem.add(moonMesh);
      moon.mesh = moonMesh;
    });
  }
  //add planet system to planet3d object and to the scene
  planet3d.add(planetSystem);
  scene.add(planet3d);
  return {name, planet, planet3d, Atmosphere, moons, planetSystem, Ring};
}


// ******  LOADING OBJECTS METHOD  ******
function loadObject(path, position, scale, callback) {
  const loader = new GLTFLoader();

  loader.load(path, function (gltf) {
      const obj = gltf.scene;
      obj.position.set(position, 0, 0);
      obj.scale.set(scale, scale, scale);
      scene.add(obj);
      if (callback) {
        callback(obj);
      }
  }, undefined, function (error) {
      console.error('An error happened', error);
  });
}

// ******  ASTEROIDS  ******
const asteroids = [];
function loadAsteroids(path, numberOfAsteroids, minOrbitRadius, maxOrbitRadius) {
  const loader = new GLTFLoader();
  loader.load(path, function (gltf) {
      gltf.scene.traverse(function (child) {
          if (child.isMesh) {
              for (let i = 0; i < numberOfAsteroids / 12; i++) { // Divide by 12 because there are 12 asteroids in the pack
                  const asteroid = child.clone();
                  const orbitRadius = THREE.MathUtils.randFloat(minOrbitRadius, maxOrbitRadius);
                  const angle = Math.random() * Math.PI * 2;
                  const x = orbitRadius * Math.cos(angle);
                  const y = 0;
                  const z = orbitRadius * Math.sin(angle);
                  child.receiveShadow = true;
                  asteroid.position.set(x, y, z);
                  asteroid.scale.setScalar(THREE.MathUtils.randFloat(0.8, 1.2));
                  scene.add(asteroid);
                  asteroids.push(asteroid);
              }
          }
      });
  }, undefined, function (error) {
      console.error('An error happened', error);
  });
}


// Earth day/night effect shader material
const earthMaterial = new THREE.ShaderMaterial({
  uniforms: {
    dayTexture: { type: "t", value: loadTexture.load(earthTexture) },
    nightTexture: { type: "t", value: loadTexture.load(earthNightTexture) },
    sunPosition: { type: "v3", value: sun.position }
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec3 vSunDirection;

    uniform vec3 sunPosition;

    void main() {
      vUv = uv;
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vNormal = normalize(modelMatrix * vec4(normal, 0.0)).xyz;
      vSunDirection = normalize(sunPosition - worldPosition.xyz);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D dayTexture;
    uniform sampler2D nightTexture;

    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec3 vSunDirection;

    void main() {
      float intensity = max(dot(vNormal, vSunDirection), 0.0);
      vec4 dayColor = texture2D(dayTexture, vUv);
      vec4 nightColor = texture2D(nightTexture, vUv)* 0.2;
      gl_FragColor = mix(nightColor, dayColor, intensity);
    }
  `
});


// ******  MOONS  ******
// Earth
const earthMoon = [{
  size: 1.6,
  texture: earthMoonTexture,
  bump: earthMoonBump,
  orbitSpeed: 0.001 * settings.accelerationOrbit,
  orbitRadius: 10
}]

// Mars' moons with path to 3D models (phobos & deimos)
const marsMoons = [
  {
    modelPath: '/images/mars/phobos.glb',
    scale: 0.1,
    orbitRadius: 5,
    orbitSpeed: 0.002 * settings.accelerationOrbit,
    position: 100,
    mesh: null
  },
  {
    modelPath: '/images/mars/deimos.glb',
    scale: 0.1,
    orbitRadius: 9,
    orbitSpeed: 0.0005 * settings.accelerationOrbit,
    position: 120,
    mesh: null
  }
];

// Jupiter
const jupiterMoons = [
  {
    size: 1.6,
    texture: ioTexture,
    orbitRadius: 20,
    orbitSpeed: 0.0005 * settings.accelerationOrbit
  },
  {
    size: 1.4,
    texture: europaTexture,
    orbitRadius: 24,
    orbitSpeed: 0.00025 * settings.accelerationOrbit
  },
  {
    size: 2,
    texture: ganymedeTexture,
    orbitRadius: 28,
    orbitSpeed: 0.000125 * settings.accelerationOrbit
  },
  {
    size: 1.7,
    texture: callistoTexture,
    orbitRadius: 32,
    orbitSpeed: 0.00006 * settings.accelerationOrbit
  }
];

// ******  PLANET CREATIONS  ******
const mercury = new createPlanet('About Me', 2.4, 40, 0, mercuryTexture, mercuryBump);
const venus = new createPlanet('Education', 6.1, 65, 3, venusTexture, venusBump, null, venusAtmosphere);
const earth = new createPlanet('Skills', 6.4, 90, 23, earthMaterial, null, null, earthAtmosphere, earthMoon);
const mars = new createPlanet('Experience', 3.4, 115, 25, marsTexture, marsBump)
// Load Mars moons
marsMoons.forEach(moon => {
  loadObject(moon.modelPath, moon.position, moon.scale, function(loadedModel) {
    moon.mesh = loadedModel;
    mars.planetSystem.add(moon.mesh);
    moon.mesh.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  });
});

const jupiter = new createPlanet('Projects', 69/4, 200, 3, jupiterTexture, null, null, null, jupiterMoons);
const saturn = new createPlanet('Services', 58/4, 270, 26, saturnTexture, null, {
  innerRadius: 18, 
  outerRadius: 29, 
  texture: satRingTexture
});
const uranus = new createPlanet('Testimonials', 25/4, 320, 82, uranusTexture, null, {
  innerRadius: 6, 
  outerRadius: 8, 
  texture: uraRingTexture
});
const neptune = new createPlanet('Interests', 24/4, 340, 28, neptuneTexture);
const pluto = new createPlanet('Contact', 1, 350, 57, plutoTexture)

  // ******  PLANETS DATA  ******
  const planetData = {
    'About Me': {
        radius: 'Closest to the Sun',
        tilt: 'First Step',
        rotation: 'Quick Learner',
        orbit: 'Foundation',
        distance: 'Starting Point',
        moons: 'Core Skills',
        info: 'About Me: I am a passionate developer with a strong foundation in computer science and a love for creating interactive experiences. My journey in tech started with a curiosity about how things work, which led me to pursue a career in software development.'
    },
    'Education': {
        radius: 'Second Planet',
        tilt: 'Education',
        rotation: 'Academic Background',
        orbit: 'Learning Path',
        distance: 'Knowledge Base',
        moons: 'Degrees & Certifications',
        info: 'Education: Bachelor\'s in Computer Science with a focus on interactive media. Additional certifications in web development, UI/UX design, and cloud computing. Constantly learning through online courses and hands-on projects to stay current with industry trends.'
    },
    'Skills': {
        radius: 'Third Planet',
        tilt: 'Skills',
        rotation: 'Technical Abilities',
        orbit: 'Expertise Areas',
        distance: 'Competency Level',
        moons: 'Tools & Technologies',
        info: '<div><strong>Technical Skills:</strong><br><br>Frontend: HTML5, CSS3, JavaScript, React, Vue.js<br><div class="skill-bar"><div class="skill-level" style="width: 90%"></div></div>Backend: Node.js, Express, Python, Django<br><div class="skill-bar"><div class="skill-level" style="width: 85%"></div></div>Database: MongoDB, PostgreSQL, Firebase<br><div class="skill-bar"><div class="skill-level" style="width: 80%"></div></div>Other: Git, Docker, AWS, Three.js<br><div class="skill-bar"><div class="skill-level" style="width: 75%"></div></div></div>'
    },
    'Experience': {
        radius: 'Fourth Planet',
        tilt: 'Experience',
        rotation: 'Work History',
        orbit: 'Career Path',
        distance: 'Professional Journey',
        moons: 'Roles & Positions',
        info: '<strong>Professional Experience:</strong><br><br>Senior Developer at Tech Innovations (2020-Present)<br>- Led development of interactive web applications<br>- Implemented 3D visualizations using Three.js<br>- Improved site performance by 40%<br><br>Web Developer at Digital Solutions (2018-2020)<br>- Built responsive websites for various clients<br>- Developed custom CMS solutions<br>- Collaborated with design team on UI/UX improvements'
    },
    'Projects': {
        radius: 'Largest Planet',
        tilt: 'Projects',
        rotation: 'Portfolio Work',
        orbit: 'Showcases',
        distance: 'Achievements',
        moons: 'Notable Works',
        info: '<strong>Featured Projects:</strong><br><br><div class="project-item"><span class="project-title">3D Interactive Portfolio</span><br>A space-themed portfolio using Three.js with interactive elements and custom shaders.</div><div class="project-item"><span class="project-title">E-Commerce Platform</span><br>Full-stack online store with payment processing, inventory management, and analytics dashboard.</div><div class="project-item"><span class="project-title">Weather Visualization App</span><br>Real-time weather data visualization with interactive maps and forecasting.</div>'
    },
    'Services': {
        radius: 'Ringed Planet',
        tilt: 'Services',
        rotation: 'Offerings',
        orbit: 'Solutions',
        distance: 'Capabilities',
        moons: 'Expertise Areas',
        info: '<strong>Services I Offer:</strong><br><br>- Custom Web Application Development<br>- Interactive 3D Visualizations<br>- Frontend UI/UX Implementation<br>- Full-Stack Development<br>- Performance Optimization<br>- Responsive Design<br>- API Integration<br>- Technical Consultation'
    },
    'Testimonials': {
        radius: 'Tilted Planet',
        tilt: 'Testimonials',
        rotation: 'Client Feedback',
        orbit: 'Reviews',
        distance: 'Endorsements',
        moons: 'Success Stories',
        info: '<strong>What People Say:</strong><br><br>"Working with this developer was an exceptional experience. Their technical expertise and creative problem-solving transformed our project." - Tech Startup CEO<br><br>"Delivered beyond expectations with attention to detail and innovative solutions." - Marketing Director<br><br>"Reliable, communicative, and highly skilled. Would definitely work with again." - Project Manager'
    },
    'Interests': {
        radius: 'Blue Planet',
        tilt: 'Interests',
        rotation: 'Hobbies',
        orbit: 'Passions',
        distance: 'Personal Side',
        moons: 'After Hours',
        info: '<strong>Beyond Coding:</strong><br><br>When not immersed in code, I enjoy astronomy and space exploration, which inspired this portfolio design. I\'m also passionate about photography, hiking, and playing guitar. I believe these diverse interests enhance my creativity and problem-solving approach in development work.'
    },
    'Contact': {
        radius: 'Dwarf Planet',
        tilt: 'Contact',
        rotation: 'Get in Touch',
        orbit: 'Connect',
        distance: 'Reach Out',
        moons: 'Communication',
        info: '<strong>Let\'s Connect:</strong><br><br><a href="mailto:your.email@example.com" class="contact-link">📧 your.email@example.com</a><a href="https://linkedin.com/in/yourprofile" class="contact-link">🔗 LinkedIn: /in/yourprofile</a><a href="https://github.com/yourusername" class="contact-link">💻 GitHub: @yourusername</a><a href="https://twitter.com/yourhandle" class="contact-link">🐦 Twitter: @yourhandle</a><br><br>I\'m currently <span style="color: #5cff5c;">available</span> for freelance work and exciting collaborations. Feel free to reach out if you have an interesting project in mind or just want to chat about web development, 3D graphics, or space!'
    }
};


// Array of planets and atmospheres for raycasting
const raycastTargets = [
  mercury.planet, venus.planet, venus.Atmosphere, earth.planet, earth.Atmosphere, 
  mars.planet, jupiter.planet, saturn.planet, uranus.planet, neptune.planet, pluto.planet
];

// ******  SHADOWS  ******
renderer.shadowMap.enabled = true;
pointLight.castShadow = true;

//properties for the point light
pointLight.shadow.mapSize.width = 1024;
pointLight.shadow.mapSize.height = 1024;
pointLight.shadow.camera.near = 10;
pointLight.shadow.camera.far = 20;

//casting and receiving shadows
earth.planet.castShadow = true;
earth.planet.receiveShadow = true;
earth.Atmosphere.castShadow = true;
earth.Atmosphere.receiveShadow = true;
earth.moons.forEach(moon => {
moon.mesh.castShadow = true;
moon.mesh.receiveShadow = true;
});
mercury.planet.castShadow = true;
mercury.planet.receiveShadow = true;
venus.planet.castShadow = true;
venus.planet.receiveShadow = true;
venus.Atmosphere.receiveShadow = true;
mars.planet.castShadow = true;
mars.planet.receiveShadow = true;
jupiter.planet.castShadow = true;
jupiter.planet.receiveShadow = true;
jupiter.moons.forEach(moon => {
  moon.mesh.castShadow = true;
  moon.mesh.receiveShadow = true;
  });
saturn.planet.castShadow = true;
saturn.planet.receiveShadow = true;
saturn.Ring.receiveShadow = true;
uranus.planet.receiveShadow = true;
neptune.planet.receiveShadow = true;
pluto.planet.receiveShadow = true;




// ******  PLANET NAVIGATION PANEL  ******
function setupPlanetNavigation() {
  const navItems = document.querySelectorAll('#planet-nav li');
  const highlightedPlanet = { current: null };

  navItems.forEach(item => {
    // Hover effect
    item.addEventListener('mouseenter', function() {
      const planetName = this.getAttribute('data-planet');
      highlightPlanet(planetName, true);
      highlightedPlanet.current = planetName;
    });

    item.addEventListener('mouseleave', function() {
      if (highlightedPlanet.current) {
        highlightPlanet(highlightedPlanet.current, false);
        highlightedPlanet.current = null;
      }
    });

    // Click navigation
    item.addEventListener('click', function() {
      const planetName = this.getAttribute('data-planet');
      navigateToPlanet(planetName);
      
      // Update active state in navigation
      navItems.forEach(navItem => navItem.classList.remove('active'));
      this.classList.add('active');
    });
  });
}

function highlightPlanet(planetName, highlight) {
  let targetPlanet;
  
  // Find the planet object by name
  switch(planetName) {
    case 'About Me': targetPlanet = mercury; break;
    case 'Education': targetPlanet = venus; break;
    case 'Skills': targetPlanet = earth; break;
    case 'Experience': targetPlanet = mars; break;
    case 'Projects': targetPlanet = jupiter; break;
    case 'Services': targetPlanet = saturn; break;
    case 'Testimonials': targetPlanet = uranus; break;
    case 'Interests': targetPlanet = neptune; break;
    case 'Contact': targetPlanet = pluto; break;
  }

  if (targetPlanet) {
    if (highlight) {
      // Add to outline pass to highlight
      if (targetPlanet.Atmosphere) {
        outlinePass.selectedObjects = [targetPlanet.planet, targetPlanet.Atmosphere];
      } else {
        outlinePass.selectedObjects = [targetPlanet.planet];
      }
    } else {
      // Remove highlight
      outlinePass.selectedObjects = [];
    }
  }
}

function navigateToPlanet(planetName) {
  let targetPlanet;
  
  // Find the planet object by name
  switch(planetName) {
    case 'About Me': targetPlanet = mercury; break;
    case 'Education': targetPlanet = venus; break;
    case 'Skills': targetPlanet = earth; break;
    case 'Experience': targetPlanet = mars; break;
    case 'Projects': targetPlanet = jupiter; break;
    case 'Services': targetPlanet = saturn; break;
    case 'Testimonials': targetPlanet = uranus; break;
    case 'Interests': targetPlanet = neptune; break;
    case 'Contact': targetPlanet = pluto; break;
  }

  if (targetPlanet) {
    selectedPlanet = targetPlanet;
    closeInfoNoZoomOut();
    
    settings.accelerationOrbit = 0; // Stop orbital movement

    // Determine appropriate offset based on planet size
    if (targetPlanet === jupiter || targetPlanet === saturn) {
      offset = 50;
    } else if (targetPlanet === venus || targetPlanet === earth || targetPlanet === uranus) {
      offset = 25;
    } else if (targetPlanet === mars || targetPlanet === neptune) {
      offset = 15;
    } else {
      offset = 10;
    }

    // Update camera to look at the selected planet
    const planetPosition = new THREE.Vector3();
    targetPlanet.planet.getWorldPosition(planetPosition);
    controls.target.copy(planetPosition);
    camera.lookAt(planetPosition);

    targetCameraPosition.copy(planetPosition).add(camera.position.clone().sub(planetPosition).normalize().multiplyScalar(offset));
    isMovingTowardsPlanet = true;
  }
}

// ****** OUTLINES ON PLANETS ******
// Modified outline handling in the animate function
function animate(){
  //rotating planets around the sun and itself
  sun.rotateY(0.001 * settings.acceleration);
  mercury.planet.rotateY(0.001 * settings.acceleration);
  mercury.planet3d.rotateY(0.004 * settings.accelerationOrbit);
  venus.planet.rotateY(0.0005 * settings.acceleration)
  venus.Atmosphere.rotateY(0.0005 * settings.acceleration);
  venus.planet3d.rotateY(0.0006 * settings.accelerationOrbit);
  earth.planet.rotateY(0.005 * settings.acceleration);
  earth.Atmosphere.rotateY(0.001 * settings.acceleration);
  earth.planet3d.rotateY(0.001 * settings.accelerationOrbit);
  mars.planet.rotateY(0.01 * settings.acceleration);
  mars.planet3d.rotateY(0.0007 * settings.accelerationOrbit);
  jupiter.planet.rotateY(0.005 * settings.acceleration);
  jupiter.planet3d.rotateY(0.0003 * settings.accelerationOrbit);
  saturn.planet.rotateY(0.01 * settings.acceleration);
  saturn.planet3d.rotateY(0.0002 * settings.accelerationOrbit);
  uranus.planet.rotateY(0.005 * settings.acceleration);
  uranus.planet3d.rotateY(0.0001 * settings.accelerationOrbit);
  neptune.planet.rotateY(0.005 * settings.acceleration);
  neptune.planet3d.rotateY(0.00008 * settings.accelerationOrbit);
  pluto.planet.rotateY(0.001 * settings.acceleration)
  pluto.planet3d.rotateY(0.00006 * settings.accelerationOrbit)

  // Animate moons and other elements
  // Animate Earth's moon
if (earth.moons) {
  earth.moons.forEach(moon => {
    const time = performance.now();
    const tiltAngle = 5 * Math.PI / 180;

    const moonX = earth.planet.position.x + moon.orbitRadius * Math.cos(time * moon.orbitSpeed);
    const moonY = moon.orbitRadius * Math.sin(time * moon.orbitSpeed) * Math.sin(tiltAngle);
    const moonZ = earth.planet.position.z + moon.orbitRadius * Math.sin(time * moon.orbitSpeed) * Math.cos(tiltAngle);

    moon.mesh.position.set(moonX, moonY, moonZ);
    moon.mesh.rotateY(0.01);
  });
}
// Animate Mars' moons
if (marsMoons){
marsMoons.forEach(moon => {
  if (moon.mesh) {
    const time = performance.now();

    const moonX = mars.planet.position.x + moon.orbitRadius * Math.cos(time * moon.orbitSpeed);
    const moonY = moon.orbitRadius * Math.sin(time * moon.orbitSpeed);
    const moonZ = mars.planet.position.z + moon.orbitRadius * Math.sin(time * moon.orbitSpeed);

    moon.mesh.position.set(moonX, moonY, moonZ);
    moon.mesh.rotateY(0.001);
  }
});
}

// Animate Jupiter's moons
if (jupiter.moons) {
  jupiter.moons.forEach(moon => {
    const time = performance.now();
    const moonX = jupiter.planet.position.x + moon.orbitRadius * Math.cos(time * moon.orbitSpeed);
    const moonY = moon.orbitRadius * Math.sin(time * moon.orbitSpeed);
    const moonZ = jupiter.planet.position.z + moon.orbitRadius * Math.sin(time * moon.orbitSpeed);

    moon.mesh.position.set(moonX, moonY, moonZ);
    moon.mesh.rotateY(0.01);
  });
}

// Rotate asteroids
asteroids.forEach(asteroid => {
  asteroid.rotation.y += 0.0001;
  asteroid.position.x = asteroid.position.x * Math.cos(0.0001 * settings.accelerationOrbit) + asteroid.position.z * Math.sin(0.0001 * settings.accelerationOrbit);
  asteroid.position.z = asteroid.position.z * Math.cos(0.0001 * settings.accelerationOrbit) - asteroid.position.x * Math.sin(0.0001 * settings.accelerationOrbit);
});

// Handle planet highlighting
// Only check for mouse hover if no menu item is currently highlighting a planet
let isNavigationHighlighting = document.querySelector('#planet-nav li:hover') !== null;
  
if (!isNavigationHighlighting) {
  raycaster.setFromCamera(mouse, camera);
  var intersects = raycaster.intersectObjects(raycastTargets);
  
  // Reset outlines if no navigation highlighting is active
  outlinePass.selectedObjects = [];
  
  if (intersects.length > 0) {
    const intersectedObject = intersects[0].object;
    
    if (intersectedObject === earth.Atmosphere) {
      outlinePass.selectedObjects = [earth.planet];
    } else if (intersectedObject === venus.Atmosphere) {
      outlinePass.selectedObjects = [venus.planet];
    } else {
      outlinePass.selectedObjects = [intersectedObject];
    }
  }
}

  // ******  ZOOM IN/OUT  ******
  if (isMovingTowardsPlanet) {
    // Smoothly move the camera towards the target position
    camera.position.lerp(targetCameraPosition, 0.03);

    // Check if the camera is close to the target position
    if (camera.position.distanceTo(targetCameraPosition) < 1) {
        isMovingTowardsPlanet = false;
        showPlanetInfo(selectedPlanet.name);
        
        // Update active state in navigation
        const navItems = document.querySelectorAll('#planet-nav li');
        navItems.forEach(item => {
          if (item.getAttribute('data-planet') === selectedPlanet.name) {
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });
    }
  } else if (isZoomingOut) {
    camera.position.lerp(zoomOutTargetPosition, 0.05);

    if (camera.position.distanceTo(zoomOutTargetPosition) < 1) {
        isZoomingOut = false;
        
        // Clear active state in navigation when zooming out
        const navItems = document.querySelectorAll('#planet-nav li');
        navItems.forEach(item => item.classList.remove('active'));
    }
  }

  controls.update();
  requestAnimationFrame(animate);
  composer.render();
}
loadAsteroids('/asteroids/asteroidPack.glb', 1000, 130, 160);
loadAsteroids('/asteroids/asteroidPack.glb', 3000, 352, 370);
setupPlanetNavigation(); // Add this line
animate();

window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('mousedown', onDocumentMouseDown, false);
window.addEventListener('resize', function(){
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
  composer.setSize(window.innerWidth,window.innerHeight);
});
