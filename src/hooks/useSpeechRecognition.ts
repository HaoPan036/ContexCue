"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionAlternativeLike = {
  transcript: string;
};

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
};

type SpeechRecognitionResultListLike = {
  length: number;
  [index: number]: SpeechRecognitionResultLike;
};

type SpeechRecognitionEventLike = Event & {
  resultIndex: number;
  results: SpeechRecognitionResultListLike;
};

type SpeechRecognitionErrorEventLike = Event & {
  error: string;
  message?: string;
};

type BrowserSpeechRecognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

declare global {
  interface Window {
    SpeechRecognition?: BrowserSpeechRecognitionConstructor;
    webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
  }
}

export interface SpeechRecognitionState {
  supported: boolean;
  listening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

function compactTranscript(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function getSpeechErrorMessage(event: SpeechRecognitionErrorEventLike) {
  switch (event.error) {
    case "not-allowed":
    case "service-not-allowed":
      return "Microphone permission was blocked. Allow microphone access in Chrome and try again.";
    case "no-speech":
      return "No speech was detected. Try again and speak after the permission prompt closes.";
    case "audio-capture":
      return "No microphone was found. Check your input device and try again.";
    case "network":
      return "The browser transcription service could not be reached. Check the network and try again.";
    case "aborted":
      return "Speech recognition was stopped. You can try again when ready.";
    default:
      return event.message || "Speech recognition failed. Please try again.";
  }
}

export function useSpeechRecognition(): SpeechRecognitionState {
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const listeningRef = useRef(false);
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const setListeningState = useCallback((value: boolean) => {
    listeningRef.current = value;
    setListening(value);
  }, []);

  useEffect(() => {
    const SpeechRecognitionCtor =
      typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : undefined;

    if (!SpeechRecognitionCtor) {
      setSupported(false);
      setListeningState(false);
      setError("Speech recognition is not supported in this browser. 请用 Chrome 打开。");
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const resultText = Array.from({ length: result.length }, (_, alternativeIndex) => result[alternativeIndex].transcript).join("");

        if (result.isFinal) {
          finalText = `${finalText} ${resultText}`;
        } else {
          interimText = `${interimText} ${resultText}`;
        }
      }

      if (finalText) {
        setTranscript((current) => compactTranscript(`${current} ${finalText}`));
      }

      setInterimTranscript(compactTranscript(interimText));
      setError(null);
    };

    recognition.onerror = (event) => {
      setError(getSpeechErrorMessage(event));
      setListeningState(false);
    };

    recognition.onend = () => {
      setListeningState(false);
      setInterimTranscript("");
    };

    recognitionRef.current = recognition;
    setSupported(true);

    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;

      try {
        recognition.stop();
      } catch {
        // Some browsers throw if stop is called before start.
      }

      recognitionRef.current = null;
      listeningRef.current = false;
    };
  }, [setListeningState]);

  const start = useCallback(() => {
    if (!recognitionRef.current) {
      setError("Speech recognition is not supported in this browser. 请用 Chrome 打开。");
      setSupported(false);
      return;
    }

    if (listeningRef.current) {
      return;
    }

    try {
      recognitionRef.current.start();
      setError(null);
      setListeningState(true);
    } catch (startError) {
      const message =
        startError instanceof Error && startError.name === "InvalidStateError"
          ? "Speech recognition is already listening."
          : "Speech recognition could not start. Please try again.";

      setError(message);
      setListeningState(false);
    }
  }, [setListeningState]);

  const stop = useCallback(() => {
    if (!recognitionRef.current) {
      setListeningState(false);
      return;
    }

    try {
      recognitionRef.current.stop();
    } catch {
      // Some browsers throw if recognition is already stopped.
    } finally {
      setListeningState(false);
    }
  }, [setListeningState]);

  const reset = useCallback(() => {
    stop();
    setTranscript("");
    setInterimTranscript("");
    setError(null);
  }, [stop]);

  return {
    supported,
    listening,
    transcript,
    interimTranscript,
    error,
    start,
    stop,
    reset
  };
}
