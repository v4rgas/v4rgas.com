const video = document.getElementById('video');
video.loop = true;

document.addEventListener('click', () => {
  video.play();
}, true);

document.addEventListener('keydown', () => {
  video.play();
}, true);
