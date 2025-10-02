"use client";

export default function TermsAndConditions() {
  return (
    <div className="max-w-3xl mx-auto p-6 text-gray-800">
      <h1 className="text-3xl font-bold mb-4 text-center">Terms & Conditions</h1>
      <p className="text-sm text-gray-500 text-center mb-8">
        Effective Date: October 1, 2025
      </p>

      <p className="mb-4">
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

      <h2 className="text-xl font-semibold mt-6 mb-2">5. Privacy Policy</h2>
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

      <h2 className="text-xl font-semibold mt-6 mb-2">6. User Conduct</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>You agree not to use JigzExplorer for any unlawful purpose.</li>
        <li>Cheating, hacking, or exploiting bugs in the game is prohibited.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">7. Limitation of Liability</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          JigzExplorer is provided <em>“as is”</em> and we make no guarantees of uninterrupted or error-free service.
        </li>
        <li>We are not responsible for any damages resulting from the use of the app.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">8. Changes to Terms</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          JigzExplorer may update these Terms & Conditions from time to time.
        </li>
        <li>
          Continued use of the app after changes means you accept the updated Terms.
        </li>
      </ul>
    </div>
  );
}
