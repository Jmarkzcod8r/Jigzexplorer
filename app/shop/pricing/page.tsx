"use client";

import { initializePaddle, Paddle } from "@paddle/paddle-js";
import { useEffect, useState } from "react";
import React from "react";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Logo from "@/app/component/logo";
import Link from "next/link";
import { updateEnv} from "@/app/lib/zustand/updateEnvironmet";
import { useUpdateUserProfile } from "@/app/lib/zustand/updateUserProfile";

import { Environment } from "@paddle/paddle-node-sdk";

const PremiumWelcome = () => {
  const router = useRouter();
  const [paddle, setPaddle] = useState<Paddle>();
  const [loading, setLoading] = useState(false);

  const premiumFeatures = [
    "All access to countries",
    // "All access to reusable pictures",
    "Early access to future new features and updates",
    "An opportunity to share your pictures as puzzles for the world to see",
  ];

  const freeFeatures = [
    "Limited access to countries",
    "Play to Unlcok feature",
    "Limited access to webp converter",
    // "Limited access to continents",
  ];

  // ✅ Initialize Paddle.js
  const user=useUpdateUserProfile()
  const env = updateEnv()


  useEffect(() => {
    // '===' instead of '='
    if (env.env === 'sandbox') {
      initializePaddle({
        environment: "sandbox", // Use "sandbox" for testing
        token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN_SANDBOX!,

      }).then((p) => setPaddle(p));
    }

    if (env.env === 'production') {
      initializePaddle({
        environment: "production", // Use "sandbox" for testing
        // token: 'live_75e8b184e28463f4153fc4d2388',
        token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN_LIVE!,

      }).then((p) => setPaddle(p));
    }


  }, [env.env]);

  const isLocalhost = typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
   window.location.hostname === "127.0.0.1");

  const handleCheckout = async () => {
    localStorage.setItem('uid', JSON.stringify(user.user.uid))
    if (!paddle) {
      alert("⚠️ Paddle not initialized yet.");
      return;
    }

    setLoading(true);

    try {
      // Optional: show a temporary "processing" page
      // router.push("/checkout");

      const rawEmail = user.user.email
      const rawuid =  user.user.uid

      let email = "guest@example.com";
      let uid = "...uid...";

      if (rawEmail && rawuid) {
        try {
          email = rawEmail
          uid = rawuid;
        } catch {
          email = rawEmail;
        }
      }

      const checkoutEnv = env.env === "sandbox" ? "sandbox" : "production";

const response = await fetch("/api/paddle/activate-subscription", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, uid, env: checkoutEnv }),
});

const data = await response.json();

if (!response.ok) {
  throw new Error(data?.error || "Failed to create checkout session");
}

//  ✅ Open Paddle checkout
if (data.transactionId && paddle.Checkout) {
  paddle.Checkout.open({
    transactionId: data.transactionId,
    settings: {
      displayMode: "overlay",
      theme: "dark",
      successUrl:
      // isLocalhost
      //   ? "http://localhost:3000/checkout-success"
      //   :
         "https://jigzexplorer.quest/checkout-success",
    },
  });
}

      // let response;

      // if (env.env === "sandbox") {
      //   response = await fetch("/api/paddle/activate-subscription", {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({ email, uid, env: "sandbox" }),
      //   });
      // } else {
      //   response = await fetch("/api/paddle/activate-subscription", {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({ email, uid, env: "production" }),
      //   });
      // }


      //   const data = await response.json();
      //   if (!response.ok) {
      //     throw new Error(data.error || "Failed to create checkout session");
      //   }
      //   //  ✅ Paddle checkout (Overlay or Redirect)
      // if (data.transactionId && paddle.Checkout) {
      //   //  if (paddle.Checkout) {
      //   paddle.Checkout.open({
      //     transactionId: data.transactionId,
      //     // items: [{priceId: "pri_01kaxe46svpfvd2wr3sngap8se" , quantity: 1}],  //-? live
      //     settings: {
      //       displayMode: "overlay", // in-page checkout
      //       theme: "dark",
      //       successUrl: isLocalhost
      //       ? "http://localhost:3000/checkout-success"
      //       : "https://jigzexplorer.quest/checkout-success", // Paddle redirects after success
      //       // closeCallback: () => {
      //       //   // If user closes/cancels checkout
      //       //   router.push("/shop/pricing");
      //       // },
      //     },
      //   });
      // }
      // else if (data.checkoutUrl) {
      //   // ✅ Redirect method fallback
      //   window.location.href = data.checkoutUrl;
      // }
      // else {
      //   throw new Error("Missing checkoutUrl or transactionId from server");
      // }

    } catch (err: any) {
      console.error("Checkout failed:", err);
      alert("Checkout failed. Please try again.");
      router.push("/shop/pricing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-sans flex flex-col items-center justify-center min-h-screen p-6 sm:p-10 bg-[url('/Bg.png')] bg-cover bg-center">
      <Logo />

      {/* Cards Container */}
      <div>
      {isLocalhost ? (
        <div className="p-3 bg-yellow-200 text-black rounded">
          🔧 You are using <b>localhost</b>
        </div>
      ) : (
        <div className="p-3 bg-green-200 text-black rounded">
          {/* 🌍 You are in <b>Production / Online</b> */}
        </div>
      )}
    </div>
      <div className="flex flex-col sm:flex-row gap-8 mt-8">
        {/* Free Package Card */}
        <div className="bg-white shadow-xl rounded-2xl max-w-lg w-full p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-700 mb-2">🆓 Free Package</h1>
            <h2>{user.user.email}</h2>
            {/* <h2>{Environment.env}</h2> */}
          <p className="text-gray-500 mb-6 text-lg font-medium">Enjoy the basics for free</p>

          <ul className="text-left space-y-3 mb-6">
            {freeFeatures.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-gray-800">
                <CheckCircle className="text-green-500 w-5 h-5" />
                {feature}
              </li>
            ))}
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
            onClick={() => router.push("/")}
            className="cursor-pointer w-full bg-gray-600 text-white py-3 rounded-xl text-lg font-semibold shadow-md hover:bg-gray-600 transition-transform transform hover:scale-105"
          >
            Continue Free 🚶‍♂️
          </button>
        </div>

        {/* Premium Package Card */}
        <div className="bg-white shadow-xl rounded-2xl max-w-lg w-full p-8 text-center">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">
            🎉 Premium Package
          </h1>
                {env.env}
          <p className="text-gray-500 mb-6 text-lg font-medium">
            Only <span className="text-blue-600 font-bold">$3/month</span>
          </p>

          {/* <p className="text-gray-700 mb-6">
            Accelerate your exploration with these cool features:
          </p> */}

          <ul className="text-left space-y-3 mb-6">
            {premiumFeatures.map((feature, index) => (
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
            {loading ? "Loading..." : "Subscribe 🚀"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PremiumWelcome;
