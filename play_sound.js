function playSound(url) {
  return new Promise((resolve) => {
    const context = new AudioContext()
    fetch(url)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => context.decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        const source = context.createBufferSource()
        source.buffer = audioBuffer
        source.connect(context.destination)
        source.onended = () => {
          source.disconnect()
          context.close()
          resolve()
        }
        source.start(0)
      })
  })
}
