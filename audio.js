var isPlaying = false;
var music = new Audio("audio/music_one.mp3");
music.loop = true;

document.getElementById("musicButton").addEventListener("click", function () {
  if (isPlaying) {
    document.getElementById("speakerImage").src = "image/speakerOff.png";
    speakerImage.title = "Нажмите, чтобы включить звук";
    music.pause();
  } else {
    document.getElementById("speakerImage").src = "image/speakerOn.png";
    speakerImage.title = "Нажмите, чтобы выключить звук";
    music.play();
  }
  isPlaying = !isPlaying;
});

window.addEventListener("hashchange", function () {
  if (location.hash === "#gamePage") {
    music.pause();
    isPlaying = false;
  }
});

export const startSound = new Audio("audio/play.mp3");
export const pauseSound = new Audio("audio/pause.mp3");
export const brickSound = document.getElementById("brickSound");
export const rocketSound = document.getElementById("rocketSound");
export const brickHitSound = document.getElementById("brickHitSound");
export const levelUpSound = document.getElementById("levelUpSound");
export const gameOverSound = document.getElementById("gameOverSound");

export function playSound(sound) {
  sound.currentTime = 0;
  sound.play();
}