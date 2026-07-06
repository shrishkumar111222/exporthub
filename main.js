// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Helper for smooth scrolling
window.scrollTo = function(selector) {
  const target = document.querySelector(selector);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' });
  }
};

/* =========================================================================
   GLOBAL RESOURCES & WORLD MAP GENERATOR
   ========================================================================= */
// Create a procedural high-tech world map canvas to use as a texture
function createWorldMapTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Fill Ocean (Midnight Blue)
  ctx.fillStyle = '#030712';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw Grid Lines (Futuristic Latitude/Longitude)
  ctx.strokeStyle = 'rgba(0, 212, 255, 0.08)';
  ctx.lineWidth = 1;
  const gridSize = 32;
  for (let x = 0; x < canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Draw simplified, stylized continents (cyberpunk/digital style)
  // Coordinates are normalized to [0, 1] then mapped to canvas size
  const continents = [
    // North America
    [[0.15, 0.2], [0.35, 0.2], [0.4, 0.45], [0.25, 0.55], [0.2, 0.45]],
    // South America
    [[0.25, 0.55], [0.35, 0.58], [0.38, 0.7], [0.32, 0.9], [0.28, 0.7]],
    // Eurasia / Africa
    [[0.45, 0.15], [0.75, 0.12], [0.85, 0.25], [0.9, 0.4], [0.7, 0.5], [0.65, 0.35], [0.5, 0.3]],
    // Africa
    [[0.45, 0.45], [0.58, 0.45], [0.62, 0.6], [0.55, 0.85], [0.48, 0.7], [0.44, 0.55]],
    // India (glowing projection)
    [[0.68, 0.42], [0.72, 0.42], [0.7, 0.52]],
    // Australia
    [[0.78, 0.65], [0.88, 0.65], [0.88, 0.78], [0.78, 0.75]]
  ];

  ctx.fillStyle = '#081e3f'; // Land
  ctx.strokeStyle = '#00d4ff'; // Glowing borders
  ctx.lineWidth = 3;

  continents.forEach(poly => {
    ctx.beginPath();
    poly.forEach((pt, idx) => {
      const x = pt[0] * canvas.width;
      const y = pt[1] * canvas.height;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw tech hex pattern inside land
    ctx.fillStyle = 'rgba(0, 255, 234, 0.15)';
    ctx.beginPath();
    poly.forEach((pt, idx) => {
      const x = pt[0] * canvas.width;
      const y = pt[1] * canvas.height;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.save();
    ctx.clip();
    // Dot pattern
    for (let px = 0; px < canvas.width; px += 16) {
      for (let py = 0; py < canvas.height; py += 16) {
        ctx.fillRect(px, py, 3, 3);
      }
    }
    ctx.restore();
  });

  // Specifically highlight India
  ctx.fillStyle = '#00ffea';
  ctx.beginPath();
  continents[4].forEach((pt, idx) => {
    const x = pt[0] * canvas.width;
    const y = pt[1] * canvas.height;
    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fill();
  ctx.shadowColor = '#00ffea';
  ctx.shadowBlur = 20;
  ctx.stroke();
  ctx.shadowBlur = 0; // reset

  return new THREE.CanvasTexture(canvas);
}

// Convert Lat/Lon to 3D Sphere Coordinates
function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.sin(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.cos(theta);
  return new THREE.Vector3(x, y, z);
}

/* =========================================================================
   S1: HERO GLOBE
   ========================================================================= */
const initHeroGlobe = () => {
  const container = document.getElementById('hero');
  const canvas = document.getElementById('globe-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.z = 180;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Globe Base
  const texture = createWorldMapTexture();
  const globeGeo = new THREE.SphereGeometry(60, 64, 64);
  const globeMat = new THREE.MeshPhongMaterial({
    map: texture,
    shininess: 40,
    specular: new THREE.Color('#00d4ff'),
    bumpScale: 1
  });
  const globe = new THREE.Mesh(globeGeo, globeMat);
  scene.add(globe);

  // Atmosphere Glow / Outline
  const glowGeo = new THREE.SphereGeometry(61, 32, 32);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x00d4ff,
    transparent: true,
    opacity: 0.1,
    side: THREE.BackSide
  });
  const glowMesh = new THREE.Mesh(glowGeo, glowMat);
  scene.add(glowMesh);

  // Clouds Layer
  const cloudsGeo = new THREE.SphereGeometry(60.8, 64, 64);
  // Procedural cloud texture
  const cloudCanvas = document.createElement('canvas');
  cloudCanvas.width = 1024;
  cloudCanvas.height = 512;
  const cctx = cloudCanvas.getContext('2d');
  cctx.clearRect(0, 0, 1024, 512);
  cctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  for (let i = 0; i < 40; i++) {
    cctx.beginPath();
    cctx.arc(Math.random() * 1024, Math.random() * 512, Math.random() * 80 + 30, 0, Math.PI * 2);
    cctx.fill();
  }
  const cloudTexture = new THREE.CanvasTexture(cloudCanvas);
  const cloudsMat = new THREE.MeshPhongMaterial({
    alphaMap: cloudTexture,
    transparent: true,
    color: 0xffffff,
    blending: THREE.AdditiveBlending
  });
  const cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
  scene.add(cloudsMesh);

  // Stars Particle System
  const starsGeo = new THREE.BufferGeometry();
  const starCount = 600;
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount * 3; i += 3) {
    starPositions[i] = (Math.random() - 0.5) * 800;
    starPositions[i + 1] = (Math.random() - 0.5) * 800;
    starPositions[i + 2] = (Math.random() - 0.5) * 800;
  }
  starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.8, transparent: true, opacity: 0.7 });
  const stars = new THREE.Points(starsGeo, starsMat);
  scene.add(stars);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x020813, 1.5);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
  sunLight.position.set(100, 50, 100);
  scene.add(sunLight);

  const fillLight = new THREE.DirectionalLight(0x00d4ff, 1.2);
  fillLight.position.set(-100, -50, -100);
  scene.add(fillLight);

  // Animated Trade Routes (India to USA, Germany, Japan, UAE, Russia, Brazil)
  const routes = [
    { name: 'USA', lat: 37.09, lon: -95.71, color: 0x00d4ff },
    { name: 'Germany', lat: 51.16, lon: 10.45, color: 0x00ffea },
    { name: 'Japan', lat: 36.20, lon: 138.25, color: 0x3b82f6 },
    { name: 'UAE', lat: 23.42, lon: 53.84, color: 0x00ffea },
    { name: 'Russia', lat: 61.52, lon: 105.31, color: 0x00d4ff },
    { name: 'Brazil', lat: -14.23, lon: -51.92, color: 0x3b82f6 }
  ];
  const india = { lat: 20.59, lon: 78.96 };
  const pIndia = latLonToVector3(india.lat, india.lon, 60);

  const routeCurves = [];
  const cargoGroup = new THREE.Group();
  scene.add(cargoGroup);

  routes.forEach(r => {
    const pDest = latLonToVector3(r.lat, r.lon, 60);
    
    // Calculate control point for Bezier curve (midpoint projected outward)
    const mid = new THREE.Vector3().addVectors(pIndia, pDest).multiplyScalar(0.5);
    const dist = pIndia.distanceTo(pDest);
    mid.normalize().multiplyScalar(60 + dist * 0.25); // height relative to distance

    const curve = new THREE.QuadraticBezierCurve3(pIndia, mid, pDest);
    routeCurves.push({ curve, progress: Math.random() });

    // Draw the curve line
    const points = curve.getPoints(50);
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    const lineMat = new THREE.LineBasicMaterial({ color: r.color, transparent: true, opacity: 0.4 });
    const line = new THREE.Line(lineGeo, lineMat);
    scene.add(line);

    // Add plane indicator / light particle
    const shipGeo = new THREE.BoxGeometry(1.2, 0.4, 0.4);
    const shipMat = new THREE.MeshBasicMaterial({ color: 0x00ffea });
    const shipMesh = new THREE.Mesh(shipGeo, shipMat);
    cargoGroup.add(shipMesh);
    r.mesh = shipMesh;
  });

  // Handle Resize
  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  // Animation Loop
  const animate = () => {
    requestAnimationFrame(animate);

    // Rotate Earth & Clouds
    globe.rotation.y += 0.001;
    cloudsMesh.rotation.y += 0.0013;
    glowMesh.rotation.y += 0.001;

    // Animate Cargo Ships/Aircraft
    routeCurves.forEach((rc, i) => {
      rc.progress += 0.003;
      if (rc.progress > 1) rc.progress = 0;
      const point = rc.curve.getPointAt(rc.progress);
      const tangent = rc.curve.getTangentAt(rc.progress);

      const r = routes[i];
      if (r.mesh) {
        r.mesh.position.copy(point);
        r.mesh.lookAt(point.clone().add(tangent));
      }
    });

    renderer.render(scene, camera);
  };
  animate();
};

/* =========================================================================
   S2: TRADE NETWORK
   ========================================================================= */
const countriesData = {
  Russia: {
    flag: '🇷🇺',
    popular: ['Surgical Gloves', 'Industrial Valves', 'Tea', 'Pharmaceuticals'],
    time: '18 Days',
    ports: ['St. Petersburg', 'Vladivostok', 'Novorossiysk'],
    docs: ['Commercial Invoice', 'Customs Declaration', 'Certificate of Origin'],
    certifications: ['GOST-R', 'EAC Mark', 'CE Certificate']
  },
  UAE: {
    flag: '🇦🇪',
    popular: ['Basmati Rice', 'Organic Spices', 'Apparel', 'Industrial Cables'],
    time: '5 Days',
    ports: ['Jebel Ali (Dubai)', 'Khalifa (Abu Dhabi)', 'Sharjah'],
    docs: ['Bill of Lading', 'Commercial Invoice', 'Certificate of Origin'],
    certifications: ['Halal Certificate', 'ESMA Conformity', 'SABER Registered']
  },
  Germany: {
    flag: '🇩🇪',
    popular: ['Electronics', 'Automotive Parts', 'Organic Tea', 'Surgical Face Masks'],
    time: '22 Days',
    ports: ['Hamburg', 'Bremerhaven', 'Wilhelmshaven'],
    docs: ['Customs Invoice', 'EUR.1 Movement Certificate', 'Packing List'],
    certifications: ['CE Mark', 'ISO 9001', 'RoHS / REACH']
  },
  USA: {
    flag: '🇺🇸',
    popular: ['Textiles & Garments', 'Spices & Spreads', 'Syringes & Medical PPE', 'Rice'],
    time: '25 Days',
    ports: ['Los Angeles', 'New York/New Jersey', 'Houston'],
    docs: ['FDA Registration', 'Commercial Invoice', 'Bill of Lading'],
    certifications: ['FDA Approved', 'UL listed', 'USDA Organic']
  },
  Brazil: {
    flag: '🇧🇷',
    popular: ['Agriculture Machinery', 'Spices', 'Industrial Chemicals', 'Apparel'],
    time: '30 Days',
    ports: ['Santos', 'Paranagua', 'Rio de Janeiro'],
    docs: ['Import Declaration', 'Phytosanitary Certificate', 'Packing List'],
    certifications: ['MAPA Certified', 'ANVISA Approved', 'INMETRO']
  },
  Japan: {
    flag: '🇯🇵',
    popular: ['Basmati Rice', 'Textiles', 'Electronics', 'Organic Spices'],
    time: '14 Days',
    ports: ['Tokyo', 'Yokohama', 'Kobe', 'Osaka'],
    docs: ['Certificate of Origin (EPA)', 'Customs Invoice', 'Bill of Lading'],
    certifications: ['JAS Organic', 'JIS Mark', 'PSE Certification']
  }
};

const initTradeNetwork = () => {
  const container = document.getElementById('trade-network');
  const canvas = document.getElementById('network-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.set(0, 0, 100);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  // Simple clean background grid
  const gridHelper = new THREE.GridHelper(120, 30, 0x00d4ff, 0x0a1628);
  gridHelper.rotation.x = Math.PI / 2;
  gridHelper.position.z = -10;
  scene.add(gridHelper);

  // Setup 3D Nodes
  const nodes = {
    India: { pos: new THREE.Vector3(0, -10, 0), color: 0x00ffea, label: '🇮🇳 India (HQ)' },
    Russia: { pos: new THREE.Vector3(10, 20, 0), color: 0x00d4ff, label: '🇷🇺 Russia' },
    UAE: { pos: new THREE.Vector3(-15, 5, 0), color: 0x3b82f6, label: '🇦🇪 UAE' },
    Germany: { pos: new THREE.Vector3(-25, 20, 0), color: 0x00ffea, label: '🇩🇪 Germany' },
    USA: { pos: new THREE.Vector3(-40, 10, 0), color: 0x3b82f6, label: '🇺🇸 USA' },
    Brazil: { pos: new THREE.Vector3(-35, -20, 0), color: 0x00d4ff, label: '🇧🇷 Brazil' },
    Japan: { pos: new THREE.Vector3(35, 10, 0), color: 0x00ffea, label: '🇯🇵 Japan' }
  };

  const nodeGroup = new THREE.Group();
  scene.add(nodeGroup);

  // Render lines and dots
  const lineMat = new THREE.LineDashedMaterial({
    color: 0x00ffea,
    dashSize: 2,
    gapSize: 2
  });

  const cardsContainer = document.getElementById('country-cards');
  cardsContainer.innerHTML = '';

  Object.keys(nodes).forEach(name => {
    const node = nodes[name];

    // Sphere for Node
    const geo = new THREE.SphereGeometry(name === 'India' ? 2.5 : 1.5, 16, 16);
    const mat = new THREE.MeshBasicMaterial({ color: node.color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(node.pos);
    nodeGroup.add(mesh);

    // Create line to India if not India itself
    if (name !== 'India') {
      const lineGeo = new THREE.BufferGeometry().setFromPoints([nodes.India.pos, node.pos]);
      const line = new THREE.Line(lineGeo, lineMat);
      line.computeLineDistances();
      scene.add(line);
    }

    // Dynamic 2D HTML markers on top of canvas coordinates
    const pin = document.createElement('div');
    pin.className = 'country-pin';
    pin.innerHTML = `
      <div class="pin-dot" style="background: #${node.color.toString(16)}"></div>
      <div class="pin-label">${node.label}</div>
    `;
    pin.onclick = () => showCountryDetails(name);
    cardsContainer.appendChild(pin);
    node.domElement = pin;
  });

  // Project 3D positions to 2D Screen
  const updateHTMLPositions = () => {
    const tempV = new THREE.Vector3();
    Object.keys(nodes).forEach(name => {
      const node = nodes[name];
      if (!node.domElement) return;

      tempV.copy(node.pos);
      tempV.project(camera);

      const x = (tempV.x *  .5 + .5) * canvas.clientWidth;
      const y = (tempV.y * -.5 + .5) * canvas.clientHeight;

      node.domElement.style.left = `${x}px`;
      node.domElement.style.top = `${y}px`;
    });
  };

  window.addEventListener('resize', () => {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  });

  // Hover animations / Rotations
  const animate = () => {
    requestAnimationFrame(animate);
    nodeGroup.rotation.z = Math.sin(Date.now() * 0.0005) * 0.05;
    renderer.render(scene, camera);
    updateHTMLPositions();
  };
  animate();
};

window.showCountryDetails = (country) => {
  const panel = document.getElementById('country-panel');
  const content = document.getElementById('panel-content');
  if (!panel || !content) return;

  const data = countriesData[country];
  if (!data) {
    closePanel();
    return;
  }

  content.innerHTML = `
    <div class="panel-flag">${data.flag}</div>
    <h3 class="panel-country">${country} Corridor</h3>
    <p style="color:var(--silver); font-size: 0.85rem; margin-bottom: 1.2rem;">Direct export routes from India</p>
    
    <div class="panel-stats">
      <div class="panel-stat">
        <div class="panel-stat-val">${data.time}</div>
        <div class="panel-stat-key">Shipping Time</div>
      </div>
      <div class="panel-stat">
        <div class="panel-stat-val">${data.ports.length}</div>
        <div class="panel-stat-key">Major Ports</div>
      </div>
    </div>

    <h4 style="font-size: 0.9rem; margin: 1rem 0 0.5rem; color:var(--electric);">Popular Imports</h4>
    <div class="panel-tags">
      ${data.popular.map(p => `<span class="panel-tag">${p}</span>`).join('')}
    </div>

    <h4 style="font-size: 0.9rem; margin: 1.2rem 0 0.5rem; color:var(--electric);">Required Documents</h4>
    <ul style="font-size: 0.8rem; padding-left: 1.2rem; color:var(--silver); line-height: 1.6;">
      ${data.docs.map(d => `<li>${d}</li>`).join('')}
    </ul>

    <h4 style="font-size: 0.9rem; margin: 1.2rem 0 0.5rem; color:var(--electric);">Certifications</h4>
    <div class="panel-tags">
      ${data.certifications.map(c => `<span class="panel-tag" style="color: #ffd700; border-color: rgba(255,215,0,0.2);">${c}</span>`).join('')}
    </div>
    
    <button class="btn-primary" style="width: 100%; margin-top: 1.5rem;" onclick="scrollTo('#contact')">Inquire for ${country}</button>
  `;

  panel.classList.add('open');
};

window.closePanel = () => {
  const panel = document.getElementById('country-panel');
  if (panel) panel.classList.remove('open');
};

/* =========================================================================
   S3: CONTAINER PORT & SCROLL CONTAINER MOVEMENTS
   ========================================================================= */
const initContainerPort = () => {
  const canvas = document.getElementById('port-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.set(40, 20, 60);
  camera.lookAt(0, 5, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  // Sea water plane
  const waterGeo = new THREE.PlaneGeometry(200, 200);
  const waterMat = new THREE.MeshPhongMaterial({ color: 0x00111a, shininess: 80, specular: 0x00d4ff });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.y = -2;
  scene.add(water);

  // Cargo Ship
  const shipGroup = new THREE.Group();
  shipGroup.position.set(-15, 0, -5);
  scene.add(shipGroup);

  const hullGeo = new THREE.BoxGeometry(35, 4, 10);
  const hullMat = new THREE.MeshPhongMaterial({ color: 0x0a1628, roughness: 0.5 });
  const hull = new THREE.Mesh(hullGeo, hullMat);
  shipGroup.add(hull);

  const cabinGeo = new THREE.BoxGeometry(6, 8, 8);
  const cabinMat = new THREE.MeshPhongMaterial({ color: 0x112240 });
  const cabin = new THREE.Mesh(cabinGeo, cabinMat);
  cabin.position.set(-12, 4, 0);
  shipGroup.add(cabin);

  // Container Port Dock/Pier
  const dockGeo = new THREE.BoxGeometry(40, 5, 15);
  const dockMat = new THREE.MeshPhongMaterial({ color: 0x1e293b });
  const dock = new THREE.Mesh(dockGeo, dockMat);
  dock.position.set(15, -1, 15);
  scene.add(dock);

  // Cranes on the Dock
  const craneGroup = new THREE.Group();
  craneGroup.position.set(10, 1.5, 12);
  scene.add(craneGroup);

  const towerGeo = new THREE.CylinderGeometry(0.8, 1, 12, 8);
  const towerMat = new THREE.MeshPhongMaterial({ color: 0x3b82f6 });
  const tower = new THREE.Mesh(towerGeo, towerMat);
  craneGroup.add(tower);

  const armGeo = new THREE.BoxGeometry(16, 0.8, 0.8);
  const armMat = new THREE.MeshPhongMaterial({ color: 0x00d4ff });
  const arm = new THREE.Mesh(armGeo, armMat);
  arm.position.set(-4, 6, 0);
  craneGroup.add(arm);

  // Loading Container (The main animated object)
  const containerGeo = new THREE.BoxGeometry(3, 2, 2.5);
  const containerMat = new THREE.MeshPhongMaterial({ color: 0x00ffea, emissive: 0x00ffea, emissiveIntensity: 0.2 });
  const loadingContainer = new THREE.Mesh(containerGeo, containerMat);
  loadingContainer.position.set(15, 2.5, 12); // start on dock
  scene.add(loadingContainer);

  // Stack of static containers on the dock
  const colors = [0x3b82f6, 0x00d4ff, 0x0a1628];
  for (let x = 0; x < 2; x++) {
    for (let y = 0; y < 2; y++) {
      const box = new THREE.Mesh(containerGeo, new THREE.MeshPhongMaterial({ color: colors[(x+y)%3] }));
      box.position.set(22 + x * 4, 2.5 + y * 2.1, 12);
      scene.add(box);
    }
  }

  // Lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);
  const spotlight = new THREE.SpotLight(0x00d4ff, 3, 100, Math.PI/4, 0.5, 1);
  spotlight.position.set(20, 30, 20);
  scene.add(spotlight);

  // Scroll Trigger Container Transport
  gsap.timeline({
    scrollTrigger: {
      trigger: '#port',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1
    }
  })
  .to(loadingContainer.position, { y: 10, duration: 1 }) // lift up
  .to(loadingContainer.position, { x: -5, duration: 1.5 }) // move across dock to ship
  .to(loadingContainer.position, { y: 3, duration: 1 }) // place on ship
  .to(shipGroup.position, { x: 50, duration: 2 }); // ship sails away

  window.addEventListener('resize', () => {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  });

  const animate = () => {
    requestAnimationFrame(animate);
    water.position.y = -2 + Math.sin(Date.now() * 0.001) * 0.1;
    renderer.render(scene, camera);
  };
  animate();
};

/* =========================================================================
   S4: futuristic WAREHOUSE & SHELF CLICKING
   ========================================================================= */
const categories = [
  { name: 'Medical Supplies', icon: '🩺', items: ['Syringe', 'Surgical Gloves', 'Masks', 'Medicines'], pos: [-15, 0, -10] },
  { name: 'Food & Beverages', icon: '🌾', items: ['Rice Bag', 'Tea', 'Spices'], pos: [-5, 0, -10] },
  { name: 'Agriculture', icon: '🚜', items: ['Seeds', 'Organic Spatula', 'Soil Nutrients'], pos: [5, 0, -10] },
  { name: 'Industrial Materials', icon: '🏗️', items: ['Cables', 'Valves', 'Pipes'], pos: [15, 0, -10] },
  { name: 'Electronics', icon: '🔌', items: ['Transformers', 'Capacitors', 'Cables'], pos: [25, 0, -10] }
];

const initWarehouse = () => {
  const canvas = document.getElementById('warehouse-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.set(0, 15, 30);
  camera.lookAt(5, 0, -10);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  // Warehouse grid floor
  const floorGeo = new THREE.PlaneGeometry(100, 100);
  const floorMat = new THREE.MeshBasicMaterial({ color: 0x07152b, side: THREE.DoubleSide });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -2;
  scene.add(floor);

  const grid = new THREE.GridHelper(100, 40, 0x00d4ff, 0x081e3f);
  grid.position.y = -1.9;
  scene.add(grid);

  // Render futuristic glowing shelves
  const shelfGroup = new THREE.Group();
  scene.add(shelfGroup);

  categories.forEach((cat, idx) => {
    const group = new THREE.Group();
    group.position.set(cat.pos[0], cat.pos[1], cat.pos[2]);

    // Shelf frames
    const frameGeo = new THREE.BoxGeometry(6, 8, 2);
    const frameMat = new THREE.MeshBasicMaterial({ color: 0x112240, wireframe: true });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    group.add(frame);

    // Glowing shelves
    for (let h = -2; h <= 2; h += 2) {
      const plGeo = new THREE.BoxGeometry(5.8, 0.2, 1.8);
      const plMat = new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.6 });
      const shelfPl = new THREE.Mesh(plGeo, plMat);
      shelfPl.position.y = h;
      group.add(shelfPl);

      // Simple cylinder/box objects representing cargo
      const cargoGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
      const cargoMat = new THREE.MeshPhongMaterial({ color: 0x3b82f6 });
      const cargo = new THREE.Mesh(cargoGeo, cargoMat);
      cargo.position.set(-1.5, h + 0.7, 0);
      group.add(cargo);

      const cargoGeo2 = new THREE.CylinderGeometry(0.6, 0.6, 1.4, 8);
      const cargoMat2 = new THREE.MeshPhongMaterial({ color: 0x00ffea });
      const cargo2 = new THREE.Mesh(cargoGeo2, cargoMat2);
      cargo2.position.set(1.5, h + 0.7, 0);
      group.add(cargo2);
    }

    shelfGroup.add(group);
  });

  // Lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);
  const dirLight = new THREE.DirectionalLight(0x00d4ff, 1.5);
  dirLight.position.set(0, 20, 10);
  scene.add(dirLight);

  // Render category cards
  const gridContainer = document.getElementById('shelf-grid');
  gridContainer.innerHTML = '';
  categories.forEach((cat, idx) => {
    const card = document.createElement('div');
    card.className = 'shelf-card';
    card.innerHTML = `
      <div class="shelf-icon">${cat.icon}</div>
      <div class="shelf-name">${cat.name}</div>
      <div class="shelf-count">${cat.items.length} Products Available</div>
    `;
    card.onclick = () => {
      // Zoom camera to clicked shelf
      gsap.to(camera.position, {
        x: cat.pos[0],
        y: cat.pos[1] + 4,
        z: cat.pos[2] + 12,
        duration: 1.5,
        onUpdate: () => camera.lookAt(cat.pos[0], cat.pos[1], cat.pos[2])
      });
      // Activate product viewer section
      const pViewer = document.getElementById('product-viewer');
      if (pViewer) {
        setTimeout(() => pViewer.scrollIntoView({ behavior: 'smooth' }), 1200);
      }
    };
    gridContainer.appendChild(card);
  });

  window.addEventListener('resize', () => {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  });

  const animate = () => {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  };
  animate();
};

/* =========================================================================
   S5: 360° PRODUCT VIEWER
   ========================================================================= */
const products = [
  { name: 'Syringe', category: 'Medical', shape: 'syringe', color: 0x00ffea, spec: 'Medical Grade Polymer, Luer Lock, sterile packaging' },
  { name: 'Surgical Gloves', category: 'Medical', shape: 'gloves', color: 0x3b82f6, spec: 'Powder-free nitrile, chlorinated, ISO certified' },
  { name: 'Masks', category: 'Medical', shape: 'mask', color: 0xffffff, spec: '3-Ply Meltblown filter, BFE > 99%, fluid resistant' },
  { name: 'Medicines', category: 'Medical', shape: 'medicine', color: 0x00d4ff, spec: 'GMP certified packaging, tablet & capsule exports' },
  { name: 'Rice Bag', category: 'Agriculture', shape: 'rice', color: 0xffd700, spec: '1121 Basmati Rice, Moisture < 12%, customized gunny bags' },
  { name: 'Tea', category: 'Agriculture', shape: 'tea', color: 0x10b981, spec: 'Darjeeling Black Tea, vacuum packed tin cans' },
  { name: 'Spices', category: 'Agriculture', shape: 'spices', color: 0xf59e0b, spec: 'Authentic Indian Spices (Cardamom, Pepper, Turmeric)' }
];

let activeProduct = products[0];
let productMesh = null;
let autoRotate = true;

const initProductViewer = () => {
  const canvas = document.getElementById('product-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 15);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  // Setup basic scene lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambient);

  const pointLight1 = new THREE.PointLight(0x00d4ff, 2, 50);
  pointLight1.position.set(10, 10, 10);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0x00ffea, 1.5, 50);
  pointLight2.position.set(-10, -10, 10);
  scene.add(pointLight2);

  // Render product side list
  const pList = document.getElementById('product-list');
  pList.innerHTML = '';
  products.forEach(p => {
    const item = document.createElement('div');
    item.className = `product-item ${p.name === activeProduct.name ? 'active' : ''}`;
    item.innerHTML = `
      <div class="product-item-icon">📦</div>
      <div class="product-item-name">${p.name}</div>
    `;
    item.onclick = () => {
      document.querySelectorAll('.product-item').forEach(el => el.classList.remove('active'));
      item.classList.add('active');
      loadProduct3D(p);
    };
    pList.appendChild(item);
  });

  // Construct procedural 3D model depending on selection
  const loadProduct3D = (p) => {
    activeProduct = p;
    if (productMesh) scene.remove(productMesh);

    productMesh = new THREE.Group();

    if (p.shape === 'syringe') {
      // Cylinder barrel
      const barrelGeo = new THREE.CylinderGeometry(0.6, 0.6, 5, 16);
      const barrelMat = new THREE.MeshPhongMaterial({ color: p.color, transparent: true, opacity: 0.6 });
      const barrel = new THREE.Mesh(barrelGeo, barrelMat);
      productMesh.add(barrel);

      // Plunger
      const plungerGeo = new THREE.CylinderGeometry(0.3, 0.3, 5, 8);
      const plungerMat = new THREE.MeshPhongMaterial({ color: 0xcccccc });
      const plunger = new THREE.Mesh(plungerGeo, plungerMat);
      plunger.position.y = 2.5;
      productMesh.add(plunger);

      // Needle hub
      const needleGeo = new THREE.CylinderGeometry(0.04, 0.04, 2, 8);
      const needleMat = new THREE.MeshBasicMaterial({ color: 0xdddddd });
      const needle = new THREE.Mesh(needleGeo, needleMat);
      needle.position.y = -3.5;
      productMesh.add(needle);

    } else if (p.shape === 'gloves') {
      // A hand-shaped abstract box and cylinder cluster
      const palmGeo = new THREE.BoxGeometry(2, 3, 0.6);
      const gloveMat = new THREE.MeshPhongMaterial({ color: p.color, roughness: 0.9 });
      const palm = new THREE.Mesh(palmGeo, gloveMat);
      productMesh.add(palm);

      // Fingers
      for (let i = -0.75; i <= 0.75; i += 0.5) {
        const fingerGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.8, 8);
        const finger = new THREE.Mesh(fingerGeo, gloveMat);
        finger.position.set(i, 2.4, 0);
        productMesh.add(finger);
      }
    } else if (p.shape === 'mask') {
      // Curved fabric sheet
      const maskGeo = new THREE.BoxGeometry(4, 2.5, 0.1);
      const maskMat = new THREE.MeshPhongMaterial({ color: p.color, roughness: 0.8 });
      const mask = new THREE.Mesh(maskGeo, maskMat);
      productMesh.add(mask);

      // Elastic loops
      const loopGeo = new THREE.TorusGeometry(0.8, 0.05, 8, 24);
      const loopL = new THREE.Mesh(loopGeo, maskMat);
      loopL.position.set(-2, 0, 0);
      loopL.rotation.y = Math.PI / 2;
      productMesh.add(loopL);

      const loopR = loopL.clone();
      loopR.position.set(2, 0, 0);
      productMesh.add(loopR);

    } else if (p.shape === 'medicine') {
      // Pill container
      const bottleGeo = new THREE.CylinderGeometry(1.5, 1.5, 4, 16);
      const bottleMat = new THREE.MeshPhongMaterial({ color: p.color });
      const bottle = new THREE.Mesh(bottleGeo, bottleMat);
      productMesh.add(bottle);

      // Cap
      const capGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.8, 16);
      const capMat = new THREE.MeshPhongMaterial({ color: 0xffffff });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.y = 2.2;
      productMesh.add(cap);

    } else if (p.shape === 'rice') {
      // Rice burlap bag (Curved box cylinder)
      const bagGeo = new THREE.CylinderGeometry(1.8, 2, 4, 12);
      const bagMat = new THREE.MeshPhongMaterial({ color: p.color, roughness: 1.0 });
      const bag = new THREE.Mesh(bagGeo, bagMat);
      productMesh.add(bag);

      // Tied neck top
      const neckGeo = new THREE.CylinderGeometry(1, 1.4, 0.8, 12);
      const neck = new THREE.Mesh(neckGeo, bagMat);
      neck.position.y = 2.4;
      productMesh.add(neck);

    } else if (p.shape === 'tea') {
      // Tea tin/box
      const tinGeo = new THREE.BoxGeometry(3, 4, 2);
      const tinMat = new THREE.MeshPhongMaterial({ color: p.color, metalness: 0.8, roughness: 0.2 });
      const tin = new THREE.Mesh(tinGeo, tinMat);
      productMesh.add(tin);

    } else if (p.shape === 'spices') {
      // Spice bowl
      const bowlGeo = new THREE.CylinderGeometry(2, 1, 1.5, 16, 1, true);
      const bowlMat = new THREE.MeshPhongMaterial({ color: 0x9a3412, side: THREE.DoubleSide });
      const bowl = new THREE.Mesh(bowlGeo, bowlMat);
      productMesh.add(bowl);

      // Spice powder fill inside
      const fillGeo = new THREE.CylinderGeometry(1.8, 1.8, 0.4, 16);
      const fillMat = new THREE.MeshPhongMaterial({ color: p.color });
      const fill = new THREE.Mesh(fillGeo, fillMat);
      fill.position.y = 0.4;
      productMesh.add(fill);
    }

    scene.add(productMesh);

    // Update panel text
    const infoPanel = document.getElementById('product-info');
    infoPanel.innerHTML = `
      <h3>${p.name}</h3>
      <div class="info-row">
        <span class="info-key">Category</span>
        <span class="info-val">${p.category}</span>
      </div>
      <div class="info-row">
        <span class="info-key">Export Origin</span>
        <span class="info-val">India</span>
      </div>
      <div class="info-row">
        <span class="info-key">Compliance</span>
        <span class="info-val">ISO & CE Standard</span>
      </div>
      <div style="margin-top: 1rem; font-size: 0.8rem; line-height: 1.5; color: var(--silver);">
        <strong>Specifications:</strong><br/>
        ${p.spec}
      </div>
      <button class="btn-primary full" style="margin-top: 1.5rem;" onclick="scrollTo('#contact')">Inquire Product</button>
    `;
  };

  // Load the initial product
  loadProduct3D(products[0]);

  // Controls bindings
  document.getElementById('btn-rotate').onclick = () => {
    autoRotate = !autoRotate;
    document.getElementById('btn-rotate').classList.toggle('active', !autoRotate);
  };
  document.getElementById('btn-zoom-in').onclick = () => {
    if (camera.position.z > 6) camera.position.z -= 1.5;
  };
  document.getElementById('btn-zoom-out').onclick = () => {
    if (camera.position.z < 25) camera.position.z += 1.5;
  };
  document.getElementById('btn-spec').onclick = () => {
    showToast(`Downloading specifications for ${activeProduct.name}...`);
  };

  // Simple mouse drag to rotate product
  let isDragging = false;
  let prevMouseX = 0;
  let prevMouseY = 0;

  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;
  });

  window.addEventListener('mouseup', () => isDragging = false);

  canvas.addEventListener('mousemove', (e) => {
    if (!isDragging || !productMesh) return;
    const deltaX = e.clientX - prevMouseX;
    const deltaY = e.clientY - prevMouseY;
    productMesh.rotation.y += deltaX * 0.01;
    productMesh.rotation.x += deltaY * 0.01;
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;
  });

  window.addEventListener('resize', () => {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  });

  const animate = () => {
    requestAnimationFrame(animate);
    if (autoRotate && productMesh && !isDragging) {
      productMesh.rotation.y += 0.01;
    }
    renderer.render(scene, camera);
  };
  animate();
};

/* =========================================================================
   S6: LOGISTICS JOURNEY
   ========================================================================= */
const logisticsSteps = [
  { title: 'Manufacturer', desc: 'Sourced from ISO-certified production plants across India.', icon: '🏭' },
  { title: 'Warehouse', desc: 'Inspected and loaded into customs-cleared holding warehouses.', icon: '📦' },
  { title: 'Truck', desc: 'Secure transit via GPS-tracked container carriers to port.', icon: '🚚' },
  { title: 'Port Loading', desc: 'Fast-tracked custom clearance and gantry loading at Nhava Sheva.', icon: '🏗️' },
  { title: 'Ocean Vessel', desc: 'Global maritime transit via modern commercial shipping lines.', icon: '🚢' },
  { title: 'Destination Port', desc: 'Arrival, local customs release, and container unpacking.', icon: '🏢' },
  { title: 'Customer Delivery', desc: 'Final-mile direct logistics to buyer\'s distribution hub.', icon: '🤝' }
];

const initLogisticsJourney = () => {
  const canvas = document.getElementById('logistics-canvas');
  const timeline = document.getElementById('logistics-timeline');
  if (!canvas || !timeline) return;

  // Render steps in HTML
  timeline.innerHTML = '';
  logisticsSteps.forEach((step, idx) => {
    const item = document.createElement('div');
    item.className = 'logistics-step';
    item.innerHTML = `
      <div class="step-icon" id="step-ic-${idx}">${step.icon}</div>
      <div class="step-label">${step.title}</div>
    `;
    timeline.appendChild(item);
  });

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 20);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  // Setup animated trace line in 3D representing path
  const points = [];
  const totalPoints = 40;
  for (let i = 0; i < totalPoints; i++) {
    const x = -15 + (i * 30) / (totalPoints - 1);
    const y = Math.sin(i * 0.4) * 2;
    points.push(new THREE.Vector3(x, y, 0));
  }

  const pathCurve = new THREE.CatmullRomCurve3(points);
  const pathPoints = pathCurve.getPoints(100);
  const pathGeo = new THREE.BufferGeometry().setFromPoints(pathPoints);
  const pathMat = new THREE.LineBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.3 });
  const pathLine = new THREE.Line(pathGeo, pathMat);
  scene.add(pathLine);

  // Add cargo box moving along path
  const cargoGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
  const cargoMat = new THREE.MeshPhongMaterial({ color: 0x00ffea });
  const cargo = new THREE.Mesh(cargoGeo, cargoMat);
  scene.add(cargo);

  // Lighting
  const light = new THREE.DirectionalLight(0xffffff, 1.5);
  light.position.set(0, 5, 5);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x0a1628, 1));

  // Connect scroll to step states
  gsap.timeline({
    scrollTrigger: {
      trigger: '#logistics',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 0.5,
      onUpdate: (self) => {
        const stepProgress = Math.floor(self.progress * (logisticsSteps.length - 0.01));
        document.querySelectorAll('.step-icon').forEach((el, index) => {
          el.classList.toggle('active', index <= stepProgress);
        });

        // Move the 3D cargo mesh along path
        const point = pathCurve.getPointAt(self.progress);
        if (point) cargo.position.copy(point);
      }
    }
  });

  window.addEventListener('resize', () => {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  });

  const animate = () => {
    requestAnimationFrame(animate);
    cargo.rotation.y += 0.02;
    renderer.render(scene, camera);
  };
  animate();
};

