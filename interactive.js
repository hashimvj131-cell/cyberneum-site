(function () {
  "use strict";

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  var TILT_MAX_DEG = 8;
  var LIFT_PX = 6;

  function enableTilt(el) {
    var raf = null;

    function onMove(e) {
      var rect = el.getBoundingClientRect();
      var px = (e.clientX - rect.left) / rect.width - 0.5;
      var py = (e.clientY - rect.top) / rect.height - 0.5;
      var rx = (-py * TILT_MAX_DEG).toFixed(2);
      var ry = (px * TILT_MAX_DEG).toFixed(2);

      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        el.style.transition = "transform 0.08s linear";
        el.style.transform =
          "perspective(900px) rotateX(" + rx + "deg) rotateY(" + ry + "deg) translateY(-" + LIFT_PX + "px)";
      });
    }

    function onLeave() {
      if (raf) cancelAnimationFrame(raf);
      el.style.transition = "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)";
      el.style.transform = "";
    }

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
  }

  function init() {
    var targets = document.querySelectorAll(".card, .pick, .video-card");
    for (var i = 0; i < targets.length; i++) {
      enableTilt(targets[i]);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
