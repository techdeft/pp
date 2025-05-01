import { QRCodeSVG } from "qrcode.react";

interface QRCodeDisplayProps {
  url: string;
}

export default function QRCodeDisplay({ url }: QRCodeDisplayProps) {
  return (
    <div className="max-w-md w-full mx-auto p-6 bg-white rounded-xl shadow-md text-center">
      <h2 className="text-2xl font-bold mb-4">Mobile Verification Required</h2>
      <p className="text-sm text-gray-600 mb-4">
        Scan this QR code with your mobile device&apos;s camera to continue the
        verification process.
      </p>
      <div className="flex justify-center mb-6">
        <div className="p-4 bg-white rounded-xl shadow-md inline-block">
          <QRCodeSVG value={url} size={200} />
        </div>
      </div>
      <p className="text-sm text-gray-600">
        Or open this URL directly on your mobile device:
      </p>
      <p className="text-sm text-blue-600 break-all">{url}</p>
    </div>
  );
}
