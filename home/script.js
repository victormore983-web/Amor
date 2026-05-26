
const progress = document.getElementById('progress');
const progressIcon = document.getElementById('progress-icon');
const progressPercent = document.getElementById('progress-percent');
const loadingText = document.getElementById('loading-text');
const body = document.body;

let progressValue = 0;
const interval = 50;
const maxProgress = 100;

function calculateGradientColor(progress) {
  const baseColor = 255;
  const red = baseColor;
  const greenBlue = baseColor - Math.floor((progress / 100) * baseColor);
  return `linear-gradient(90deg, white 0%, rgb(${red}, ${greenBlue}, ${greenBlue}) ${progress}%)`;
}

function updateProgress() {
  if (progressValue <= maxProgress) {
    progress.style.width = `${progressValue}%`;
    progressIcon.style.left = `${progressValue}%`;
    progress.style.background = calculateGradientColor(progressValue);

    // Hiển thị phần trăm
    progressPercent.textContent = `${progressValue}%`;
    progressValue++;
  } else {
    clearInterval(progressInterval);

    // Khi hoàn thành loading, thêm lớp "hidden" vào body
    setTimeout(() => {
      progress.style.width = '100%';
      progressIcon.style.left = '100%';
      progress.style.background = 'linear-gradient(90deg, white 0%, red 100%)';
      progressPercent.textContent = '100%';
      loadingText.textContent = 'MAP LOADED!';

      // Ẩn toàn bộ màn hình
      document.querySelector('.loading-container').classList.add('hidden');
    }, 500);
  }
}

// Cập nhật mỗi khoảng thời gian
const progressInterval = setInterval(updateProgress, interval);

// Hiển thị ảnh sau 10 giây
setTimeout(() => {
  const delayedImage = document.getElementById('delayed-image');
  delayedImage.style.display = 'block';
}, 6000);

var settings = {
  pas: {
    length: 2000,
    duration: 2,
    velocity: 100,
    effect: -1,
    size: 10,
  },
};


(function () {
  var b = 0;
  var c = ["ms", "moz", "webkit", "o"];
  for (var a = 0; a < c.length && !window.requestAnimationFrame; ++a) {
    window.requestAnimationFrame = window[c[a] + "RequestAnimationFrame"];
    window.cancelAnimationFrame =
      window[c[a] + "CancelAnimationFrame"] ||
      window[c[a] + "CancelRequestAnimationFrame"];
  }
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function (h, e) {
      var d = new Date().getTime();
      var f = Math.max(0, 16 - (d - b));
      var g = window.setTimeout(function () {
        h(d + f);
      }, f);
      b = d + f;
      return g;
    };
  }
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function (d) {
      clearTimeout(d);
    };
  }
})();

var Point = (function () {
  function Point(x, y) {
    this.x = typeof x !== "undefined" ? x : 0;
    this.y = typeof y !== "undefined" ? y : 0;
  }
  Point.prototype.clone = function () {
    return new Point(this.x, this.y);
  };
  Point.prototype.length = function (length) {
    if (typeof length == "undefined")
      return Math.sqrt(this.x * this.x + this.y * this.y);
    this.normalize();
    this.x *= length;
    this.y *= length;
    return this;
  };
  Point.prototype.normalize = function () {
    var length = this.length();
    this.x /= length;
    this.y /= length;
    return this;
  };
  return Point;
})();


var Pa = (function () {
  function Pa() {
    this.position = new Point();
    this.velocity = new Point();
    this.acceleration = new Point();
    this.age = 0;
  }
  Pa.prototype.initialize = function (x, y, dx, dy) {
    this.position.x = x;
    this.position.y = y;
    this.velocity.x = dx;
    this.velocity.y = dy;
    this.acceleration.x = dx * settings.pas.effect;
    this.acceleration.y = dy * settings.pas.effect;
    this.age = 0;
  };
  Pa.prototype.update = function (deltaTime) {
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    this.velocity.x += this.acceleration.x * deltaTime;
    this.velocity.y += this.acceleration.y * deltaTime;
    this.age += deltaTime;
  };
  Pa.prototype.draw = function (context, image) {
    function ease(t) {
      return --t * t * t + 1;
    }
    var size = image.width * ease(this.age / settings.pas.duration);
    context.globalAlpha = 1 - this.age / settings.pas.duration;
    context.drawImage(
      image,
      this.position.x - size / 2,
      this.position.y - size / 2,
      size,
      size
    );
  };
  return Pa;
})();

