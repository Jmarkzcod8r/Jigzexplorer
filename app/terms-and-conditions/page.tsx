"use client";

import Logo from "../component/logo";
import Link from "next/link";

export default function TermsAndConditions() {
  return (
    <div
      className="font-sans flex flex-col items-center justify-center
        min-h-screen p-6 sm:p-10 bg-[url('/Bg.png')] bg-cover bg-center"
    >
      <div className="max-w-3xl mx-auto p-6 text-gray-800 bg-white opacity-95">
        <Logo />
        <h1 className="text-3xl font-bold mb-4 text-center">Terms & Conditions</h1>
        <p className="text-sm text-gray-500 text-center mb-8">
          Effective Date: October 1, 2025
        </p>

        <p className="mb-4 text-center">
          Welcome to <strong>JigzExplorer</strong>! By accessing or using our puzzle game app, you agree to the following Terms and Conditions.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">1. Eligibility</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>No minimum legal age is required to play JigzExplorer.</li>
          <li>
            By using this app, you confirm that you understand the nature of the puzzle game and agree to these Terms.
          </li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">2. Game Content</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>JigzExplorer uses images of tourist spots in Europe as puzzle content.</li>
          <li>
            All pictures are licensed under <strong>Creative Commons</strong> and used in accordance with their licensing terms.
          </li>
          <li>JigzExplorer does not claim ownership of these images.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">3. Payments</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Payments for premium features are processed securely through
            a trusted third-party payment provider.
          </li>
          <li>
            JigzExplorer does <strong>not collect, store, or have access</strong> to your
            card or payment information. All sensitive payment details are handled
            directly and securely by the payment gateway.
          </li>
          <li>
            By completing a purchase, you agree to Paddle’s payment terms and conditions.
          </li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">4. Refund Policy</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>At this time, all payments are <strong>non-refundable</strong>.</li>
          <li>Please review your purchase carefully before completing your transaction.</li>
        </ul>

        {/* ✅ New Section: Cancellation Policy */}
        <h2 className="text-xl font-semibold mt-6 mb-2">5. Cancellation Policy</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            You may cancel your subscription at any time during your billing period.
          </li>
          <li>
            To cancel your subscription, please visit{" "}
            <Link
              href="https://jigzexplorer.quest/profile/info"
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              jigzexplorer.quest/profile/info
            </Link>{" "}
            or simply click your profile picture on your profile page to access
            the subscription settings.
          </li>
          <li>
            Once canceled, you will retain access to premium features only until the
            end of your current billing period.
          </li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">6. Privacy Policy</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            JigzExplorer collects only minimal information necessary for gameplay and payment processing (such as an email address for login or payment confirmation, if applicable).
          </li>
          <li>
            We do not sell, rent, or share your personal data with third parties, except as required to process payments through Paddle.
          </li>
          <li>
            You may request deletion of your account and associated data in the future once support is available.
          </li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">7. User Conduct</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>You agree not to use JigzExplorer for any unlawful purpose.</li>
          <li>Cheating, hacking, or exploiting bugs in the game is prohibited.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">8. Limitation of Liability</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            JigzExplorer is provided <em>“as is”</em> and we make no guarantees of uninterrupted or error-free service.
          </li>
          <li>We are not responsible for any damages resulting from the use of the app.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">9. Changes to Terms</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            JigzExplorer may update these Terms & Conditions from time to time.
          </li>
          <li>
            Continued use of the app after changes means you accept the updated Terms.
          </li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">10. Account Suspension and Termination</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                JigzExplorer reserves the right to suspend, restrict, or permanently terminate any account that violates these Terms and Conditions or engages in fraudulent, abusive, or harmful behavior.
              </li>
              <li>
                Such actions may include, but are not limited to, cheating, exploiting bugs, using unauthorized software, or attempting to disrupt the service.
              </li>
              <li>
                We may also suspend or remove accounts to comply with legal obligations, enforce payment terms, or protect the integrity of the platform.
              </li>
              <li>
                JigzExplorer is not liable for any loss of progress, rewards, or subscription time resulting from account suspension or termination due to violation of these Terms.
              </li>
            </ul>
      </div>
    </div>
  );
}
