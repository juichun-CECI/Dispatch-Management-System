/**
 * Web Audio API synthesizer for notification chimes
 */

export function playChime(type: 'bell' | 'digital' | 'soft' = 'bell') {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    
    if (type === 'bell') {
      // Classic resonant bell sound (crystal clear fundamental + harmonics)
      const now = ctx.currentTime;
      
      const freqs = [587.33, 880, 1174.66]; // D5, A5, D6
      const gains = [0.4, 0.2, 0.1];
      
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        
        gainNode.gain.setValueAtTime(gains[i], now);
        // Exponential decay for bell resonance
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.start(now);
        osc.stop(now + 1.5);
      });
    } else if (type === 'digital') {
      // Modern high-pitch digital double-beep
      const now = ctx.currentTime;
      
      // Beep 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.frequency.setValueAtTime(1047.50, now); // C6
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.1);
      
      // Beep 2
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.frequency.setValueAtTime(1318.51, now + 0.1); // E6
      gain2.gain.setValueAtTime(0.15, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.35);
    } else if (type === 'soft') {
      // Warm, rounded chime transition
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(329.63, now); // E4
      // Slide frequency up slightly
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.4); // A4
      
      gainNode.gain.setValueAtTime(0.25, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.6);
    }
  } catch (err) {
    console.warn('Unable to play web audio chime: ', err);
  }
}
