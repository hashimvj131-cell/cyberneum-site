(function () {
  "use strict";

  var container = document.getElementById("hero-3d");
  if (!container || typeof THREE === "undefined") return;

  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Desktop-only progressive enhancement: on narrow/short viewports the scene has no
  // room to read well, and mobile GPUs/battery shouldn't pay for a decorative extra.
  // The existing CSS gradient glow remains as the base hero background either way.
  if (window.matchMedia && window.matchMedia("(max-width: 860px)").matches) return;

  var supportsWebGL = (function () {
    try {
      var c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
    } catch (e) {
      return false;
    }
  })();
  if (!supportsWebGL) return;

  var width = container.clientWidth;
  var height = container.clientHeight;

  var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 0, 9);

  scene.add(new THREE.AmbientLight(0xaab0ff, 1.1));

  var blueLight = new THREE.PointLight(0x3d7bff, 18, 25);
  blueLight.position.set(-4, 2, 5);
  scene.add(blueLight);

  var pinkLight = new THREE.PointLight(0xff2e9f, 16, 25);
  pinkLight.position.set(4, -2, 5);
  scene.add(pinkLight);

  var purpleLight = new THREE.PointLight(0x7b2ff7, 14, 22);
  purpleLight.position.set(0, 3, 2);
  scene.add(purpleLight);

  var group = new THREE.Group();
  scene.add(group);

  var palette = [0x3d7bff, 0x7b2ff7, 0xff2e9f, 0x5a8bff, 0x9a5cf9];

  function makeDrive(width_, height_, depth_, color, hasNub) {
    var g = new THREE.Group();
    var bodyGeo = new THREE.BoxGeometry(width_, height_, depth_);
    var bodyMat = new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.4,
      roughness: 0.35,
      emissive: color,
      emissiveIntensity: 0.85
    });
    var body = new THREE.Mesh(bodyGeo, bodyMat);
    g.add(body);

    var edgesGeo = new THREE.EdgesGeometry(bodyGeo);
    var edgesMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });
    g.add(new THREE.LineSegments(edgesGeo, edgesMat));

    if (hasNub) {
      var nubGeo = new THREE.BoxGeometry(width_ * 0.32, height_ * 0.28, depth_ * 0.5);
      var nubMat = new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.5,
        roughness: 0.3,
        emissive: color,
        emissiveIntensity: 0.7
      });
      var nub = new THREE.Mesh(nubGeo, nubMat);
      nub.position.set(width_ / 2 + width_ * 0.16, 0, 0);
      g.add(nub);
    }

    return g;
  }

  var drives = [];
  var configs = [
    { w: 2.2, h: 1.45, d: 0.2, x: 4.4, y: 1.2, z: -1, nub: false },
    { w: 1.4, h: 0.5, d: 0.5, x: 6.8, y: -0.5, z: 0.5, nub: true },
    { w: 1.8, h: 1.15, d: 0.16, x: 6.6, y: 1.9, z: -2, nub: false },
    { w: 1.1, h: 0.4, d: 0.4, x: 4.6, y: -1.7, z: 1, nub: true },
    { w: 1.5, h: 1.0, d: 0.14, x: 5.6, y: 0.1, z: -3, nub: false }
  ];

  configs.forEach(function (cfg, i) {
    var color = palette[i % palette.length];
    var drive = makeDrive(cfg.w, cfg.h, cfg.d, color, cfg.nub);
    drive.position.set(cfg.x, cfg.y, cfg.z);
    drive.rotation.set(Math.random() * 0.6 - 0.3, Math.random() * 1.2 - 0.6, Math.random() * 0.5 - 0.25);
    drive.userData.floatOffset = Math.random() * Math.PI * 2;
    drive.userData.floatSpeed = 0.4 + Math.random() * 0.3;
    drive.userData.baseY = cfg.y;
    group.add(drive);
    drives.push(drive);
  });

  var particleCount = 220;
  var positions = new Float32Array(particleCount * 3);
  for (var p = 0; p < particleCount; p++) {
    positions[p * 3] = (Math.random() - 0.5) * 16;
    positions[p * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[p * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
  }
  var particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  var particleMat = new THREE.PointsMaterial({ color: 0x9fb4ff, size: 0.035, transparent: true, opacity: 0.55 });
  var particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  var mouseX = 0;
  var mouseY = 0;
  var targetRotX = 0;
  var targetRotY = 0;

  container.parentElement.addEventListener("mousemove", function (e) {
    var rect = container.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) / rect.width - 0.5;
    mouseY = (e.clientY - rect.top) / rect.height - 0.5;
    targetRotY = mouseX * 0.5;
    targetRotX = mouseY * 0.3;
  });

  var visible = true;
  document.addEventListener("visibilitychange", function () {
    visible = !document.hidden;
  });

  var clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    if (!visible) return;

    var t = clock.getElapsedTime();

    group.rotation.y += (targetRotY - group.rotation.y) * 0.04;
    group.rotation.x += (targetRotX - group.rotation.x) * 0.04;
    group.rotation.y += 0.0015;

    drives.forEach(function (d) {
      d.position.y = d.userData.baseY + Math.sin(t * d.userData.floatSpeed + d.userData.floatOffset) * 0.18;
      d.rotation.y += 0.0025;
    });

    particles.rotation.y = t * 0.01;

    renderer.render(scene, camera);
  }
  animate();

  function onResize() {
    var w = container.clientWidth;
    var h = container.clientHeight;
    if (w === 0 || h === 0) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener("resize", onResize);
})();
