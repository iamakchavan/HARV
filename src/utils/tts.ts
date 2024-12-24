import Browser from 'webextension-polyfill';

export class TTSService {
  private static instance: TTSService;
  private isSpeaking: boolean = false;
  private currentUtterance: string | null = null;
  private voicePreferences = {
    gender: 'female',
    lang: 'en-GB'
  };

  private constructor() {}

  static getInstance(): TTSService {
    if (!TTSService.instance) {
      TTSService.instance = new TTSService();
    }
    return TTSService.instance;
  }

  async getVoices(): Promise<chrome.tts.TtsVoice[]> {
    return new Promise((resolve) => {
      chrome.tts.getVoices((voices) => {
        resolve(voices);
      });
    });
  }

  async findPreferredVoice(): Promise<chrome.tts.TtsVoice | undefined> {
    const voices = await this.getVoices();
    
    // First try to find a female British voice
    let voice = voices.find(
      v => v.lang?.includes(this.voicePreferences.lang) && 
           v.gender === this.voicePreferences.gender
    );
    
    // If no female British voice, try any female English voice
    if (!voice) {
      voice = voices.find(
        v => v.lang?.includes('en') && 
             v.gender === this.voicePreferences.gender
      );
    }
    
    // If still no voice found, try any British voice
    if (!voice) {
      voice = voices.find(v => v.lang?.includes(this.voicePreferences.lang));
    }
    
    return voice;
  }

  async speak(text: string): Promise<void> {
    if (this.isSpeaking && text === this.currentUtterance) {
      this.stop();
      return;
    }

    this.stop();
    this.isSpeaking = true;
    this.currentUtterance = text;

    const preferredVoice = await this.findPreferredVoice();

    chrome.tts.speak(text, {
      voiceName: preferredVoice?.voiceName,
      lang: this.voicePreferences.lang,
      gender: this.voicePreferences.gender,
      rate: 1.0,
      pitch: 1.0,
      onEvent: (event) => {
        if (event.type === 'end' || event.type === 'interrupted' || event.type === 'error') {
          this.isSpeaking = false;
          this.currentUtterance = null;
        }
      }
    });
  }

  stop(): void {
    if (this.isSpeaking) {
      chrome.tts.stop();
      this.isSpeaking = false;
      this.currentUtterance = null;
    }
  }

  isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }
}