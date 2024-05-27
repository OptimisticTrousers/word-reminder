import { useState, useEffect } from "react";

const useTextToSpeech = (text: string) => {
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(
    null
  );

  useEffect(() => {
    const synth = window.speechSynthesis;
    const u = new SpeechSynthesisUtterance(text);

    setUtterance(u);

    return () => {
      synth.cancel();
    };
  }, [text]);

  const handlePlay = () => {
    const synth = window.speechSynthesis;

    synth.speak(utterance!);
  };

  return { handlePlay };
};

export default useTextToSpeech;
