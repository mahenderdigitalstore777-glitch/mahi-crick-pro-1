/**
 * Mahi Crick Pro - Voice Commentary & Voice-Assisted Scoring Engine
 * 1. Speech Synthesis: Professional audio cricket commentary (Hindi/English)
 * 2. Speech Recognition: Voice-assisted hands-free scoring ("Four", "Six", "Out", "Wide", "Dot ball")
 */

class VoiceCommentaryService {
  private isSpeaking = false;
  private voiceEnabled = true;

  setVoiceEnabled(enabled: boolean) {
    this.voiceEnabled = enabled;
  }

  getVoiceEnabled() {
    return this.voiceEnabled;
  }

  /**
   * Speak commentary phrase aloud using Web Speech API
   */
  speakCommentary(text: string, language: 'hi-IN' | 'en-US' = 'en-US') {
    if (!this.voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    try {
      window.speechSynthesis.cancel(); // cancel any pending audio
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Select voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) => v.lang.startsWith(language.slice(0, 2)) || v.name.includes('India')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
    }
  }

  /**
   * Quick announcement generator for ball outcomes
   */
  announceBallOutcome(
    batterName: string,
    runsBatter: number,
    runsExtra: number,
    extraType: string,
    isWicket: boolean,
    dismissalType?: string,
    scoreSummary?: string
  ) {
    if (!this.voiceEnabled) return;

    let phrase = '';
    if (isWicket) {
      phrase = `Wicket down! ${batterName} is out ${dismissalType || ''}!`;
    } else if (runsBatter === 6) {
      phrase = `Massive SIX by ${batterName}! It sails over the ropes!`;
    } else if (runsBatter === 4) {
      phrase = `Glorious FOUR by ${batterName}! Boundary signaled!`;
    } else if (extraType === 'wide') {
      phrase = `Wide ball bowled. ${runsExtra} extra run.`;
    } else if (extraType === 'noball') {
      phrase = `No ball called! Free hit coming up.`;
    } else if (runsBatter === 0) {
      phrase = `Dot ball, no run scored.`;
    } else if (runsBatter === 1) {
      phrase = `Single taken, strike rotated.`;
    } else {
      phrase = `${runsBatter} runs scored by ${batterName}.`;
    }

    if (scoreSummary) {
      phrase += ` Score is ${scoreSummary}.`;
    }

    this.speakCommentary(phrase);
  }

  /**
   * Initialize speech recognition for voice scoring
   */
  startVoiceScoring(
    onResult: (command: string) => void,
    onError: (err: string) => void
  ): () => void {
    if (typeof window === 'undefined') {
      onError('Speech recognition not supported in this environment');
      return () => {};
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      onError('Microphone voice recognition not supported by this browser. Use Chrome on Android.');
      return () => {};
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN'; // also parses Hindi phonetic numbers well

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        onResult(transcript);
      };

      recognition.onerror = (event: any) => {
        onError(event.error);
      };

      recognition.start();

      return () => {
        try {
          recognition.stop();
        } catch {}
      };
    } catch (err: any) {
      onError(err.message);
      return () => {};
    }
  }

  /**
   * Parse speech transcript into cricket score action
   */
  parseVoiceCommand(transcript: string): {
    runs: number;
    extraType: 'none' | 'wide' | 'noball' | 'bye' | 'legbye';
    isWicket: boolean;
  } | null {
    const text = transcript.toLowerCase();

    // Wicket
    if (text.includes('out') || text.includes('wicket') || text.includes('आउट') || text.includes('clean bowled')) {
      return { runs: 0, extraType: 'none', isWicket: true };
    }

    // Six
    if (text.includes('six') || text.includes('छह') || text.includes('छक्का') || text.includes('6')) {
      return { runs: 6, extraType: 'none', isWicket: false };
    }

    // Four
    if (text.includes('four') || text.includes('char') || text.includes('चार') || text.includes('चौका') || text.includes('4')) {
      return { runs: 4, extraType: 'none', isWicket: false };
    }

    // Wide
    if (text.includes('wide') || text.includes('वाइड')) {
      return { runs: 0, extraType: 'wide', isWicket: false };
    }

    // No ball
    if (text.includes('no ball') || text.includes('noball') || text.includes('नो बॉल')) {
      return { runs: 0, extraType: 'noball', isWicket: false };
    }

    // Dot ball
    if (text.includes('dot') || text.includes('zero') || text.includes('डॉट') || text.includes('डॉट बॉल') || text.includes('0')) {
      return { runs: 0, extraType: 'none', isWicket: false };
    }

    // Single / 1
    if (text.includes('one') || text.includes('single') || text.includes('एक') || text.includes('1')) {
      return { runs: 1, extraType: 'none', isWicket: false };
    }

    // Two / 2
    if (text.includes('two') || text.includes('double') || text.includes('दो') || text.includes('2')) {
      return { runs: 2, extraType: 'none', isWicket: false };
    }

    // Three / 3
    if (text.includes('three') || text.includes('teen') || text.includes('तीन') || text.includes('3')) {
      return { runs: 3, extraType: 'none', isWicket: false };
    }

    return null;
  }
}

export const voiceCommentaryService = new VoiceCommentaryService();
