import { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import Image from "next/image";

interface IDScanProps {
  onCapture: (base64Image: string) => void;
  onSubmit: () => void;
  onPrevStep: () => void;
}

export default function IDScan({
  onCapture,
  onSubmit,
  onPrevStep,
}: IDScanProps) {
  const [idImage, setIdImage] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [useFrontCamera, setUseFrontCamera] = useState(false);

  useEffect(() => {
    // Reset error when camera options change
    setCameraError(null);
  }, [useFrontCamera]);

  const handleCameraError = (error: string | DOMException) => {
    console.error("Camera error:", error);
    setCameraError(error.toString());
    // If we get an error with the environment camera, try to switch to user camera
    if (!useFrontCamera) {
      setUseFrontCamera(true);
    }
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setIdImage(imageSrc);
      onCapture(imageSrc);
    }
  }, [webcamRef, onCapture]);

  const retake = () => {
    setIdImage(null);
  };

  const handleSubmit = () => {
    if (idImage) {
      onSubmit();
    }
  };

  const toggleCamera = () => {
    setUseFrontCamera(!useFrontCamera);
  };

  // More flexible video constraints
  const videoConstraints = {
    width: 420,
    height: 280,
    facingMode: useFrontCamera ? "user" : "environment", // Less strict constraint
  };

  return (
    <div className="max-w-md w-full mx-auto p-6 bg-white rounded-2xl">
      <h2 className="text-2xl font-bold mb-6 text-center">ID Document Scan</h2>
      <p className="text-sm text-gray-600 mb-4">
        Please ensure your ID is clearly visible and well-lit. Avoid glare and
        shadows.
      </p>

      <div className="flex flex-col items-center justify-center">
        {!idImage ? (
          <>
            <div className="bg-gray-100 rounded-xl p-3 mb-2 overflow-hidden">
              {cameraError ? (
                <div className="h-[280px] w-[420px] flex items-center justify-center bg-gray-200 rounded-lg">
                  <div className="text-center p-4">
                    <p className="text-red-500 font-medium mb-2">
                      Camera error
                    </p>
                    <p className="text-sm text-gray-600">{cameraError}</p>
                  </div>
                </div>
              ) : (
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  className="rounded-lg w-full"
                  height={280}
                  width={420}
                  onUserMediaError={handleCameraError}
                />
              )}
            </div>

            <div className="flex items-center justify-between w-full mb-2">
              <p className="text-xs text-gray-500">
                Position your ID card within the frame
              </p>
              <button
                onClick={toggleCamera}
                className="text-xs text-blue-600"
                type="button"
              >
                Switch camera
              </button>
            </div>

            <button
              onClick={capture}
              className="mb-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              disabled={!!cameraError}
            >
              Capture ID Photo
            </button>

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
            <div className="bg-gray-100 rounded-xl p-3 mb-4 overflow-hidden border border-green-500">
              <Image
                src={idImage}
                alt="ID Document"
                className="rounded-lg w-full"
                width={420}
                height={280}
              />
            </div>
            <button
              onClick={retake}
              className="mb-4 w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Retake Photo
            </button>
            <button
              onClick={handleSubmit}
              className="mb-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit
            </button>
          </>
        )}

        <button
          onClick={onPrevStep}
          className="w-full bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  );
}