/* =========================================================================
   S7: AI EXPORT ASSISTANT
   ========================================================================= */
const aiAnswers = {
  'can i export surgical gloves to russia?': 'Yes, you can. Exporting surgical gloves (rubber/nitrile) from India to Russia is allowed under current foreign trade policy. Major compliance includes GOST-R registration, customs invoice, and Certificate of Origin. We recommend ocean transit via Vladivostok (approx. 18 days).',
  'what\'s the hs code for basmati rice?': 'The HS Code for Basmati Rice is 1006.30.20. Exporting this requires a registered exporter profile with APEDA, a phytosanitary certificate, and compliance with minimum export price regulations set by the Government of India.',
  'generate a quotation for 500 units': 'Quotation Outline:\n- Product: Surgical PPE Gloves (Nitrile)\n- Quantity: 500 cartons\n- Price per carton: $42 FOB Mumbai\n- Total FOB Value: $21,000\n- Lead time: 14 Days\n- Term: LC at sight / TT 30%.',
  'shipping cost from mumbai to dubai?': 'Estimated Shipping Cost to Dubai (Jebel Ali):\n- FCL (20ft Container): Approx. $750 - $950 USD\n- LCL (Per CBM): $45 - $60 USD\n- Transit Time: 4-6 Days\n- Frequency: Multiple direct sailings weekly.'
};

