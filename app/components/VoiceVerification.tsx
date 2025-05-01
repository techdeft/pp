import { useState, useRef, useEffect, useCallback } from "react";

interface VoiceVerificationProps {
  userName: string;
  onCapture: (base64Audio: string) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
}

export default function VoiceVerification({
  userName,
  onCapture,
  onNextStep,
  onPrevStep,
}: VoiceVerificationProps) {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [countDown, setCountDown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  }, [recording]);

  // Clean up audio URL when component unmounts
  useEffect(() => {
    return () => {
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);

  // Handle countdown timer for recording
  useEffect(() => {
    if (recording) {
      const timer = setTimeout(() => {
        if (recording) {
          stopRecording();
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [recording, stopRecording]);

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        setIsProcessing(true);
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);

        // Convert to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          console.log("Audio converted to base64");
          setAudioBase64(base64data);
          onCapture(base64data);
          setIsProcessing(false);
        };

        // Stop all audio tracks
        stream.getAudioTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
      setCountDown(5); // 5 second recording
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError(
        "Could not access microphone. Please check your browser permissions."
      );
    }
  };

  const handleRerecord = () => {
    setAudioURL(null);
    setAudioBase64(null);
  };

  const handleContinue = () => {
    if (audioBase64) {
      onNextStep();
    }
  };

  return (
    <div className="max-w-md w-full mx-auto p-6 bg-white rounded-2xl">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Voice Verification
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Please read the following phrase aloud: &quot;My voice is my
        password&quot;
      </p>
      <p className="text-sm text-gray-600 mb-4">
        Make sure you&apos;re in a quiet environment and speak clearly.
      </p>
      <p className="text-lg font-medium text-center mb-6 p-3 bg-blue-50 rounded-lg">
        &quot;My name is {userName}&quot;
      </p>

      <div className="flex flex-col items-center justify-center">
        {!audioURL ? (
          <>
            <div className="w-full h-24 mb-4 bg-gray-100 rounded-xl flex items-center justify-center">
              {recording ? (
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    <div className="w-2 h-8 bg-red-500 animate-pulse rounded-full"></div>
                    <div className="w-2 h-6 bg-red-500 animate-pulse rounded-full delay-75"></div>
                    <div className="w-2 h-10 bg-red-500 animate-pulse rounded-full delay-100"></div>
                    <div className="w-2 h-4 bg-red-500 animate-pulse rounded-full delay-150"></div>
                    <div className="w-2 h-8 bg-red-500 animate-pulse rounded-full delay-200"></div>
                  </div>
                  <p className="text-red-500 font-bold">
                    Recording... {countDown}s
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">Press button to start recording</p>
              )}
            </div>

            {error && (
              <div className="mb-4 w-full p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-red-500">{error}</p>
                <p className="text-sm mt-1">
                  If your microphone isn't working, please check your browser
                  permissions.
                </p>
              </div>
            )}

            <button
              onClick={recording ? stopRecording : startRecording}
              className={`mb-4 w-full py-2 px-4 rounded-lg transition-colors ${
                recording
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
              disabled={isProcessing}
            >
              {recording ? "Stop Recording" : "Start Recording"}
            </button>
          </>
        ) : (
          <>
            <div className="w-full mb-4 p-4 bg-gray-100 rounded-xl border border-green-500">
              <audio src={audioURL} controls className="w-full" />
            </div>

            <div className="flex w-full gap-2 mb-4">
              <button
                onClick={handleRerecord}
                className="w-1/2 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                disabled={isProcessing}
              >
                Record Again
              </button>
              <button
                onClick={handleContinue}
                className="w-1/2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                disabled={isProcessing}
              >
                Continue
              </button>
            </div>

            {isProcessing && (
              <div className="w-full text-center text-gray-500 mb-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mx-auto mb-1"></div>
                <p className="text-xs">Processing audio...</p>
              </div>
            )}
          </>
        )}

        <button
          onClick={onPrevStep}
          className="w-full bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
          disabled={recording || isProcessing}
        >
          Back
        </button>
      </div>
    </div>
  );
}
