export default class Player {
  constructor(playerSelector, tracks = []) {
    this.playerSelector = playerSelector;
    this.player = document.querySelector(playerSelector);
    this.tracks = tracks;
    this.currentTrack = 0;
    this.volume = 0.05;
    this.mousedown = false;
    this.audio = new Audio();
  }

  static formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');

    return `${minutes}:${seconds}`;
  }

  getElement(element) {
    return this.player.querySelector(`.player__${element}`);
  }

  getState() {
    return {
      prevTrack: this.tracks[this.currentTrack - 1] || this.tracks[this.tracks.length - 1],
      currentTrack: this.tracks[this.currentTrack],
      nextTrack: this.tracks[this.currentTrack + 1] || this.tracks[0],
    };
  }

  setUp() {
    this.audio.src = this.tracks[this.currentTrack].url;
  }

  render() {
    const currentTime = this.getElement('currentTime');
    const duration = this.getElement('duration');
    const artist = this.getElement('artist');
    const title = this.getElement('title');
    const img = this.getElement('img');
    const imgPrev = this.getElement('imgPrev');
    const imgNext = this.getElement('imgNext');

    const { prevTrack, currentTrack, nextTrack } = this.getState();

    artist.textContent = currentTrack.artist;
    title.textContent = currentTrack.title;
    img.src = currentTrack.img;
    imgPrev.src = prevTrack.img;
    imgNext.src = nextTrack.img;
    currentTime.textContent = Player.formatTime(this.audio.currentTime);
    duration.textContent = Player.formatTime(this.audio.duration);
    this.audio.volume = this.volume;
  }

  handlePlayback() {
    const action = this.audio.paused ? 'play' : 'pause';

    this.audio[action]();
  }

  changePlayButton(e) {
    const audio = e.target;
    const icon = audio.paused ? '#play-icon' : '#pause-icon';

    this.getElement('playIcon').setAttribute('href', icon);
  }

  changeCurrentTime() {
    this.getElement('currentTime').textContent = Player.formatTime(this.audio.currentTime);
  }

  fillProgress() {
    const progress = this.getElement('progress');

    progress.style.setProperty('--progress', `${progress.value}%`);
  }

  changeProgress() {
    if (!this.mousedown) {
      const progressPercent = (((this.audio.currentTime / this.audio.duration) * 100) || 0)
        .toFixed(3);

      const progress = this.getElement('progress');

      progress.value = progressPercent;
      this.fillProgress();
    }
  }

  changePosition() {
    const newPosition = (this.getElement('progress').value * this.audio.duration) / 100;

    this.audio.currentTime = newPosition;
  }

  setTrack(direction) {
    if (direction === 'next') {
      this.currentTrack = this.tracks[this.currentTrack + 1]
        ? this.currentTrack + 1
        : 0;
    }

    if (direction === 'prev') {
      this.currentTrack = this.tracks[this.currentTrack - 1]
        ? this.currentTrack - 1
        : this.tracks.length - 1;
    }
  }

  changeTrack(e) {
    const isPlayed = !this.audio.paused;
    const changeDirection = e.currentTarget.dataset.change;

    this.setTrack(changeDirection);
    this.setUp();

    if (isPlayed) this.audio.play();
  }

  init() {
    const progress = this.getElement('progress');
    const play = this.getElement('play');
    const next = this.getElement('next');
    const prev = this.getElement('prev');

    this.setUp();

    this.audio.addEventListener('loadedmetadata', this.render.bind(this));

    play.addEventListener('click', this.handlePlayback.bind(this));

    this.audio.addEventListener('play', this.changePlayButton.bind(this));
    this.audio.addEventListener('pause', this.changePlayButton.bind(this));

    this.audio.addEventListener('timeupdate', this.changeCurrentTime.bind(this));
    this.audio.addEventListener('timeupdate', this.changeProgress.bind(this));

    progress.addEventListener('input', this.fillProgress.bind(this));
    progress.addEventListener('change', this.changePosition.bind(this));
    progress.addEventListener('mousedown', () => { this.mousedown = true; });
    progress.addEventListener('mouseup', () => { this.mousedown = false; });
    progress.addEventListener('touchstart', () => { this.mousedown = true; });
    progress.addEventListener('touchend', () => { this.mousedown = false; });

    prev.addEventListener('click', this.changeTrack.bind(this));
    next.addEventListener('click', this.changeTrack.bind(this));
  }
}
