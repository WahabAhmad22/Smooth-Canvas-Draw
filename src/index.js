function loadScript(url, ele) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = resolve;
    script.onerror = reject;
    if (ele === undefined) {
      document.querySelector('body').appendChild(script);
    } else {
      if (document.querySelector(ele)) {
        document.querySelector('body').appendChild(script);
      }
    }
  });
}

let canvasObject = eval('canvasSettings');
console.log(canvasObject.strokeWidth);
console.log(canvasObject.strokeColors);
handleDrawing();
function handleDrawing() {
  let canvas = document.querySelector('#drawing-canvas');
  if (!canvas) return;
  loadScript('https://cdn.jsdelivr.net/npm/konva@8.2.2/konva.min.js').then(() => {
    function getRandomColor() {
      let colors = canvasObject.strokeColors;
      let randomIndex = Math.floor(Math.random() * colors.length);
      return colors[randomIndex];
    }
    let stage = new Konva.Stage({
      container: 'drawing-canvas',
      width: window.innerWidth,
      height: window.innerHeight,
    });

    let layer = new Konva.Layer();
    stage.add(layer);

    let isDrawing = false;
    let lastLine;
    let strokeColor = '#83D49B';
    // Start drawing immediately on mouse move
    stage.on('mousemove touchmove', function (e) {
      let pos = stage.getPointerPosition();
      if (!isDrawing) {
        isDrawing = true;
        strokeColor = getRandomColor();
        lastLine = new Konva.Line({
          stroke: strokeColor, // Set stroke color to a random color
          strokeWidth: canvasObject.strokeWidth,
          lineCap: 'round', // Set line cap to round
          lineJoin: 'round', // Set line join to round
          points: [pos.x, pos.y],
        });
        layer.add(lastLine);
      } else {
        let newPoints = lastLine.points().concat([pos.x, pos.y]);
        lastLine.points(newPoints);
        layer.batchDraw();
      }
    });

    // Function to animate line removal
    function animateLineRemoval(line) {
      let points = line.points();

      function removeFirstPoint() {
        if (points.length <= 2) {
          line.remove();
          layer.batchDraw();
          return;
        }

        points = points.slice(2);
        line.points(points);
        layer.batchDraw();

        requestAnimationFrame(removeFirstPoint);
      }

      removeFirstPoint();
    }

    stage.on('mousedown touchstart', function () {
      if (lastLine) {
        animateLineRemoval(lastLine);
        lastLine = null;
        isDrawing = false;
      }
    });
  });
  // Handle Falling/Popup Elements

  document.querySelector('[section-canvas]').addEventListener('click', function (event) {
    handleIllustrations(event);
  });

  let wrapper = document.querySelector('[illustrations-wrapper]');
  let illustrationImages = wrapper.querySelectorAll('.illustration');
  wrapper.style.pointerEvents = 'none';
  illustrationImages.forEach((img) => {
    img.classList.add('hide');
    img.style.position = 'absolute';
  });
  function handleIllustrations(event) {
    // Select a random illustration to clone
    let illustrationClone =
      illustrationImages[Math.floor(Math.random() * illustrationImages.length)].cloneNode(true);
    illustrationClone.classList.remove('hide');

    // Set the initial position of the cloned illustration to the click position
    illustrationClone.style.left = `${event.clientX}px`;
    illustrationClone.style.top = `${event.clientY}px`;
    illustrationClone.style.display = 'block';
    illustrationClone.style.height = `${Math.random() * (canvasObject.icon_max_size - canvasObject.icon_min_size) + canvasObject.icon_min_size}rem`;
    // Append the cloned illustration to the wrapper
    wrapper.appendChild(illustrationClone);

    // GSAP animation
    gsap.set(illustrationClone, { y: -100, scale: 0, opacity: 1 }); // Start above the screen
    let tl = gsap.timeline();
    tl.to(illustrationClone, {
      duration: 0.5,
      scale: 1,
      ease: 'power1.in',
      opacity: 1,
    }).to(
      illustrationClone,
      {
        delay: 0.5,
        scale: 1,
        duration: Math.random() * (2 - 1.5) + 1.5, // Random duration between 1.5 and 2 seconds
        y: wrapper.offsetHeight + 200, // Move down below the screen
        ease: 'power1.in',
        rotate: Math.random() < 0.5 ? '80deg' : '-80deg',
        onComplete: () => {
          gsap.to(illustrationClone, {
            duration: 0.25,
            opacity: 0,
            onComplete: () => {
              illustrationClone.remove();
            },
          });
        },
      },
      '<'
    );
  }
}
