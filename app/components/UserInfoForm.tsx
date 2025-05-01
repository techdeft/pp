import { ChangeEvent, FormEvent } from "react";
import { IDType, KYCFormData } from "../types";

interface UserInfoFormProps {
  formData: KYCFormData;
  onFormChange: (name: string, value: string | IDType) => void;
  onNextStep: () => void;
}

export default function UserInfoForm({
  formData,
  onFormChange,
  onNextStep,
}: UserInfoFormProps) {
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    onFormChange(name, value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.idType && formData.idNumber) {
      onNextStep();
    }
  };

  return (
    <div className="max-w-md w-full mx-auto p-6 bg-white rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Personal Information
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Please provide your personal information to continue with the
        verification process.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            readOnly
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="idType"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            ID Type
          </label>
          <select
            id="idType"
            name="idType"
            value={formData.idType}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            required
          >
            <option value="">Select ID Type</option>
            <option value="National ID">National ID</option>
            <option value="Driver's License">Driver's License</option>
            <option value="Passport">Passport</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="mb-6">
          <label
            htmlFor="idNumber"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            ID Number
          </label>
          <input
            type="text"
            id="idNumber"
            name="idNumber"
            value={formData.idNumber}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Next Step
        </button>
      </form>
    </div>
  );
}
