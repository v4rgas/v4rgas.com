const video = document.getElementById('video');
const cont = document.getElementById('container');
const main = document.getElementById('main');
video.loop = true;

const rick = () => {
  document.body.classList.add('black');
  main.hidden = true;
  cont.hidden = false;
  video.play();
};

document.addEventListener('click', () => {
  rick();
}, true);

document.addEventListener('keydown', () => {
  rick();
}, true);

document.addEventListener('scroll', () => {
  video.play();
}, true);
