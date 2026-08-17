"use client";

import GeorgePaymentElement, {
  type CheckoutTier,
} from "@/components/george/checkout/GeorgePaymentElement";

type GeorgeCheckoutPanelProps = {
  tier: CheckoutTier;
  onClose: () => void;
  onLegacyCheckout: (tier: CheckoutTier) => void;
};

export function GeorgeCheckoutPanel({
  tier,
  onClose,
  onLegacyCheckout,
}: GeorgeCheckoutPanelProps) {
  return (
    <>
      <button
        type="button"
        aria-label="Close activation"
        onClick={onClose}
        className="george-motion-fade-soft fixed inset-0 z-[140] bg-black/68 backdrop-blur-[10px]"
      />

      <div className="fixed inset-0 z-[141] flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-[430px]">
          <GeorgePaymentElement
            tier={tier}
            onClose={onClose}
            onLegacyCheckout={onLegacyCheckout}
          />
        </div>
      </div>
    </>
  );
}
