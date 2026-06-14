import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { GenerateDocumentWizard } from "./GenerateDocumentWizard";

// ── Mock dms-api ──────────────────────────────────────────────────────────────

vi.mock("@/lib/dms-api", () => ({
  previewMissingFields: vi.fn(),
  generateDocument: vi.fn(),
}));

import * as dmsApi from "@/lib/dms-api";

const FOLDER_ID = "folder-123";
const TPL_ID = "tpl-1";
const VERSION_ID = "ver-1";
const DOC_ID = "doc-abc";

const mockTemplates = [
  {
    id: TPL_ID,
    name: "Arras penitenciales",
    template_document_type: "arras_penitenciales",
    latest_version: { id: VERSION_ID, version_number: 1 },
    has_usable_version: true,
  },
];

describe("GenerateDocumentWizard", () => {
  const onSuccess = vi.fn();
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders step 1 — template selection — on open", () => {
    render(
      <GenerateDocumentWizard
        folderId={FOLDER_ID}
        templates={mockTemplates}
        onSuccess={onSuccess}
        onClose={onClose}
      />,
    );
    expect(screen.getByText("Generar documento")).toBeInTheDocument();
    expect(screen.getByText("Arras penitenciales")).toBeInTheDocument();
  });

  it("next button is disabled until a template is selected", () => {
    render(
      <GenerateDocumentWizard
        folderId={FOLDER_ID}
        templates={mockTemplates}
        onSuccess={onSuccess}
        onClose={onClose}
      />,
    );
    const nextBtn = screen.getByRole("button", { name: /siguiente/i });
    expect(nextBtn).toBeDisabled();
  });

  it("advances to step 2 after selecting template and clicking next", async () => {
    vi.mocked(dmsApi.previewMissingFields).mockResolvedValue({
      missing_fields: ["buyer.full_name", "property.address"],
      is_complete: false,
      total_placeholders: 10,
    });

    render(
      <GenerateDocumentWizard
        folderId={FOLDER_ID}
        templates={mockTemplates}
        onSuccess={onSuccess}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByText("Arras penitenciales"));
    fireEvent.click(screen.getByRole("button", { name: /siguiente/i }));

    await waitFor(() => {
      expect(screen.getByText(/Faltan 2 campos/)).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText(/buyer\.full_name/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/property\.address/)).toBeInTheDocument();
  });

  it("generate button is disabled when missing fields are unfilled", async () => {
    vi.mocked(dmsApi.previewMissingFields).mockResolvedValue({
      missing_fields: ["buyer.full_name"],
      is_complete: false,
      total_placeholders: 5,
    });

    render(
      <GenerateDocumentWizard
        folderId={FOLDER_ID}
        templates={mockTemplates}
        onSuccess={onSuccess}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByText("Arras penitenciales"));
    fireEvent.click(screen.getByRole("button", { name: /siguiente/i }));

    await waitFor(() => screen.getByText(/Faltan 1 campo/));

    const generateBtn = screen.getByRole("button", { name: /generar ahora/i });
    expect(generateBtn).toBeDisabled();
  });

  it("blocks generation when folder prerequisites are missing", async () => {
    vi.mocked(dmsApi.previewMissingFields).mockResolvedValue({
      missing_fields: [],
      prerequisite_issues: { missing_party_roles: ["buyer", "seller"] },
      is_complete: false,
      total_placeholders: 0,
    });

    render(
      <GenerateDocumentWizard
        folderId={FOLDER_ID}
        templates={mockTemplates}
        onSuccess={onSuccess}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByText("Arras penitenciales"));
    fireEvent.click(screen.getByRole("button", { name: /siguiente/i }));

    await waitFor(() => screen.getByText(/Faltan datos del expediente/));

    expect(screen.getByText(/comprador, vendedor/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /generar ahora/i })).toBeDisabled();
  });

  it("does not allow generation when preview fails", async () => {
    vi.mocked(dmsApi.previewMissingFields).mockRejectedValue(new Error("Template version is not published"));

    render(
      <GenerateDocumentWizard
        folderId={FOLDER_ID}
        templates={mockTemplates}
        onSuccess={onSuccess}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByText("Arras penitenciales"));
    fireEvent.click(screen.getByRole("button", { name: /siguiente/i }));

    await waitFor(() => screen.getByText("Template version is not published"));

    expect(screen.getByRole("button", { name: /generar ahora/i })).toBeDisabled();
    expect(dmsApi.generateDocument).not.toHaveBeenCalled();
  });

  it("generate button is enabled after all missing fields are filled", async () => {
    vi.mocked(dmsApi.previewMissingFields).mockResolvedValue({
      missing_fields: ["buyer.full_name"],
      is_complete: false,
      total_placeholders: 5,
    });

    render(
      <GenerateDocumentWizard
        folderId={FOLDER_ID}
        templates={mockTemplates}
        onSuccess={onSuccess}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByText("Arras penitenciales"));
    fireEvent.click(screen.getByRole("button", { name: /siguiente/i }));

    await waitFor(() => screen.getByPlaceholderText(/buyer\.full_name/));
    fireEvent.change(screen.getByPlaceholderText(/buyer\.full_name/), {
      target: { value: "John Doe" },
    });

    expect(screen.getByRole("button", { name: /generar ahora/i })).not.toBeDisabled();
  });

  it("calls generateDocument with correct payload and fires onSuccess", async () => {
    vi.mocked(dmsApi.previewMissingFields).mockResolvedValue({
      missing_fields: [],
      is_complete: true,
      total_placeholders: 5,
    });
    vi.mocked(dmsApi.generateDocument).mockResolvedValue({
      document: { id: DOC_ID, title: "Arras penitenciales", status: "draft" } as never,
    } as never);

    render(
      <GenerateDocumentWizard
        folderId={FOLDER_ID}
        templates={mockTemplates}
        onSuccess={onSuccess}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByText("Arras penitenciales"));
    fireEvent.click(screen.getByRole("button", { name: /siguiente/i }));

    await waitFor(() => screen.getByRole("button", { name: /generar ahora/i }));
    fireEvent.click(screen.getByRole("button", { name: /generar ahora/i }));

    await waitFor(() => {
      expect(dmsApi.generateDocument).toHaveBeenCalledWith(
        FOLDER_ID,
        expect.objectContaining({ template_version_id: VERSION_ID }),
      );
    });

    await waitFor(() => screen.getByText("Documento generado"));
    fireEvent.click(screen.getByRole("button", { name: /ver documento/i }));
    expect(onSuccess).toHaveBeenCalledWith(DOC_ID);
  });

  it("closes when X button is clicked", () => {
    render(
      <GenerateDocumentWizard
        folderId={FOLDER_ID}
        templates={mockTemplates}
        onSuccess={onSuccess}
        onClose={onClose}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "" })); // X button (no label)
    // find by aria or by presence
    const closeBtn = document.querySelector("button svg.lucide-x")?.closest("button");
    if (closeBtn) fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it("shows empty state when no templates available", () => {
    render(
      <GenerateDocumentWizard
        folderId={FOLDER_ID}
        templates={[]}
        onSuccess={onSuccess}
        onClose={onClose}
      />,
    );
    expect(
      screen.getByText("No hay plantillas disponibles para este expediente."),
    ).toBeInTheDocument();
  });
});