window.askAI = (elem) => {
  const query = elem.innerText || elem.value;
  simulateChat(query);
};

window.sendChat = () => {
  const input = document.getElementById('chat-input');
  if (!input || !input.value.trim()) return;
  simulateChat(input.value.trim());
  input.value = '';
};

const simulateChat = (userText) => {
  const windowEl = document.getElementById('chat-window');
  if (!windowEl) return;

  // Add User Message
  const userMsg = document.createElement('div');
  userMsg.className = 'chat-msg user-msg';
  userMsg.innerHTML = `
    <div class="msg-avatar">👤</div>
    <div class="msg-text">${userText}</div>
  `;
  windowEl.appendChild(userMsg);
  windowEl.scrollTop = windowEl.scrollHeight;

  // AI thinking delay
  setTimeout(() => {
    const normText = userText.toLowerCase().replace(/[?.,]/g, '').trim();
    let reply = "I'm sorry, I don't have that information handy. Please submit a direct quote request and our export officers will contact you immediately!";
    
    // Check keyword matching
    for (const key of Object.keys(aiAnswers)) {
      if (normText.includes(key) || key.includes(normText)) {
        reply = aiAnswers[key];
        break;
      }
    }

    const aiMsg = document.createElement('div');
    aiMsg.className = 'chat-msg ai-msg';
    aiMsg.innerHTML = `
      <div class="msg-avatar">🤖</div>
      <div class="msg-text">${reply.replace(/\n/g, '<br/>')}</div>
    `;
    windowEl.appendChild(aiMsg);
    windowEl.scrollTop = windowEl.scrollHeight;
  }, 700);
};

