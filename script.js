const songs = [
  { name: "Song 1", link: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", artists: "Artist 1" },
  { name: "Song 2", link: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", artists: "Artist 2" }
];

const progress = document.querySelector("#progress");
const song = document.querySelector("#song");
const playBtn = document.querySelector("#play");
const title = document.querySelector("#title");
const artist = document.querySelector("#musician");
const start = document.querySelector("#start");
const end = document.querySelector("#end");
const volume = document.querySelector("#volume");
const playlist = document.querySelector("#playlist");
const shuffleBtn = document.querySelector("#shuffle");
const repeatBtn = document.querySelector("#repeat");
const fileUpload = document.querySelector("#file-upload");

let index = 0;
let isShuffle = false;
let isRepeat = false;
let animationFrame;

function loadSong(i) {
  const track = songs[i];
  song.src = track.link;
  title.textContent = track.name;
  artist.textContent = track.artists;
  song.load();
  updatePlaylist();
}

function playSong() {
  song.play().then(() => {
    playBtn.classList.add("playing");
    updateProgress();
  }).catch(() => alert("Can't play song. Upload a valid file."));
}

function pauseSong() {
  song.pause();
  playBtn.classList.remove("playing");
  cancelAnimationFrame(animationFrame);
}

function updateProgress() {
  if (song.duration) {
    progress.value = (song.currentTime / song.duration) * 100;
    start.textContent = formatTime(song.currentTime);
    end.textContent = formatTime(song.duration);
  }
  if (!song.paused) {
    animationFrame = requestAnimationFrame(updateProgress);
  }
}

function formatTime(sec) {
  const min = Math.floor(sec / 60);
  const secs = Math.floor(sec % 60);
  return `${min.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function updatePlaylist() {
  playlist.innerHTML = "";
  songs.forEach((track, i) => {
    const div = document.createElement("div");
    div.textContent = `${track.name} - ${track.artists}`;
    div.onclick = () => {
      index = i;
      loadSong(index);
      playSong();
    };
    if (i === index) div.classList.add("active");
    playlist.appendChild(div);
  });
}

function nextPlay() {
  index = isShuffle ? Math.floor(Math.random() * songs.length) : (index + 1) % songs.length;
  loadSong(index);
  playSong();
}

function prevPlay() {
  index = (index - 1 + songs.length) % songs.length;
  loadSong(index);
  playSong();
}

function toggleShuffle() {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle("active", isShuffle);
}

function toggleRepeat() {
  isRepeat = !isRepeat;
  repeatBtn.classList.toggle("active", isRepeat);
}

function handleFileUpload(event) {
  const files = event.target.files;
  for (let file of files) {
    if (file.type.startsWith("audio/")) {
      songs.push({
        name: file.name.replace(/\.[^/.]+$/, ""),
        link: URL.createObjectURL(file),
        artists: "Unknown Artist"
      });
    }
  }
  updatePlaylist();
  if (files.length > 0) {
    index = songs.length - 1;
    loadSong(index);
    playSong();
  }
}

playBtn.addEventListener("click", () => {
  if (song.paused) playSong();
  else pauseSong();
});

progress.addEventListener("input", () => {
  if (song.duration) {
    song.currentTime = (progress.value / 100) * song.duration;
    updateProgress();
  }
});

volume.addEventListener("input", () => {
  song.volume = volume.value;
});

song.addEventListener("loadedmetadata", () => {
  end.textContent = formatTime(song.duration);
});

song.addEventListener("timeupdate", updateProgress);

song.addEventListener("ended", () => {
  if (isRepeat) playSong();
  else nextPlay();
});

fileUpload.addEventListener("change", handleFileUpload);

// Initial load
loadSong(index);
updatePlaylist();
