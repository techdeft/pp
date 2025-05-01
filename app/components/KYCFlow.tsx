"use client";

import { useState, useEffect } from "react";
import { KYCFormData, IDType, UserData, VerificationResult } from "../types";
import { isMobileDevice, confirmKYC, submitKYC } from "../utils";
import WelcomeScreen from "./WelcomeScreen";
import UserInfoForm from "./UserInfoForm";
import LivenessCheck from "./LivenessCheck";
import IDScan from "./IDScan";
import VoiceVerification from "./VoiceVerification";
import QRCodeDisplay from "./QRCodeDisplay";
import VerificationSuccess from "./VerificationSuccess";

enum Step {
  Loading,
  Welcome,
  UserInfo,
  LivenessCheck,
  IDScan,
  VoiceVerification,
  Success,
  AlreadyVerified,
  Error,
}

interface KYCFlowProps {
  token: string | null;
  id: string | null;
}

interface VerificationState {
  step: Step;
  userData: UserData | null;
  error: string | null;
  verificationResult: VerificationResult | null;
}

export default function KYCFlow({ token, id }: KYCFlowProps) {
  const [state, setState] = useState<VerificationState>({
    step: Step.Loading,
    userData: null,
    error: null,
    verificationResult: null,
  });
  const [formData, setFormData] = useState<KYCFormData>({
    name: "",
    idType: "" as IDType,
    idNumber: "",
    selfieImage: null,
    idImage: null,
    voiceRecording: null,
  });
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Mark component as mounted to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Mobile detection - client-side only
  useEffect(() => {
    if (mounted) {
      setIsMobile(isMobileDevice());
    }
  }, [mounted]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) {
        setState((prev) => ({
          ...prev,
          error: "Missing token parameter",
          step: Step.Error,
        }));
        return;
      }

      if (!id) {
        setState((prev) => ({
          ...prev,
          error: "Missing ID parameter",
          step: Step.Error,
        }));
        return;
      }

      console.log("Fetching user data with token:", token);

      try {
        const data = await confirmKYC(token);
        console.log("API response:", data);

        setState((prev) => ({
          ...prev,
          userData: data,
          formData: { ...formData, name: data.name },
        }));

        if (data.haskyc) {
          setState((prev) => ({ ...prev, step: Step.AlreadyVerified }));
        } else {
          setState((prev) => ({ ...prev, step: Step.Welcome }));
        }
      } catch (err: any) {
        console.error("Error fetching user data:", err);

        let errorMsg = "Failed to fetch user data. Please try again later.";

        // Extract detailed error information
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error("Error response data:", err.response.data);
          console.error("Error response status:", err.response.status);
          console.error("Error response headers:", err.response.headers);

          if (err.response.status === 401) {
            errorMsg = "Authentication failed. Please check your token.";
          }

          setState((prev) => ({ ...prev, errorDetails: err.response }));
        } else if (err.request) {
          // The request was made but no response was received
          console.error("Error request:", err.request);
          errorMsg =
            "No response received from server. Please check your connection.";
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error("Error message:", err.message);
          errorMsg = `Error: ${err.message}`;
        }

        setState((prev) => ({ ...prev, error: errorMsg }));
        setState((prev) => ({ ...prev, step: Step.Error }));
      }
    };

    if (token && mounted) {
      fetchUserData();
    }
  }, [token, id, mounted]);

  const handleFormChange = (name: string, value: string | IDType) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelfieCapture = (base64Image: string) => {
    setFormData((prev) => ({ ...prev, selfieImage: base64Image }));
  };

  const handleIDCapture = (base64Image: string) => {
    setFormData((prev) => ({ ...prev, idImage: base64Image }));
  };

  const handleVoiceCapture = (base64Audio: string) => {
    setFormData((prev) => ({ ...prev, voiceRecording: base64Audio }));
  };

  const nextStep = () => {
    setState((prev) => ({ ...prev, step: prev.step + 1 }));
  };

  const prevStep = () => {
    setState((prev) => ({ ...prev, step: prev.step - 1 }));
  };

  const handleSubmit = async () => {
    if (
      !token ||
      !formData.selfieImage ||
      !formData.idImage ||
      !formData.voiceRecording
    ) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Ensure token is a string
      const authToken = token.toString();
      await submitKYC(authToken, formData);
      setState((prev) => ({ ...prev, step: Step.Success }));
    } catch (err: any) {
      console.error("Error submitting KYC:", err);

      let errorMsg = "Failed to submit verification. Please try again later.";

      // Extract detailed error information
      if (err.response) {
        console.error("Error response data:", err.response.data);
        console.error("Error response status:", err.response.status);

        if (err.response.status === 401) {
          errorMsg = "Authentication failed. Your session may have expired.";
        }

        setState((prev) => ({ ...prev, errorDetails: err.response }));
      } else if (err.request) {
        errorMsg =
          "No response received from server. Please check your connection.";
      } else {
        errorMsg = `Error: ${err.message}`;
      }

      setState((prev) => ({ ...prev, error: errorMsg }));
      setState((prev) => ({ ...prev, step: Step.Error }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // If not mounted yet, show minimal loading UI to avoid hydration issues
  if (!mounted) {
    return (
      <div suppressHydrationWarning className="text-center">
        Loading...
      </div>
    );
  }

  // Loading state
  if (state.step === Step.Loading) {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>Loading verification data...</p>
        <p className="text-xs text-gray-500 mt-2">
          Using token: {token ? `${token.substring(0, 10)}...` : "None"}
        </p>
      </div>
    );
  }

  // Error state
  if (state.step === Step.Error) {
    return (
      <div className="max-w-md w-full mx-auto p-6 bg-white rounded-xl shadow-md text-center">
        <div className="mb-6 text-red-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p className="mb-6 text-gray-700">
          {state.error || "An unexpected error occurred"}
        </p>

        {/* Debug information */}
        {state.errorDetails && (
          <div className="mt-4 p-4 bg-gray-100 rounded-xl text-left text-xs overflow-auto max-h-60">
            <p className="font-semibold">Status: {state.errorDetails.status}</p>
            <p className="font-semibold mt-2">Response:</p>
            <pre>{JSON.stringify(state.errorDetails.data, null, 2)}</pre>
            <p className="font-semibold mt-2">Token Preview:</p>
            <p>{token ? `${token.substring(0, 20)}...` : "None"}</p>
          </div>
        )}

        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Already verified state
  if (state.step === Step.AlreadyVerified && state.userData) {
    return (
      <div className="max-w-md w-full mx-auto p-6 bg-white rounded-xl shadow-md text-center">
        <div className="mb-6 text-green-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-4">
          Hello, {state.userData.name}
        </h2>
        <p className="mb-6 text-gray-700">
          You are already verified. No further action is needed.
        </p>
      </div>
    );
  }

  // Welcome state
  if (state.step === Step.Welcome && state.userData) {
    return <WelcomeScreen userData={state.userData} onNext={nextStep} />;
  }

  // Desktop users - show QR code
  if (!isMobile) {
    const currentUrl = window.location.href;
    return <QRCodeDisplay url={currentUrl} />;
  }

  // Mobile users - show KYC steps
  return (
    <div>
      {state.step === Step.UserInfo && (
        <UserInfoForm
          formData={formData}
          onFormChange={handleFormChange}
          onNextStep={nextStep}
        />
      )}

      {state.step === Step.LivenessCheck && (
        <LivenessCheck
          onCapture={handleSelfieCapture}
          onNextStep={nextStep}
          onPrevStep={prevStep}
        />
      )}

      {state.step === Step.IDScan && (
        <IDScan
          onCapture={handleIDCapture}
          onSubmit={nextStep}
          onPrevStep={prevStep}
        />
      )}

      {state.step === Step.VoiceVerification && (
        <VoiceVerification
          userName={formData.name}
          onCapture={handleVoiceCapture}
          onNextStep={handleSubmit}
          onPrevStep={prevStep}
        />
      )}

      {state.step === Step.Success && <VerificationSuccess />}

      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Submitting your verification...</p>
          </div>
        </div>
      )}
    </div>
  );
}
