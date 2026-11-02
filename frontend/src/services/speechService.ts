/**
 * speechService.ts
 * Servicio de síntesis de voz (Text-to-Speech) y efectos de sonido auditivos
 * para la interacción adaptativa con el adulto mayor (IHM / Accesibilidad).
 */

// Utilidad Web Audio API para emitir tonos sintéticos sin archivos externos
class SoundEffects {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Chime agradable de confirmación médica (doble tono armonioso)
  playConfirmationChime() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(523.25, now); // Do5 (C5)
      osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // Mi5 (E5)

      osc2.frequency.setValueAtTime(659.25, now + 0.15);
      osc2.frequency.exponentialRampToValueAtTime(783.99, now + 0.35); // Sol5 (G5)

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.2);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.55);
    } catch (e) {
      console.warn('AudioContext not available:', e);
    }
  }

  // Tono de alerta de emergencia / SOS (sirena pulsante)
  playSosAlertSound() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      
      // Frecuencias oscilantes de sirena
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.linearRampToValueAtTime(1200, now + 0.25);
      osc.frequency.linearRampToValueAtTime(800, now + 0.5);
      osc.frequency.linearRampToValueAtTime(1200, now + 0.75);
      osc.frequency.linearRampToValueAtTime(800, now + 1.0);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.1);
    } catch (e) {
      console.warn('AudioContext not available:', e);
    }
  }
}

export const soundEffects = new SoundEffects();

/**
 * Gestor de Voces en Español (Web Speech API)
 */
class SpeechService {
  private voices: SpeechSynthesisVoice[] = [];
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private listeners: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.loadVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  }

  private loadVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    this.voices = window.speechSynthesis.getVoices();
    
    // Si no teníamos voz elegida o si la voz actual no es en español, buscar la mejor en español
    if (!this.selectedVoice || !this.selectedVoice.lang.toLowerCase().startsWith('es')) {
      this.selectedVoice = this.findBestSpanishVoice();
    }
    
    this.notify();
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  public subscribe(cb: () => void) {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  /**
   * Obtiene la lista completa de voces instaladas en el navegador/sistema
   */
  public getAllVoices(): SpeechSynthesisVoice[] {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const live = window.speechSynthesis.getVoices();
      if (live && live.length > 0) {
        this.voices = live;
      }
    }
    return this.voices;
  }

  /**
   * Filtra exclusivamente las voces en español disponibles en el equipo
   */
  public getSpanishVoices(): SpeechSynthesisVoice[] {
    const all = this.getAllVoices();
    return all.filter(v => {
      const lang = v.lang.toLowerCase();
      const name = v.name.toLowerCase();
      return (
        lang.startsWith('es') ||
        lang.includes('-es') ||
        lang.includes('_es') ||
        lang.includes('spa') ||
        name.includes('spanish') ||
        name.includes('español') ||
        name.includes('mexico') ||
        name.includes('peru') ||
        name.includes('colombia') ||
        name.includes('latino') ||
        name.includes('sabina') ||
        name.includes('elena') ||
        name.includes('raul') ||
        name.includes('jorge') ||
        name.includes('hilda') ||
        name.includes('dalia') ||
        name.includes('camila') ||
        name.includes('salome')
      );
    });
  }

  /**
   * Prioriza la mejor voz en español latinoamericano (Perú, Latam, México)
   * NUNCA devuelve una voz en inglés ni ningún idioma no-español.
   */
  public findBestSpanishVoice(): SpeechSynthesisVoice | null {
    const spanishVoices = this.getSpanishVoices();
    if (spanishVoices.length === 0) {
      // IMPORTANTE: Si aún no hay voces en español cargadas, retornar null.
      // NUNCA retornar this.voices[0] (que suele ser un sintetizador en inglés en Windows).
      return null;
    }

    // 1. Máxima Prioridad: Español Perú (es-PE o 'Camila' / 'Peru')
    const pe = spanishVoices.find(v => 
      v.lang.toLowerCase().includes('pe') || 
      v.name.toLowerCase().includes('peru')
    );
    if (pe) return pe;

    // 2. Prioridad: Español Latinoamérica (es-419) o Natural Online Latam
    const latam = spanishVoices.find(v => 
      v.lang.toLowerCase().includes('419') ||
      (v.name.toLowerCase().includes('natural') && (v.lang.toLowerCase().includes('mx') || v.lang.toLowerCase().includes('co')))
    );
    if (latam) return latam;

    // 3. Prioridad: Español México (es-MX) o Estados Unidos (es-US)
    const mx = spanishVoices.find(v => 
      v.lang.toLowerCase().includes('mx') || 
      v.name.toLowerCase().includes('sabina') ||
      v.name.toLowerCase().includes('dalia') ||
      v.name.toLowerCase().includes('raul') ||
      v.lang.toLowerCase().includes('us')
    );
    if (mx) return mx;

    // 4. Prioridad: Voces de Google en Español o cualquier voz en español latino
    const googleEs = spanishVoices.find(v => 
      v.name.toLowerCase().includes('google') && 
      (v.lang.toLowerCase().startsWith('es') || v.name.toLowerCase().includes('español'))
    );
    if (googleEs) return googleEs;

    // 5. Voces de Colombia, Argentina, Chile
    const otherLatam = spanishVoices.find(v =>
      v.lang.toLowerCase().includes('co') ||
      v.lang.toLowerCase().includes('ar') ||
      v.lang.toLowerCase().includes('cl')
    );
    if (otherLatam) return otherLatam;

    // 6. Cualquier otra voz en español (ej. es-ES)
    return spanishVoices[0] || null;
  }

  public getSelectedVoice(): SpeechSynthesisVoice | null {
    // Si la voz actual no es en español o es nula, refrescar búsqueda
    if (!this.selectedVoice || !this.selectedVoice.lang.toLowerCase().startsWith('es')) {
      this.selectedVoice = this.findBestSpanishVoice();
    }
    return this.selectedVoice;
  }

  public setVoice(voice: SpeechSynthesisVoice) {
    if (voice && (voice.lang.toLowerCase().startsWith('es') || voice.name.toLowerCase().includes('spanish'))) {
      this.selectedVoice = voice;
      this.notify();
    }
  }

  /**
   * Reproduce el texto asegurando la voz en español y una cadencia pausada
   */
  public speak(
    text: string, 
    options?: { 
      rate?: number; 
      pitch?: number; 
      volume?: number; 
      playChimeBefore?: boolean;
    }
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis is not supported in this browser.');
      return;
    }

    // Si se solicitó un chime previo (campanita médica), hacerlo sonar
    if (options?.playChimeBefore) {
      soundEffects.playConfirmationChime();
    }

    // Cancelar cualquier locución pendiente previa
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = this.getSelectedVoice();

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      // Fallback estricto a Español Latinoamericano para que el navegador
      // descargue o asigne obligatoriamente un motor de voz en español
      utterance.lang = 'es-419';
    }

    // Configuración ergonómica para adultos mayores:
    // Rate 0.82 es una cadencia pausada y sosegada, ideal para dicción clara.
    utterance.rate = options?.rate ?? 0.82;
    utterance.pitch = options?.pitch ?? 1.0;
    utterance.volume = options?.volume ?? 1.0;

    // Pequeño retardo si hubo campanita para que no se superpongan
    const delay = options?.playChimeBefore ? 350 : 60;
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, delay);
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const speechService = new SpeechService();
