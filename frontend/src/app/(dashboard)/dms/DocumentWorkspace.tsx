"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const DocViewer = dynamic(() => import("@iamjariwala/react-doc-viewer"), {
  ssr: false,
});

interface DocumentWorkspaceProps {
  documentId: string;
  documentUrl: string;
  fileType: string;
  signatureFlowUrl: string | null;
  onSignatureCompleted: () => void;
}

export function DocumentWorkspace({
  documentId,
  documentUrl,
  fileType,
  signatureFlowUrl,
  onSignatureCompleted,
}: DocumentWorkspaceProps) {
  const [showSignPanel, setShowSignPanel] = useState(false);
  const [isSignReady, setIsSignReady] = useState(false);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      const allowed = process.env.NEXT_PUBLIC_SIGN_SERVICE_URL ?? "";
      if (e.origin !== allowed) return;
      if (e.data === "docuseal:signed" || e.data?.event === "completed") {
        setShowSignPanel(false);
        onSignatureCompleted();
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onSignatureCompleted]);

  return (
    <div
      className="flex h-[85vh] w-full flex-col gap-5 rounded-2xl border border-soft-subtle bg-navy-surface p-4 lg:flex-row"
      data-document-id={documentId}
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-xl text-soft-white">
            Revision pre-firma
          </h2>
          {signatureFlowUrl && !showSignPanel && (
            <button
              onClick={() => setShowSignPanel(true)}
              className="h-12 rounded-xl bg-gold px-6 font-bold text-navy-deep hover:bg-gold-muted"
            >
              Iniciar Firma Electronica
            </button>
          )}
        </div>
        <div className="flex-1 overflow-hidden rounded-xl border border-border bg-navy-deep">
          <DocViewer
            documents={[{ uri: documentUrl, fileType }]}
            config={{
              header: { disableHeader: true },
              pdfZoom: { defaultZoom: 1.0, zoomJump: 0.2 },
            }}
          />
        </div>
      </div>

      {showSignPanel && signatureFlowUrl && (
        <div className="flex w-full flex-col overflow-hidden rounded-xl border border-soft-subtle bg-navy-deep lg:w-112">
          <div className="flex items-center justify-between border-b border-soft-subtle p-4">
            <span className="font-serif font-bold text-soft-white">
              Pasarela de Firma
            </span>
            <button
              onClick={() => setShowSignPanel(false)}
              className="text-sm text-soft-muted"
            >
              Cancelar
            </button>
          </div>
          <div className="relative flex-1">
            <iframe
              src={signatureFlowUrl}
              className="absolute inset-0 h-full w-full border-none"
              title="DocuSeal eSignature"
              allow="camera; geolocation"
              onLoad={() => setIsSignReady(true)}
            />
            {!isSignReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-navy-deep">
                <span className="animate-pulse text-soft-muted">
                  Cargando pasarela...
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
