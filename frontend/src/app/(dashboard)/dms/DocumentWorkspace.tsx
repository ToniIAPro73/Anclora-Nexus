"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const DocViewer = dynamic(() => import("@iamjariwala/react-doc-viewer"), { ssr: false });

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
      className="flex flex-col lg:flex-row gap-5 h-[85vh] w-full rounded-2xl border border-[var(--border-subtle)] p-4 bg-[var(--navy-surface)]"
      data-document-id={documentId}
    >
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-serif text-[var(--white-soft)]">Revision pre-firma</h2>
          {signatureFlowUrl && !showSignPanel && (
            <button
              onClick={() => setShowSignPanel(true)}
              className="px-6 h-12 bg-gold hover:bg-gold-muted text-navy-deep font-bold rounded-xl"
            >
              Iniciar Firma Electronica
            </button>
          )}
        </div>
        <div className="flex-1 bg-[var(--navy-deep)] rounded-xl overflow-hidden border border-[var(--border-default)]">
          <DocViewer
            documents={[{ uri: documentUrl, fileType }]}
            config={{ header: { disableHeader: true }, pdfZoom: { defaultZoom: 1.0, zoomJump: 0.2 } }}
          />
        </div>
      </div>

      {showSignPanel && signatureFlowUrl && (
        <div className="w-full lg:w-[450px] flex flex-col bg-[var(--navy-deep)] rounded-xl border border-[var(--border-strong)] overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-[var(--border-subtle)]">
            <span className="font-serif text-[var(--white-soft)] font-bold">Pasarela de Firma</span>
            <button onClick={() => setShowSignPanel(false)} className="text-sm text-[var(--text-muted)]">
              Cancelar
            </button>
          </div>
          <div className="flex-1 relative">
            <iframe
              src={signatureFlowUrl}
              className="absolute inset-0 w-full h-full border-none"
              title="DocuSeal eSignature"
              allow="camera; geolocation"
              onLoad={() => setIsSignReady(true)}
            />
            {!isSignReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-[var(--navy-deep)]">
                <span className="text-[var(--text-muted)] animate-pulse">Cargando pasarela...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