var PaPool = (function () {
  var pas,
    firstActive = 0,
    firstFree = 0,
    duration = settings.pas.duration;

  function PaPool(length) {
    pas = new Array(length);
    for (var i = 0; i < pas.length; i++) pas[i] = new Pa();
  }
  PaPool.prototype.add = function (x, y, dx, dy) {
    pas[firstFree].initialize(x, y, dx, dy);
    firstFree++;
    if (firstFree == pas.length) firstFree = 0;
    if (firstActive == firstFree) firstActive++;
    if (firstActive == pas.length) firstActive = 0;
  };
  PaPool.prototype.update = function (deltaTime) {
    var i;
    if (firstActive < firstFree) {
      for (i = firstActive; i < firstFree; i++) pas[i].update(deltaTime);
    }
    if (firstFree < firstActive) {
      for (i = firstActive; i < pas.length; i++) pas[i].update(deltaTime);
      for (i = 0; i < firstFree; i++) pas[i].update(deltaTime);
    }
    while (pas[firstActive].age >= duration && firstActive != firstFree) {
      firstActive++;
      if (firstActive == pas.length) firstActive = 0;
    }
  };
  PaPool.prototype.draw = function (context, image) {
    if (firstActive < firstFree) {
      for (i = firstActive; i < firstFree; i++) pas[i].draw(context, image);
    }
    if (firstFree < firstActive) {
      for (i = firstActive; i < pas.length; i++) pas[i].draw(context, image);
      for (i = 0; i < firstFree; i++) pas[i].draw(context, image);
    }
  };
  return PaPool;
})();

(function (canvas) {
  var context = canvas.getContext("2d"),
    pas = new PaPool(settings.pas.length),
    paRate = settings.pas.length / settings.pas.duration,
    time;
// hiệu úng trái tym động
    function pointOnHeart(t) {

      var isMobile = window.innerWidth < 768;
      var scale = isMobile ? 0.5 : 1;

      return new Point(
        160 * scale * Math.pow(Math.sin(t), 3),
        130 * scale * Math.cos(t) -
          50 * scale * Math.cos(2 * t) -
          20 * scale * Math.cos(3 * t) -
          10 * scale * Math.cos(4 * t) +
          25 * scale
      );
    }

    function to(t) {
      var isMobile = window.innerWidth < 768;
      var scaleFactor = isMobile ? 700 : 350;
      var point = pointOnHeart(t);
      point.x = settings.pas.size / 2 + (point.x * settings.pas.size) / scaleFactor;
      point.y = settings.pas.size / 2 - (point.y * settings.pas.size) / scaleFactor;
      return point;
    }

// end
  var image = (function () {
    var canvas = document.createElement("canvas"),
      context = canvas.getContext("2d");
    canvas.width = settings.pas.size;
    canvas.height = settings.pas.size;

    function to(t) {
      var point = pointOnHeart(t);
      point.x = settings.pas.size / 2 + (point.x * settings.pas.size) / 350;
      point.y = settings.pas.size / 2 - (point.y * settings.pas.size) / 350;
      return point;
    }

    context.beginPath();
    var t = -Math.PI;
    var point = to(t);
    context.moveTo(point.x, point.y);
    while (t < Math.PI) {
      t += 0.01;
      point = to(t);
      context.lineTo(point.x, point.y);
    }
    context.closePath();
    context.fillStyle = "#e81017";
    context.fill();
    var image = new Image();
    image.src = canvas.toDataURL();
    return image;
  })();

  function render() {
    requestAnimationFrame(render);
    var newTime = new Date().getTime() / 1000,
      deltaTime = newTime - (time || newTime);
    time = newTime;
    context.clearRect(0, 0, canvas.width, canvas.height);
    var amount = paRate * deltaTime;
    for (var i = 0; i < amount; i++) {
      var pos = pointOnHeart(Math.PI - 2 * Math.PI * Math.random());
      var dir = pos.clone().length(settings.pas.velocity);
      pas.add(
        canvas.width / 2 + pos.x,
        canvas.height / 2 - pos.y,
        dir.x,
        -dir.y
      );
    }
    pas.update(deltaTime);
    pas.draw(context, image);
  }

  function onResize() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }
  window.onresize = onResize;
  setTimeout(function () {
    onResize();
    render();
  }, 6000);
})(document.getElementById("pinkboard"));


document.addEventListener("DOMContentLoaded", function () {
  // Chọn các phần tử
  const textElement = document.querySelector('.text');
  const text1Element = document.querySelector('.text1');

  // Hiển thị .text
  setTimeout(() => {
    textElement.classList.add('show');
  }, 6000);

  // Hiển thị .text1
  setTimeout(() => {
    text1Element.classList.add('show');
  }, 6000);
});

const heartRain = document.querySelector('.heart-rain');

function createHeart() {
  const heart = document.createElement('div');
  heart.classList.add('heart');

  // Đặt vị trí ngẫu nhiên cho trái tim
  heart.style.left = Math.random() * window.innerWidth + 'px';

  // Thay đổi kích thước ngẫu nhiên
  const size = Math.random() * 10 + 10 + 'px';
  heart.style.width = size;
  heart.style.height = size;

  // Thời gian rơi ngẫu nhiên
  heart.style.animationDuration = Math.random() * 2 + 3 + 's';

  heartRain.appendChild(heart);

  // Xóa trái tim sau khi nó rơi xong
  setTimeout(() => {
    heart.remove();
  }, 5000);
}

// Tạo trái tim mới mỗi 300ms
setInterval(createHeart, 300);

setTimeout(() => {
  const heartRain = document.querySelector('.heart-rain');
  heartRain.classList.add('show');
}, 6000);

// thơi gian hiển thị của text valentino
setTimeout(function() {
  document.getElementById("valentine-text").style.display = "block";
}, 6000);
document.addEventListener("DOMContentLoaded", function() {
  setTimeout(function() {
      document.querySelector(".gift-button").style.display = "block";
  }, 8000);
});
