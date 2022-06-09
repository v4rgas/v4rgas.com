const video = document.getElementById('video');
const cont = document.getElementById('container');
const btn = document.getElementById('button');
video.loop = true;

const rick = () => {
  document.body.classList.add('black');
  btn.hidden = true;
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
