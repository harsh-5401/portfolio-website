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
        info: '<strong>🚀 Tech Innovator & Team Leader</strong><br><br>I\'m a <span style="color:#4CAF50;font-weight:bold;">Full Stack Developer</span> currently spearheading technology initiatives at <span style="color:#2196F3;font-weight:bold;">Wisit Digital</span>, where we\'re revolutionizing AI-powered hiring solutions. I thrive on solving complex problems through first-principle thinking and have a proven track record of delivering high-impact solutions.<br><br>With expertise in <span style="color:#FF9800;font-weight:bold;">JavaScript, React, Node.js, MongoDB, and AWS</span>, I\'ve successfully led cross-functional teams across Frontend, Backend, Machine Learning, and DevOps domains. My approach combines technical excellence with strategic vision to build scalable products that make a meaningful difference.<br><br><div style="text-align:center;"><a href="/resume.pdf" download class="resume-button"><span style="margin-right:5px;">📄</span>Download My Resume</a></div>'
    },
    'Education': {
        radius: 'Second Planet',
        tilt: 'Education',
        rotation: 'Academic Background',
        orbit: 'Learning Path',
        distance: 'Knowledge Base',
        moons: 'Degrees & Certifications',
        info: '<strong>🎓 Academic Excellence</strong><br><br><span style="color:#2196F3;font-weight:bold;">Bachelor of Technology</span> in Electronics and Communication Engineering<br><span style="color:#FF9800;font-weight:bold;">Indian Institute of Information Technology, Kalyani</span> (2022 - Present)<br><span style="color:#4CAF50;font-weight:bold;">CGPA: 8.5/10.0</span><br><br>Beyond formal education, I\'m a self-driven learner constantly exploring emerging technologies through hands-on projects, technical workshops, and online resources. This proactive approach to learning has enabled me to stay at the cutting edge of tech innovation and quickly adapt to new frameworks and tools.'
    },
    'Skills': {
        radius: 'Third Planet',
        tilt: 'Skills',
        rotation: 'Technical Abilities',
        orbit: 'Expertise Areas',
        distance: 'Competency Level',
        moons: 'Tools & Technologies',
        info: '<div><strong>Technical Skills:</strong><br><br>Languages: C/C++ (Data Structures & Algorithms), Python, JavaScript (ES6+), TypeScript, Dart<br><div class="skill-bar"><div class="skill-level" style="width: 90%"></div></div>Frontend: React.js, Redux, HTML5, CSS3, TailwindCSS, Flutter<br><div class="skill-bar"><div class="skill-level" style="width: 95%"></div></div>Backend & Databases: Node.js, Express.js, RESTful APIs, MongoDB, Firebase, SQL, Redis<br><div class="skill-bar"><div class="skill-level" style="width: 90%"></div></div>Developer Tools: Git, GitHub, VS Code, Postman, Docker, CI/CD, AWS, Jira<br><div class="skill-bar"><div class="skill-level" style="width: 85%"></div></div>Libraries: WebSockets, Pandas, NumPy, scikit-learn, Axios, Mongoose, Jest, React Testing Library<br><div class="skill-bar"><div class="skill-level" style="width: 80%"></div></div></div>'
    },
    'Experience': {
        radius: 'Fourth Planet',
        tilt: 'Experience',
        rotation: 'Work History',
        orbit: 'Career Path',
        distance: 'Professional Journey',
        moons: 'Roles & Positions',
        info: '<strong>💼 Professional Experience</strong><br><br><span style="color:#2196F3;font-weight:bold;">Software Developer Intern</span> | Wisit Digital Innovation (March 2025-Present)<br>• <span style="color:#4CAF50;">Engineered</span> a React.js-based SaaS trading dashboard with Zerodha Kite WebSocket integration<br>• <span style="color:#4CAF50;">Optimized</span> real-time data streaming for 100+ instruments achieving <span style="color:#FF9800;font-weight:bold;"><200ms latency</span><br>• <span style="color:#4CAF50;">Implemented</span> advanced React performance techniques (useRef, memoization, virtualization)<br>• <span style="color:#4CAF50;">Delivered</span> <span style="color:#FF9800;font-weight:bold;">60% reduction</span> in rendering time and <span style="color:#FF9800;font-weight:bold;">40% decrease</span> in order failures<br><br><span style="color:#2196F3;font-weight:bold;">Technical Lead</span> | Status Code 0, MLH Affiliated Hackathon (Jan 2023-Mar 2023)<br>• <span style="color:#4CAF50;">Led</span> cross-functional team of 12 members for event with <span style="color:#FF9800;font-weight:bold;">250+ participants</span><br>• <span style="color:#4CAF50;">Architected</span> high-performance registration system handling <span style="color:#FF9800;font-weight:bold;">3500+ applications</span> with <span style="color:#FF9800;font-weight:bold;">99.9% uptime</span><br>• <span style="color:#4CAF50;">Secured</span> <span style="color:#FF9800;font-weight:bold;">$5000+</span> in sponsorships, increasing event budget by <span style="color:#FF9800;font-weight:bold;">70%</span>'
    },
    'Projects': {
        radius: 'Largest Planet',
        tilt: 'Projects',
        rotation: 'Portfolio Work',
        orbit: 'Showcases',
        distance: 'Achievements',
        moons: 'Notable Works',
        info: '<strong>🏆 Featured Projects</strong><br><br><div class="project-item" style="margin-bottom:20px;padding:15px;border-left:4px solid #2196F3;background:rgba(33,150,243,0.1);"><span class="project-title" style="color:#2196F3;font-weight:bold;font-size:1.2em;">E-Learning Platform (StudyNotion)</span><br><span style="color:#FF9800;font-weight:bold;">Tech Stack:</span> React.js, Node.js, Express.js, MongoDB<br><br>• Complete MERN stack platform supporting <span style="color:#4CAF50;font-weight:bold;">1000+ concurrent users</span><br>• Implemented secure JWT authentication with <span style="color:#4CAF50;font-weight:bold;">100% protection</span> against common vulnerabilities<br>• Integrated Razorpay payment gateway with <span style="color:#4CAF50;font-weight:bold;">1.2s average checkout time</span><br>• Achieved <span style="color:#4CAF50;font-weight:bold;">95+ Lighthouse score</span> and <span style="color:#4CAF50;font-weight:bold;">65% faster</span> media loading times<br><a href="https://github.com/harsh-5401/Megaproject-frontent-backend-Public" target="_blank" style="display:inline-block;margin-top:10px;background:#2196F3;color:white;padding:5px 10px;border-radius:3px;text-decoration:none;">View on GitHub</a></div><div class="project-item" style="margin-bottom:20px;padding:15px;border-left:4px solid #4CAF50;background:rgba(76,175,80,0.1);"><span class="project-title" style="color:#4CAF50;font-weight:bold;font-size:1.2em;">ANIBUD - Wildlife Conservation App</span><br><span style="color:#FF9800;font-weight:bold;">Tech Stack:</span> Flutter, Firebase, Google Maps API, TensorFlow Lite<br><br>• Cross-platform mobile app with offline-capable location tracking (<span style="color:#4CAF50;font-weight:bold;"><5% data loss</span>)<br>• Custom image recognition system with <span style="color:#4CAF50;font-weight:bold;">85% match accuracy</span><br>• Optimized for <span style="color:#4CAF50;font-weight:bold;">100+ simultaneous reports</span> with <span style="color:#4CAF50;font-weight:bold;"><2s response time</span><br>• <span style="color:#FF9800;font-weight:bold;">🏅 Won 1st place</span> among 50+ teams at MLH StatusCode0 Hackathon<br><a href="https://github.com/harsh-5401/Anibud" target="_blank" style="display:inline-block;margin-top:10px;background:#4CAF50;color:white;padding:5px 10px;border-radius:3px;text-decoration:none;">View on GitHub</a></div><div class="project-item" style="padding:15px;border-left:4px solid #FF9800;background:rgba(255,152,0,0.1);"><span class="project-title" style="color:#FF9800;font-weight:bold;font-size:1.2em;">3D Interactive Space Portfolio</span><br><span style="color:#FF9800;font-weight:bold;">Tech Stack:</span> Three.js, JavaScript, HTML5/CSS3<br><br>• Immersive 3D space-themed portfolio with interactive planetary navigation<br>• Custom shader implementation for realistic planet rendering and atmospheric effects<br>• Responsive design with keyboard, mouse, and touch controls for seamless exploration</div>'
    },
    'Services': {
        radius: 'Ringed Planet',
        tilt: 'Services',
        rotation: 'Offerings',
        orbit: 'Solutions',
        distance: 'Capabilities',
        moons: 'Expertise Areas',
        info: '<strong>🛠️ Specialized Services</strong><br><br><div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:15px;">' + 
        '<div style="flex:1;min-width:45%;background:rgba(33,150,243,0.1);padding:12px;border-radius:5px;border-left:3px solid #2196F3;margin-bottom:10px;"><span style="color:#2196F3;font-weight:bold;">Full-Stack Development</span><br>Complete solutions with React.js, Node.js, and MongoDB</div>' + 
        '<div style="flex:1;min-width:45%;background:rgba(76,175,80,0.1);padding:12px;border-radius:5px;border-left:3px solid #4CAF50;margin-bottom:10px;"><span style="color:#4CAF50;font-weight:bold;">Frontend Excellence</span><br>Responsive UI/UX with React and TailwindCSS</div>' + 
        '<div style="flex:1;min-width:45%;background:rgba(255,152,0,0.1);padding:12px;border-radius:5px;border-left:3px solid #FF9800;margin-bottom:10px;"><span style="color:#FF9800;font-weight:bold;">Mobile Development</span><br>Cross-platform apps with Flutter and Firebase</div>' + 
        '<div style="flex:1;min-width:45%;background:rgba(156,39,176,0.1);padding:12px;border-radius:5px;border-left:3px solid #9C27B0;margin-bottom:10px;"><span style="color:#9C27B0;font-weight:bold;">Real-time Solutions</span><br>WebSocket implementation for live applications</div>' + 
        '<div style="flex:1;min-width:45%;background:rgba(244,67,54,0.1);padding:12px;border-radius:5px;border-left:3px solid #F44336;margin-bottom:10px;"><span style="color:#F44336;font-weight:bold;">API Development</span><br>RESTful services and third-party integrations</div>' + 
        '<div style="flex:1;min-width:45%;background:rgba(0,150,136,0.1);padding:12px;border-radius:5px;border-left:3px solid #009688;margin-bottom:10px;"><span style="color:#009688;font-weight:bold;">Performance Optimization</span><br>Speed enhancements and code efficiency</div>' + 
        '<div style="flex:1;min-width:45%;background:rgba(63,81,181,0.1);padding:12px;border-radius:5px;border-left:3px solid #3F51B5;margin-bottom:10px;"><span style="color:#3F51B5;font-weight:bold;">Technical Leadership</span><br>Team guidance and project management</div>' + 
        '<div style="flex:1;min-width:45%;background:rgba(121,85,72,0.1);padding:12px;border-radius:5px;border-left:3px solid #795548;margin-bottom:10px;"><span style="color:#795548;font-weight:bold;">Database Architecture</span><br>Schema design and query optimization</div>' + 
        '</div>'
    },
    'Testimonials': {
        radius: 'Tilted Planet',
        tilt: 'Testimonials',
        rotation: 'Client Feedback',
        orbit: 'Reviews',
        distance: 'Endorsements',
        moons: 'Success Stories',
        info: '<strong>🏅 Leadership & Achievements</strong><br><br><div style="background:rgba(33,150,243,0.1);padding:15px;border-radius:5px;margin-bottom:15px;border-left:4px solid #2196F3;"><span style="color:#2196F3;font-weight:bold;font-size:1.1em;">Peer Mentor - Programming Club</span> (2023-2024)<br><br>Led <span style="color:#FF9800;font-weight:bold;">10+ technical workshops</span> on web development, training <span style="color:#4CAF50;font-weight:bold;">60+ students</span> and creating comprehensive learning materials. Workshops covered React.js, Node.js, and full-stack development principles, with consistently positive participant feedback.</div><div style="background:rgba(76,175,80,0.1);padding:15px;border-radius:5px;margin-bottom:15px;border-left:4px solid #4CAF50;"><span style="color:#4CAF50;font-weight:bold;font-size:1.1em;">Codathon Finalist</span> (2022)<br><br>Ranked in the <span style="color:#FF9800;font-weight:bold;">top 5%</span> among 200 participants in algorithmic programming contest. Successfully solved <span style="color:#FF9800;font-weight:bold;">8/10 advanced DSA problems</span>, demonstrating strong algorithmic thinking and optimization skills.</div><div style="background:rgba(255,152,0,0.1);padding:15px;border-radius:5px;border-left:4px solid #FF9800;"><span style="color:#FF9800;font-weight:bold;font-size:1.1em;">Inter-IIIT Cricket Tournament</span> (2023)<br><br>Demonstrated leadership as team captain, guiding our institute to a <span style="color:#4CAF50;font-weight:bold;">Top 5 finish</span> among 15 competing institutes. Showcased strategic planning, team coordination, and performance under pressure.</div>'
    },
    'Interests': {
        radius: 'Blue Planet',
        tilt: 'Interests',
        rotation: 'Hobbies',
        orbit: 'Passions',
        distance: 'Personal Side',
        moons: 'After Hours',
        info: '<strong>🌟 Beyond Coding</strong><br><br><div style="display:flex;flex-wrap:wrap;gap:15px;margin-top:10px;">' + 
        '<div style="flex:1;min-width:45%;text-align:center;padding:15px;background:rgba(33,150,243,0.1);border-radius:8px;">' + 
        '<span style="font-size:24px;">🔍</span><br>' + 
        '<span style="color:#2196F3;font-weight:bold;">Tech Exploration</span><br>' + 
        '<span style="font-size:0.9em;">Constantly researching emerging technologies and industry trends</span>' + 
        '</div>' + 
        '<div style="flex:1;min-width:45%;text-align:center;padding:15px;background:rgba(76,175,80,0.1);border-radius:8px;">' + 
        '<span style="font-size:24px;">🧠</span><br>' + 
        '<span style="color:#4CAF50;font-weight:bold;">First-Principle Thinking</span><br>' + 
        '<span style="font-size:0.9em;">Breaking down complex problems to their fundamental truths</span>' + 
        '</div>' + 
        '<div style="flex:1;min-width:45%;text-align:center;padding:15px;background:rgba(255,152,0,0.1);border-radius:8px;">' + 
        '<span style="font-size:24px;">🏏</span><br>' + 
        '<span style="color:#FF9800;font-weight:bold;">Cricket</span><br>' + 
        '<span style="font-size:0.9em;">Team captain with leadership experience in competitive tournaments</span>' + 
        '</div>' + 
        '<div style="flex:1;min-width:45%;text-align:center;padding:15px;background:rgba(156,39,176,0.1);border-radius:8px;">' + 
        '<span style="font-size:24px;">📚</span><br>' + 
        '<span style="color:#9C27B0;font-weight:bold;">Continuous Learning</span><br>' + 
        '<span style="font-size:0.9em;">Self-driven education through tech videos, articles, and hands-on projects</span>' + 
        '</div>' + 
        '</div>' + 
        '<p style="margin-top:15px;">These diverse interests fuel my creativity and enhance my problem-solving approach, bringing fresh perspectives to technical challenges and team collaboration.</p>'
    },
    'Contact': {
        radius: 'Dwarf Planet',
        tilt: 'Contact',
        rotation: 'Get in Touch',
        orbit: 'Connect',
        distance: 'Reach Out',
        moons: 'Communication',
        info: '<strong>📲 Let\'s Connect</strong><br><br><div style="text-align:center;margin-bottom:20px;"><div style="display:inline-block;background:#4CAF50;color:white;padding:12px 20px;border-radius:30px;font-weight:bold;margin-bottom:20px;"><span style="margin-right:8px;">🚀</span>Available for Exciting Tech Opportunities</div></div><div style="display:flex;flex-wrap:wrap;justify-content:center;gap:15px;">' +
        '<a href="mailto:Harshsingh200777@gmail.com" class="contact-link" style="text-decoration:none;flex:1;min-width:200px;background:rgba(244,67,54,0.1);padding:15px;border-radius:8px;text-align:center;border:1px solid rgba(244,67,54,0.3);color:#F44336;font-weight:bold;"><span style="font-size:24px;display:block;margin-bottom:5px;">📧</span>Harshsingh200777@gmail.com</a>' +
        '<a href="https://linkedin.com/in/harsh-dhakar-fullstack" target="_blank" class="contact-link" style="text-decoration:none;flex:1;min-width:200px;background:rgba(33,150,243,0.1);padding:15px;border-radius:8px;text-align:center;border:1px solid rgba(33,150,243,0.3);color:#2196F3;font-weight:bold;"><span style="font-size:24px;display:block;margin-bottom:5px;">🔗</span>LinkedIn Profile</a>' +
        '<a href="https://github.com/harsh-5401" target="_blank" class="contact-link" style="text-decoration:none;flex:1;min-width:200px;background:#;padding:15px;border-radius:8px;text-align:center;border:1px solid rgba(33,33,33,0.3);color:#333;font-weight:bold;"><span style="font-size:24px;display:block;margin-bottom:5px;">💻</span>GitHub: @harsh-5401</a>' +
        '</div>' +
        '<p style="text-align:center;margin-top:20px;">I\'m currently leading the Tech at Wisit Digital with a mission to revolutionize how the world hires with AI.<br>Feel free to connect with me for all things tech or just to say hello!<br><br><span style="color:#4CAF50;font-weight:bold;">Let\'s shape the future of tech together. 🌟</span></p>' +
        '<div style="text-align:center;margin-top:20px;"><a href="/resume.pdf" download class="resume-button" style="background:#FF9800;"><span style="margin-right:8px;">📄</span>Download Full Resume</a></div>'
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
// ******  KEYBOARD AND TOUCH NAVIGATION  ******
function setupKeyboardNavigation() {
  // Current focused planet index
  let currentPlanetIndex = -1; // -1 means no planet is focused
  const planets = [mercury, venus, earth, mars, jupiter, saturn, uranus, neptune, pluto];
  const planetNames = ['About Me', 'Education', 'Skills', 'Experience', 'Projects', 'Services', 'Testimonials', 'Interests', 'Contact'];
  
  // Handle keyboard navigation
  document.addEventListener('keydown', function(event) {
    // Arrow keys navigation
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      // Move to next planet
      currentPlanetIndex = (currentPlanetIndex + 1) % planets.length;
      navigateToPlanet(planetNames[currentPlanetIndex]);
      showKeyboardFeedback('right');
      event.preventDefault();
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      // Move to previous planet
      currentPlanetIndex = (currentPlanetIndex - 1 + planets.length) % planets.length;
      navigateToPlanet(planetNames[currentPlanetIndex]);
      showKeyboardFeedback('left');
      event.preventDefault();
    } else if (event.key === 'Escape') {
      // Return to overview
      closeInfo();
      showKeyboardFeedback('escape');
      event.preventDefault();
    }
  });
  
  // Function to show visual feedback for keyboard navigation
  function showKeyboardFeedback(direction) {
    // Find the key element to highlight
    let keyElement;
    if (direction === 'right') {
      keyElement = document.querySelector('.key:nth-child(2)'); // Right arrow
    } else if (direction === 'left') {
      keyElement = document.querySelector('.key:nth-child(1)'); // Left arrow
    } else if (direction === 'escape') {
      keyElement = document.querySelector('.key-hint:nth-child(2) .key'); // ESC key
    }
    
    if (keyElement) {
      // Add active class
      keyElement.classList.add('key-active');
      
      // Remove active class after animation
      setTimeout(() => {
        keyElement.classList.remove('key-active');
      }, 300);
    }
    
    // Also highlight the corresponding planet in the navigation
    if (currentPlanetIndex >= 0) {
      const navItems = document.querySelectorAll('#planet-nav li');
      navItems.forEach((item, index) => {
        if (index === currentPlanetIndex) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    }
  }
  
  // Add touch swipe support
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;
  
  document.addEventListener('touchstart', function(event) {
    touchStartX = event.changedTouches[0].screenX;
    touchStartY = event.changedTouches[0].screenY;
  }, false);
  
  document.addEventListener('touchend', function(event) {
    touchEndX = event.changedTouches[0].screenX;
    touchEndY = event.changedTouches[0].screenY;
    handleSwipe();
  }, false);
  
  function handleSwipe() {
    const horizontalDiff = touchEndX - touchStartX;
    const verticalDiff = touchEndY - touchStartY;
    
    // Detect horizontal or vertical swipe based on which has greater magnitude
    if (Math.abs(horizontalDiff) > Math.abs(verticalDiff)) {
      // Horizontal swipe
      if (horizontalDiff > 50) {
        // Swipe right - previous planet
        currentPlanetIndex = (currentPlanetIndex - 1 + planets.length) % planets.length;
        navigateToPlanet(planetNames[currentPlanetIndex]);
        showKeyboardFeedback('left');
      } else if (horizontalDiff < -50) {
        // Swipe left - next planet
        currentPlanetIndex = (currentPlanetIndex + 1) % planets.length;
        navigateToPlanet(planetNames[currentPlanetIndex]);
        showKeyboardFeedback('right');
      }
    } else {
      // Vertical swipe
      if (verticalDiff > 50) {
        // Swipe down - previous planet
        currentPlanetIndex = (currentPlanetIndex - 1 + planets.length) % planets.length;
        navigateToPlanet(planetNames[currentPlanetIndex]);
        showKeyboardFeedback('left');
      } else if (verticalDiff < -50) {
        // Swipe up - next planet
        currentPlanetIndex = (currentPlanetIndex + 1) % planets.length;
        navigateToPlanet(planetNames[currentPlanetIndex]);
        showKeyboardFeedback('right');
      }
    }
  }
  
  // Track wheel events for touchpad navigation
  document.addEventListener('wheel', function(event) {
    // Debounce wheel events to prevent too rapid navigation
    if (wheelTimeout) clearTimeout(wheelTimeout);
    
    wheelTimeout = setTimeout(() => {
      // Determine direction based on deltaY
      if (event.deltaY > 20) {
        // Scroll down - next planet
        currentPlanetIndex = (currentPlanetIndex + 1) % planets.length;
        navigateToPlanet(planetNames[currentPlanetIndex]);
        showKeyboardFeedback('right');
      } else if (event.deltaY < -20) {
        // Scroll up - previous planet
        currentPlanetIndex = (currentPlanetIndex - 1 + planets.length) % planets.length;
        navigateToPlanet(planetNames[currentPlanetIndex]);
        showKeyboardFeedback('left');
      }
    }, 150); // Debounce time in ms
  }, { passive: true });
  
  // Update current planet index when planet is selected through other means
  const updateCurrentPlanetIndex = function(planetName) {
    const index = planetNames.indexOf(planetName);
    if (index !== -1) {
      currentPlanetIndex = index;
    }
  };
  
  // Override the existing navigateToPlanet function to track the current planet
  const originalNavigateToPlanet = navigateToPlanet;
  navigateToPlanet = function(planetName) {
    originalNavigateToPlanet(planetName);
    updateCurrentPlanetIndex(planetName);
  };
  
  // Override closeInfo to reset currentPlanetIndex
  const originalCloseInfo = closeInfo;
  closeInfo = function() {
    originalCloseInfo();
    currentPlanetIndex = -1;
  };
}

// Variable for wheel event debouncing
let wheelTimeout;

// Initialize planet navigation after everything else is loaded
loadAsteroids('/asteroids/asteroidPack.glb', 1000, 130, 160);
loadAsteroids('/asteroids/asteroidPack.glb', 3000, 352, 370);
setupPlanetNavigation();
setupKeyboardNavigation(); // Add this line
animate();

window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('mousedown', onDocumentMouseDown, false);
window.addEventListener('resize', function(){
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
  composer.setSize(window.innerWidth,window.innerHeight);
});
