import { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js/dist/face-api.min.js";
import { checkEnvironmentBrightness } from "../utils";
import type { Point } from "face-api.js/dist/face-api.min.js";

interface LivenessCheckProps {
  onCapture: (base64Image: string) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
}

type TaskType = "lighting";

type LivenessStatus = {
  type: "info" | "success" | "error";
  message: string;
};

// Audio messages for different states
const audioMessages = {
  initial: "Please look at the camera",
  lighting: "Please move to a well-lit area for better face detection",
  complete: "Verification complete! You can now take the photo",
  error: "Please check your camera and try again",
};

const StatusCard = ({
  type,
  title,
  message,
  items,
}: {
  type: "error" | "warning" | "success";
  title: string;
  message?: string;
  items?: string[];
}) => {
  const getIcon = () => {
    switch (type) {
      case "error":
        return (
          <svg
            className="w-6 h-6 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "warning":
        return (
          <svg
            className="w-6 h-6 text-yellow-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        );
      case "success":
        return (
          <svg
            className="w-6 h-6 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  const getStyles = () => {
    switch (type) {
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
    }
  };

  return (
    <div className={`rounded-lg border p-4 mb-4 shadow-sm ${getStyles()}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="ml-3">
          <h3 className="text-sm font-medium">{title}</h3>
          {message && <p className="mt-1 text-sm">{message}</p>}
          {items && items.length > 0 && (
            <ul className="mt-2 list-disc list-inside space-y-1">
              {items.map((item, index) => (
                <li key={index} className="text-sm">
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default function LivenessCheck({
  onCapture,
  onNextStep,
  onPrevStep,
}: LivenessCheckProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [useFrontCamera, setUseFrontCamera] = useState(true);
  const [isBrightEnough, setIsBrightEnough] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [brightnessLevel, setBrightnessLevel] = useState<number>(0);
  const [lastAudioMessage, setLastAudioMessage] = useState<string>("");
  const speechSynthesis = useRef<SpeechSynthesis | null>(null);
  const [livenessStatus, setLivenessStatus] = useState<LivenessStatus>({
    type: "info",
    message: "Starting verification...",
  });
  const mounted = useRef(true);
  const [isReadyToCapture, setIsReadyToCapture] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const videoConstraints = {
    width: 320,
    height: 320,
    facingMode: useFrontCamera ? "user" : "environment",
  };

  useEffect(() => {
    // Initialize speech synthesis
    speechSynthesis.current = window.speechSynthesis;

    // Clean up speech synthesis on unmount
    return () => {
      if (speechSynthesis.current) {
        speechSynthesis.current.cancel();
      }
    };
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (text === lastAudioMessage) return;

      if (speechSynthesis.current) {
        speechSynthesis.current.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        speechSynthesis.current.speak(utterance);
        setLastAudioMessage(text);
      }
    },
    [lastAudioMessage]
  );

  useEffect(() => {
    if (!isModelLoaded || isChecking) return;

    if (cameraError) {
      speak(audioMessages.error);
    } else if (!isBrightEnough) {
      speak(audioMessages.lighting);
    } else if (livenessStatus) {
      speak(livenessStatus.message);
    } else {
      speak(audioMessages.initial);
    }
  }, [
    isModelLoaded,
    isChecking,
    cameraError,
    isBrightEnough,
    livenessStatus,
    speak,
  ]);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models";

        try {
          await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
          console.log("Tiny face detector model loaded");
        } catch (error) {
          console.error("Error loading tiny face detector:", error);
          throw new Error("Failed to load face detection model");
        }

        setIsModelLoaded(true);
        console.log("All models loaded successfully");
      } catch (error) {
        console.error("Error loading face detection models:", error);
        setCameraError(
          "Failed to load face detection models. Please refresh the page and try again."
        );
      }
    };

    loadModels();
  }, []);

  useEffect(() => {
    if (!isModelLoaded) return;

    const checkConditions = async () => {
      if (!webcamRef.current?.video || !mounted.current) return;

      try {
        const options = new faceapi.TinyFaceDetectorOptions({
          inputSize: 160,
          scoreThreshold: 0.5,
        });

        const [brightness, detections] = await Promise.all([
          checkEnvironmentBrightness(webcamRef.current.video),
          faceapi.detectSingleFace(webcamRef.current.video, options),
        ]);

        if (mounted.current) {
          setIsBrightEnough(brightness);
          setIsChecking(false);
          setBrightnessLevel(brightness ? 1 : 0);

          if (brightness && detections) {
            setLivenessStatus({
              type: "success",
              message: "Face detected. Capturing photo...",
            });
            setIsReadyToCapture(true);
            // Automatically capture the photo
            const imageSrc = webcamRef.current.getScreenshot();
            if (imageSrc) {
              setCapturedImage(imageSrc);
              // Don't automatically proceed to next step
              // onCapture(imageSrc);
              // onNextStep();
            }
          } else if (brightness) {
            setLivenessStatus({
              type: "error",
              message:
                "No face detected. Please position your face in the frame.",
            });
            setIsReadyToCapture(false);
          }
        }
      } catch (error) {
        console.error("Error checking conditions:", error);
        if (mounted.current) {
          setIsChecking(false);
          setCameraError("Error checking conditions. Please try again.");
        }
      }
    };

    // Initial check
    checkConditions();

    // Set up interval for continuous checking
    const checkInterval = setInterval(checkConditions, 2000);

    return () => {
      clearInterval(checkInterval);
    };
  }, [isModelLoaded]);

  const handleCameraError = (error: string | DOMException) => {
    console.error("Camera error:", error);
    setCameraError(error.toString());
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      onCapture(imageSrc);
      onNextStep();
    }
  }, [webcamRef, onCapture, onNextStep]);

  const retake = () => {
    setCapturedImage(null);
  };

  const handleContinue = () => {
    if (capturedImage) {
      onNextStep();
    }
  };

  const toggleCamera = () => {
    setUseFrontCamera(!useFrontCamera);
  };

  return (
    <div className="max-w-md w-full mx-auto p-6 bg-white rounded-2xl">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Selfie Verification
      </h2>
      <p className="mb-4 text-gray-700 text-center">
        Please complete the following steps to verify your identity:
      </p>
      {/* 
      {!isModelLoaded ? (
        <div className="text-center mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p>Loading face detection...</p>
        </div>
      ) : isChecking ? (
        <div className="text-center mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p>Checking environment...</p>
        </div>
      ) : (
        <div className="w-full mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center border-2 border-green-500">
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-green-600">
                Lighting Check
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
            <div
              className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
              style={{
                width: `${livenessStatus.type === "success" ? 100 : 50}%`,
              }}
            />
          </div>
          <p className="text-sm text-center font-medium text-gray-700">
            {livenessStatus.message}
          </p>
        </div>
      )} */}

      <div className="flex flex-col items-center justify-center">
        {!capturedImage ? (
          <>
            <div className="relative">
              <div
                className={`relative bg-gray-100 rounded-full p-3 mb-2 overflow-hidden ${
                  livenessStatus.type === "error"
                    ? "border-4 border-red-500"
                    : livenessStatus.type === "info"
                    ? "border-4 border-blue-500"
                    : "border-4 border-green-500"
                }`}
              >
                {cameraError ? (
                  <div className="h-[320px] w-[320px] flex items-center justify-center bg-gray-200 rounded-full">
                    <StatusCard
                      type="error"
                      title="Camera Error"
                      message={cameraError}
                      items={[
                        "Check if your camera is properly connected",
                        "Ensure camera permissions are granted",
                        "Try refreshing the page",
                      ]}
                    />
                  </div>
                ) : (
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                    className="rounded-full w-full"
                    onUserMediaError={handleCameraError}
                  />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between w-full mb-2">
              <p className="text-xs text-gray-500">{livenessStatus.message}</p>
              <button
                onClick={toggleCamera}
                className="text-xs text-blue-600"
                type="button"
              >
                Switch camera
              </button>
            </div>

            {cameraError && (
              <div className="mb-4 w-full p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm">
                  If your camera isn't working, you may need to grant camera
                  permissions in your browser settings.
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="relative">
              <div className="relative bg-gray-100 rounded-full p-3 mb-4 overflow-hidden border-4 border-green-500">
                <img
                  src={capturedImage}
                  alt="Captured selfie"
                  className="rounded-full w-full"
                />
              </div>
            </div>
            <div className="w-full space-y-3">
              <button
                onClick={retake}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Retake Photo
              </button>
              <button
                onClick={() => {
                  onCapture(capturedImage);
                  onNextStep();
                }}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Use This Photo
              </button>
            </div>
          </>
        )}

        <button
          onClick={onPrevStep}
          className="w-full mt-4 bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  );
}