const initAIAvatar = () => {
  const canvas = document.getElementById('ai-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 8);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  // Hologram core glowing particle sphere
  const sphereGeo = new THREE.SphereGeometry(2, 32, 32);
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x00ffea,
    wireframe: true,
    transparent: true,
    opacity: 0.15
  });
  const coreMesh = new THREE.Mesh(sphereGeo, wireMat);
  scene.add(coreMesh);

  // Outer glowing points
  const pointsGeo = new THREE.SphereGeometry(2.1, 16, 16);
  const pointsMat = new THREE.PointsMaterial({
    color: 0x00d4ff,
    size: 0.08,
    transparent: true,
    opacity: 0.7
  });
  const pointsMesh = new THREE.Points(pointsGeo, pointsMat);
  scene.add(pointsMesh);

  window.addEventListener('resize', () => {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  });

  const animate = () => {
    requestAnimationFrame(animate);
    coreMesh.rotation.y += 0.005;
    coreMesh.rotation.x += 0.003;
    pointsMesh.rotation.y -= 0.003;
    renderer.render(scene, camera);
  };
  animate();
};

/* =========================================================================
   S8: STATS COUNTERS
   ========================================================================= */
const initStatsCounters = () => {
  const statElements = document.querySelectorAll('.stat-card');
  
  statElements.forEach(card => {
    const numEl = card.querySelector('.stat-number');
    const target = parseInt(card.getAttribute('data-target'));
    const suffix = card.getAttribute('data-suffix') || '';

    gsap.fromTo(numEl, 
      { textContent: 0 },
      {
        textContent: target,
        duration: 2.5,
        ease: 'power3.out',
        snap: { textContent: 1 },
        scrollTrigger: {
          trigger: card,
          start: 'top 85%'
        },
        onUpdate: function() {
          numEl.textContent = Math.ceil(numEl.textContent).toLocaleString() + suffix;
        }
      }
    );
  });
};

