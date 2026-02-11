import { useRef, useCallback } from "react";
import SignatureCanvas from "react-signature-canvas";

interface SignaturePadProps {
  onSignatureChange: (dataUrl: string | null) => void;
  label: string;
}

const SignaturePad = ({ onSignatureChange, label }: SignaturePadProps) => {
  const sigRef = useRef<SignatureCanvas>(null);

  const handleEnd = useCallback(() => {
    if (sigRef.current && !sigRef.current.isEmpty()) {
      onSignatureChange(sigRef.current.getTrimmedCanvas().toDataURL("image/png"));
    }
  }, [onSignatureChange]);

  const handleClear = () => {
    sigRef.current?.clear();
    onSignatureChange(null);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="border-2 border-dashed border-border rounded-md bg-card overflow-hidden">
        <SignatureCanvas
          ref={sigRef}
          penColor="#1a2332"
          canvasProps={{
            className: "w-full",
            style: { width: "100%", height: 150 },
          }}
          onEnd={handleEnd}
        />
      </div>
      <button
        type="button"
        onClick={handleClear}
        className="text-xs text-muted-foreground hover:text-foreground underline"
      >
        清除簽名
      </button>
    </div>
  );
};

export default SignaturePad;
