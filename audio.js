class AudioManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.buffers = {};
    }

    async load(name, url) {
        const res = await fetch(url);
        const arrayBuffer = await res.arrayBuffer();
        this.buffers[name] = await this.ctx.decodeAudioData(arrayBuffer);
    }

    play(name, { volume = 1.0, playbackRate = 1.0 } = {}) {
        if (!this.buffers[name]) {
            console.warn(`Audio "${name}" not loaded`);
            return;
        }

        const source = this.ctx.createBufferSource();
        const gainNode = this.ctx.createGain();

        source.buffer = this.buffers[name];
        gainNode.gain.value = volume;
        source.playbackRate.value = playbackRate;

        source.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        source.start(0);
    }
}

export const audio = new AudioManager();
