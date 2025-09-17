"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

const SuccessPage = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-6">
      <div className="bg-white shadow-lg rounded-2xl max-w-md w-full p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />

        <h1 className="text-3xl font-bold text-green-600 mb-2">
          🎉 Payment Successful!
        </h1>

        <p className="text-gray-700 mb-6">
          Thank you for subscribing to the <span className="font-semibold">Premium Package</span>.
          You now have full access to all features 🚀
        </p>

        <button
          onClick={() => router.push("/")}
          className="w-full bg-green-600 text-white py-3 rounded-xl text-lg font-semibold shadow-md hover:bg-green-700 transition-transform transform hover:scale-105"
        >
          Go to Main Page
        </button>
      </div>
    </div>
  );
};

export default SuccessPage;
