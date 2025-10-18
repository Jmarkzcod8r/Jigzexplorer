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

  // keep your declaration but make it type-safe
  const [paddle, setPaddle] = useState<Paddle | undefined>(undefined);

  const features = [
    "All access to countries",
    "All access to reusable pictures",
    "Early access to future new features and updates",
    "An opportunity to share your pictures as puzzles for the world to see",
  ];

  useEffect(() => {
    initializePaddle({
      environment: "sandbox", // either sandbox or production
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
    }).then((p) => setPaddle(p)); // ✅ safe now
  }, []);

  const handleCheckout = async () => {
    if (!paddle) return alert("⚠️ Paddle not initialized yet.");

    const userEmail = JSON.parse(localStorage.getItem("email") || "null");

    paddle.Checkout.open({
      items: [{ priceId: "pri_01k56yns22wkpzrztxpc0ztr64", quantity: 1 }],
      settings: {
        displayMode: "overlay",
        theme: "dark",
        successUrl: "https://jigzexplorer.quest/checkout-success",
      },
      customData: {
        email:  "guest@example.com", // This is useless since customData needs to be sent in the backend
      },
    });
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
          className="cursor-pointer w-full bg-blue-600 text-white py-3 rounded-xl text-lg font-semibold shadow-md hover:bg-blue-700 transition-transform transform hover:scale-105"
        >
          Start Exploring 🚀
        </button>
      </div>
    </div>
  );
};

export default PremiumWelcome;
