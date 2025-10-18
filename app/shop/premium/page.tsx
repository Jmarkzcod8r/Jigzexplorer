"use client";

import { initializePaddle, Paddle } from "@paddle/paddle-js";
import { useEffect, useState } from "react";
import React from "react";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Logo from "@/app/component/logo";
import Link from "next/link";

const PremiumWelcome = () => {
  const router = useRouter();
  const [paddle, setPaddle] = useState<Paddle>();
  const [loading, setLoading] = useState(false);

  const features = [
    "All access to countries",
    "All access to reusable pictures",
    "Early access to future new features and updates",
    "An opportunity to share your pictures as puzzles for the world to see",
  ];

  // ✅ Initialize Paddle.js
  useEffect(() => {
    initializePaddle({
      environment: "sandbox", // keep "sandbox" for local testing
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
    }).then((p) => setPaddle(p));
  }, []);

  const handleCheckout = async () => {
    if (!paddle) return alert("⚠️ Paddle not initialized yet.");
    setLoading(true);

    try {
      // ✅ Get email safely
      const rawEmail = localStorage.getItem("email");
      let email = "guest@example.com";
      if (rawEmail) {
        try {
          email = JSON.parse(rawEmail);
        } catch {
          email = rawEmail;
        }
      }

      // ✅ Create transaction via your backend
      const response = await fetch("/api/paddle/activate-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create checkout session");

      console.log("Paddle response:", data);

      // ✅ 1️⃣ Prefer the Paddle checkout overlay if available
      if (data.transactionId && paddle.Checkout) {
        paddle.Checkout.open({
          transactionId: data.transactionId, //--> This is where your custom data is packaged along with other infos.
          settings: {
            displayMode: "overlay",
            theme: "dark",
            successUrl: "http://localhost:3000/checkout-success",
            // cancelUrl: "http://localhost:3000/checkout-cancel",
          },
        });
      }
      // ✅ 2️⃣ Otherwise fallback: redirect to the returned checkout URL
      else if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("Missing checkoutUrl or transactionId from server");
      }
    } catch (err: any) {
      console.error("Checkout failed:", err);
      alert("Failed to start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-sans flex flex-col items-center justify-center min-h-screen p-6 sm:p-10 bg-[url('/Bg.png')] bg-cover bg-center">
      <Logo />
      <div className="bg-white shadow-xl rounded-2xl max-w-lg w-full p-8 text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">
          🎉 We’re glad to have you on board!
        </h1>

        <p className="text-gray-500 mb-6 text-lg font-medium">
          Premium Package – Only{" "}
          <span className="text-blue-600 font-bold">$3/month</span>
        </p>

        <p className="text-gray-700 mb-6">
          Accelerate your exploration with these cool features:
        </p>

        <ul className="text-left space-y-3 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-gray-800">
              <CheckCircle className="text-green-500 w-5 h-5" />
              {feature}
            </li>
          ))}
          <li className="flex items-center gap-2 text-gray-800">
            <CheckCircle className="text-green-500 w-5 h-5" />
            <span>
              <Link
                href="/convert-webp"
                className="text-blue-600 hover:underline font-semibold"
              >
                WebP image converter
              </Link>{" "}
              – Save up space for more adventures to capture.
            </span>
          </li>
        </ul>

        <div className="text-center mb-6">
          <span>
            See our{" "}
            <span
              className="cursor-pointer text-blue-600 hover:underline"
              onClick={() => router.push("/terms-and-conditions")}
            >
              Terms and Conditions
            </span>{" "}
            for more.
          </span>
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="cursor-pointer w-full bg-blue-600 text-white py-3 rounded-xl text-lg font-semibold shadow-md hover:bg-blue-700 transition-transform transform hover:scale-105 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Start Exploring 🚀"}
        </button>
      </div>
    </div>
  );
};

export default PremiumWelcome;
