import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileUploadZone } from "@/components/shared/FileUploadZone";

const MAX_SIZE = 8 * 1024 * 1024;

describe("FileUploadZone", () => {
  it("boyutu aşan dosyayı reddeder ve galeriye eklemez", async () => {
    const user = userEvent.setup();
    const onFilesSelected = vi.fn();

    render(
      <FileUploadZone
        onFilesSelected={onFilesSelected}
        accept={{ "image/png": [".png"] }}
        maxFiles={20}
        maxSize={MAX_SIZE}
      />
    );

    const file = new File(["x"], "huge.png", { type: "image/png" });
    Object.defineProperty(file, "size", { value: MAX_SIZE + 1 });
    await user.upload(screen.getByLabelText("Dosya seç"), file);

    expect(await screen.findByRole("alert")).toHaveTextContent(/çok büyük/i);
    expect(onFilesSelected).not.toHaveBeenCalled();
  });

  it("kabul edilen küçük görseli iletir", async () => {
    const user = userEvent.setup();
    const onFilesSelected = vi.fn();

    render(
      <FileUploadZone
        onFilesSelected={onFilesSelected}
        accept={{ "image/png": [".png"] }}
        maxFiles={20}
        maxSize={MAX_SIZE}
      />
    );

    const file = new File([new Uint8Array([137, 80, 78, 71])], "ok.png", { type: "image/png" });
    await user.upload(screen.getByLabelText("Dosya seç"), file);

    expect(onFilesSelected).toHaveBeenCalledTimes(1);
    expect(onFilesSelected.mock.calls[0][0][0].name).toBe("ok.png");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
