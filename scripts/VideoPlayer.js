const rootSelector = '[data-js-video-player]'

class VideoPlayer {
  selectors = {
    root: rootSelector,
    video: '[data-js-video-player-video]',
    button: '[data-js-video-player-play-button]',
    pannel: '[data-js-video-player-pannel]'
  }

  stateClasses = {
    isActive: 'is-active'
  }

  constructor(rootElement) {
    this.rootElement = rootElement
    this.videoElement = this.rootElement.querySelector(this.selectors.video)
    this.pannelElement = this.rootElement.querySelector(this.selectors.pannel)
    this.buttonElement = this.rootElement.querySelector(this.selectors.button)

    this.bindEvents()
  }

  onPlayButtonClick = () => {
    this.videoElement.play()
    this.videoElement.controls = true
    this.pannelElement.classList.remove(this.stateClasses.isActive)
  }
  onVideoPause = () => {
    this.videoElement.controls = false
    this.pannelElement.classList.add(this.stateClasses.isActive)
  }

  bindEvents() {
    this.buttonElement.addEventListener('click', this.onPlayButtonClick)
    this.videoElement.addEventListener('pause', this.onVideoPause)
  }
}

class VideoPlayerCollection {
  constructor() {
    this.init()
  }

  init() {
    document.querySelectorAll(rootSelector).forEach((element) => {
      new VideoPlayer(element)
    })
  }
}

export default VideoPlayerCollection