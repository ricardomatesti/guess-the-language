import { useState } from "react";

export const useSpeech = ({
  text,
  lang = "es-ES",
}: {
  text: string;
  lang: string;
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const play = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const voices = window.speechSynthesis.getVoices();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.9; // Un poco más lento para que suene natural

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);

      const voice = voices.find((v) => v.lang === lang);
      if (voice) utterance.voice = voice;
      window.speechSynthesis.speak(utterance);
    }
  };

  return { play, isPlaying };
};
