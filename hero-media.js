(function () {
  "use strict";

  var container = document.getElementById("hero-media");
  if (!container) return;

  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  if (navigator.connection && navigator.connection.saveData) return;

  var sources = ["videos/hero-bg-1.mp4", "videos/hero-bg-2.mp4"];
  var videos = sources.map(function (src) {
    var v = document.createElement("video");
    v.src = src;
    v.muted = true;
    v.playsInline = true;
    v.preload = "auto";
    container.insertBefore(v, container.firstChild);
    return v;
  });

  var scrim = document.createElement("div");
  scrim.className = "hero-media-scrim";
  container.appendChild(scrim);

  var current = 0;

  function play(index) {
    videos.forEach(function (v, i) {
      if (i === index) {
        v.classList.add("active");
        v.currentTime = 0;
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
      } else {
        v.classList.remove("active");
      }
    });
  }

  videos.forEach(function (v, i) {
    v.addEventListener("ended", function () {
      current = (current + 1) % videos.length;
      play(current);
    });
  });

  play(current);
})();
