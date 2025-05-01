export default function VerificationSuccess() {
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
        Verification Submitted Successfully
      </h2>
      <p className="mb-6 text-gray-700">
        Thank you for completing the verification process. Your information has
        been submitted successfully and is being reviewed.
      </p>
      <p className="text-sm text-gray-600">
        You will be notified once the verification process is complete.
      </p>
    </div>
  );
}
