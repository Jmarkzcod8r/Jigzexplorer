"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import Logo from "@/app/component/logo";
import { useRouter } from "next/navigation";

export default function CheckoutProcessing() {
  const router = useRouter();

  // Optional: Auto-redirect to success page after 5 seconds..
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/checkout-success");
    }, 5000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="font-sans flex flex-col items-center justify-center min-h-screen bg-[url('/Bg.png')] bg-cover bg-center p-6">
      <Logo />

      <div className="bg-white bg-opacity-90 shadow-xl rounded-2xl p-10 text-center max-w-md w-full">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <h1 className="text-2xl font-bold text-blue-600 mb-2">
            Processing Your Payment...
          </h1>
          <p className="text-gray-600 mb-4">
            Please don’t close this page while we confirm your transaction.
          </p>
          <p className="text-gray-500 text-sm">
            This may take a few seconds depending on your payment method.
          </p>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-150"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-300"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
