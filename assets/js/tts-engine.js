/**
 * Digital Book Library v2.0 — TTS Engine (Web Speech API)
 */

class TTSEngine {
  constructor() {
    this.synth = 'speechSynthesis' in window ? window.speechSynthesis : null;
    this.utterance = null;
    this.isPlaying = false;
    this.isPaused = false;
  }

  speak(text, lang = 'en-US', rate = 1.0) {
    if (!this.synth) {
      console.warn('Speech Synthesis API is not supported in this browser.');
      return false;
    }
    const content = String(text || '').trim();
    if (!content) return false;

    this.stop();
    this.utterance = new SpeechSynthesisUtterance(content);
    this.utterance.lang = lang;
    this.utterance.rate = Math.min(2, Math.max(0.1, Number(rate) || 1));
    this.utterance.onstart = () => {
      this.isPlaying = true;
      this.isPaused = false;
      this.updateUIState(true);
    };
    this.utterance.onend = () => {
      this.isPlaying = false;
      this.isPaused = false;
      this.updateUIState(false);
    };
    this.utterance.onerror = (error) => {
      console.error('TTS Error:', error);
      this.isPlaying = false;
      this.isPaused = false;
      this.updateUIState(false);
    };

    this.synth.speak(this.utterance);
    return true;
  }

  pause() {
    if (!this.synth || !this.isPlaying) return;
    this.synth.pause();
    this.isPlaying = false;
    this.isPaused = true;
    this.updateUIState(false);
  }

  resume() {
    if (!this.synth || !this.isPaused) return;
    this.synth.resume();
    this.isPlaying = true;
    this.isPaused = false;
    this.updateUIState(true);
  }

  stop() {
    if (this.synth) this.synth.cancel();
    this.isPlaying = false;
    this.isPaused = false;
    this.updateUIState(false);
  }

  updateUIState(active) {
    const btn = document.getElementById('tts-toggle-btn');
    if (btn) {
      btn.classList.toggle('active', active);
      btn.textContent = active ? '⏸ Pause Audio' : '🔊 Listen Chapter';
    }
  }
}

window.ttsEngine = new TTSEngine();
