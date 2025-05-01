import { UserData } from "../types";

interface WelcomeScreenProps {
  userData: UserData;
  onNext: () => void;
}

export default function WelcomeScreen({
  userData,
  onNext,
}: WelcomeScreenProps) {
  return (
    <div className="max-w-md w-full mx-auto p-6 bg-white rounded-xl ">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Welcome, {userData.name}!
        </h1>

        <p className="text-gray-600">
          Please have your ID document ready for the next steps.
        </p>
      </div>

      <div className="flex justify-center">
        <button
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200"
        >
          Start Verification
        </button>
      </div>
    </div>
  );
}