/* =========================================================================
   S9: TESTIMONIALS SLIDER
   ========================================================================= */
const testimonials = [
  { quote: "ExportHub made our medical supply imports from India seamless. Fast customs and clear documentation.", author: "Alexander Ivanov", company: "MedRussia Group, Moscow", stars: 5 },
  { quote: "Outstanding service. The Basmati Rice and organic spices were top quality, and the shipping arrived exactly on time.", author: "Tariq Al-Mansoor", company: "Amana Trading, Dubai", stars: 5 },
  { quote: "Very professional communication. Inspecting specifications directly online before ordering gave us huge confidence.", author: "Dieter Schmidt", company: "EuroMedical AG, Germany", stars: 5 },
  { quote: "Flexible payment terms, rigorous standards compliance. Easily our most trusted supply partner.", author: "Robert Chen", company: "Prime Foods LLC, USA", stars: 5 }
];

let activeTestimonialIdx = 0;

const initTestimonials = () => {
  const track = document.getElementById('testimonials-track');
  const dotsContainer = document.getElementById('tctl-dots');
  if (!track || !dotsContainer) return;

  track.innerHTML = '';
  dotsContainer.innerHTML = '';

  testimonials.forEach((t, idx) => {
    const card = document.createElement('div');
    card.className = 'testimonial-card';
    card.innerHTML = `
      <p class="t-quote">"${t.quote}"</p>
      <div class="t-author">
        <div class="t-avatar">${t.author.substring(0,2).toUpperCase()}</div>
        <div>
          <div class="t-name">${t.author}</div>
          <div class="t-company">${t.company}</div>
          <div class="t-stars">${'★'.repeat(t.stars)}</div>
        </div>
      </div>
    `;
    track.appendChild(card);

    const dot = document.createElement('div');
    dot.className = `tctl-dot ${idx === 0 ? 'active' : ''}`;
    dot.onclick = () => jumpToTestimonial(idx);
    dotsContainer.appendChild(dot);
  });

  updateTestimonialSlider();
};

