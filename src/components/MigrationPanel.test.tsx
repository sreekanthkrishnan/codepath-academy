import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MigrationPanel } from "./MigrationPanel";

const { previewImport, importLearningData, downloadLegacyLearningBackup } = vi.hoisted(() => ({ previewImport: vi.fn(), importLearningData: vi.fn(), downloadLegacyLearningBackup: vi.fn() }));
vi.mock("../api/learningDataImports", () => ({ previewImport, importLearningData }));
vi.mock("../storage/legacyLearningData", async () => ({ createLegacyBackup: () => ({ schemaVersion: 1, exportedAt: "2026-11-05T00:00:00Z", source: "codepath-academy-client", data: { language: "both", progress: [11, 999], notes: { "1-1": "English and മലയാളം", broken: "keep" } } }), downloadLegacyLearningBackup }));

const preview = { eligible: 2, conflicts: 1, duplicates: 0, unmapped: 1, items: [{ kind: "note", sourceKey: "1-1", code: "CPA-W01-C01", status: "conflict", reason: "An account note already exists for this class" }, { kind: "progress", sourceKey: "999", code: null, status: "unmapped", reason: "Invalid completion marker" }] };

describe("MigrationPanel", () => {
  beforeEach(() => { previewImport.mockResolvedValue(preview); importLearningData.mockResolvedValue({ importId: "import-1", alreadyImported: false, result: preview }); });
  it("requires preview and explicit confirmation while retaining local data", async () => {
    render(<MigrationPanel onClose={vi.fn()} />);
    expect(screen.queryByRole("button", { name: "Confirm import" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Preview import" }));
    await screen.findByText(/2 eligible/);
    expect(screen.getByText(/1-1: conflict/)).toBeInTheDocument();
    expect(screen.getByText(/999: unmapped/)).toBeInTheDocument();
    expect(previewImport.mock.calls[0][0].data.notes["1-1"]).toBe("English and മലയാളം");
    fireEvent.click(screen.getByRole("button", { name: "Confirm import" }));
    await screen.findByText(/Imported 2 eligible records/);
    expect(importLearningData).toHaveBeenCalledOnce();
    expect(importLearningData.mock.calls[0][0].data.progress).toEqual([11, 999]);
  });
  it("exports without storage mutation and reports preview failures safely", async () => {
    previewImport.mockRejectedValueOnce(new Error("offline"));
    render(<MigrationPanel onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Export backup first" }));
    expect(downloadLegacyLearningBackup).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "Preview import" }));
    await waitFor(() => expect(screen.getByText(/browser data has not changed/)).toBeInTheDocument());
    expect(previewImport.mock.calls[0][0].data.notes["1-1"]).toContain("മലയാളം");
  });
});
