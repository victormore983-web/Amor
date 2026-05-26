document.getElementById("playButton").addEventListener("click", function() {
  document.getElementById("videoOverlay").style.display = "flex";
});

function closeVideo() {
  document.getElementById("videoOverlay").style.display = "none";
  document.getElementById("videoPlayer").pause();

  // Ẩn nút play và chữ "Ấn vào nút play", hiển thị hộp quà và chữ "Ấn vào hộp quà"
  document.getElementById("playButton").style.display = "none";
  document.getElementById("playText").style.display = "none";
  document.getElementById("giftBox").style.display = "block";
  document.getElementById("giftText").style.display = "block";
}

// Chuyển hướng khi nhấn vào hộp quà
document.getElementById("giftBox").addEventListener("click", function() {
  window.location.href = "../loichuc/index.html";
});

// hiệu ứng mưa tym
function createHeart() {
  const heart = document.createElement("div");
  heart.innerHTML = '<img src="../img/tym.png" alt="heart image" style="width: 30px; height: 30px;">';
  heart.classList.add("falling-heart");

  // Chọn vùng chứa trái tim (phải có id="heart-container" trong HTML)
  const container = document.getElementById("heart-container");
  container.appendChild(heart);

  // Giới hạn vị trí trái tim chỉ trong vùng chứa
  const containerWidth = container.clientWidth;
  const left = Math.random() * containerWidth;

  // Kích thước và thời gian rơi ngẫu nhiên
  const duration = Math.random() * 3 + 2;
  const size = Math.random() * 20 + 10;

  heart.style.left = `${left}px`;
  heart.style.width = `${size}px`;
  heart.style.animationDuration = `${duration}s`;

  // Xóa trái tim sau khi rơi
  setTimeout(() => {
      heart.remove();
  }, duration * 1000);
}

setInterval(createHeart, 200);