const updateTestimonialSlider = () => {
  const track = document.getElementById('testimonials-track');
  const dots = document.querySelectorAll('.tctl-dot');
  if (!track) return;

  const cardWidth = track.firstElementChild.clientWidth + 24; // Width + gap
  track.style.transform = `translateX(-${activeTestimonialIdx * cardWidth}px)`;

  dots.forEach((dot, idx) => {
    dot.classList.toggle('active', idx === activeTestimonialIdx);
  });
};

window.nextTestimonial = () => {
  activeTestimonialIdx = (activeTestimonialIdx + 1) % testimonials.length;
  updateTestimonialSlider();
};

window.prevTestimonial = () => {
  activeTestimonialIdx = (activeTestimonialIdx - 1 + testimonials.length) % testimonials.length;
  updateTestimonialSlider();
};

const jumpToTestimonial = (idx) => {
  activeTestimonialIdx = idx;
  updateTestimonialSlider();
};

/* =========================================================================
   S10: CONTACT MAP & MARKER
   ========================================================================= */
const initContactMap = () => {
  const canvas = document.getElementById('contact-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 15);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  // Glowing tech hemisphere centering on India
  const geo = new THREE.SphereGeometry(5, 32, 32);
  const mat = new THREE.MeshBasicMaterial({
    color: 0x051b36,
    wireframe: true,
    transparent: true,
    opacity: 0.3
  });
  const sphere = new THREE.Mesh(geo, mat);
  // Pre-rotate to center India view
  sphere.rotation.y = Math.PI * 0.45;
  sphere.rotation.x = Math.PI * 0.12;
  scene.add(sphere);

  // Add glowing points for cities/offices
  const markerGeo = new THREE.SphereGeometry(0.2, 16, 16);
  const markerMat = new THREE.MeshBasicMaterial({ color: 0x00ffea });
  const marker = new THREE.Mesh(markerGeo, markerMat);
  marker.position.set(0.2, 1.8, 4.6); // approximate coordinates pointing outwards
  sphere.add(marker);

  window.addEventListener('resize', () => {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  });

  const animate = () => {
    requestAnimationFrame(animate);
    sphere.rotation.y += 0.002;
    renderer.render(scene, camera);
  };
  animate();
};

/* =========================================================================
   TOAST MESSAGE & SUBMISSIONS
   ========================================================================= */
window.showToast = (msg) => {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.innerText = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
};

window.submitForm = (e) => {
  e.preventDefault();
  showToast('Inquiry sent successfully! Our expert will reply within 24 hours.');
  e.target.reset();
};

// Hamburger mobile nav trigger
document.getElementById('hamburger').onclick = () => {
  const links = document.querySelector('.nav-links');
  if (links) links.style.display = links.style.display === 'flex' ? 'none' : 'flex';
};

/* =========================================================================
   INIT ALL
   ========================================================================= */
window.addEventListener('DOMContentLoaded', () => {
  initHeroGlobe();
  initTradeNetwork();
  initContainerPort();
  initWarehouse();
  initProductViewer();
  initLogisticsJourney();
  initAIAvatar();
  initStatsCounters();
  initTestimonials();
  initContactMap();
});
