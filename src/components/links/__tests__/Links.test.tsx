import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { LinkItem } from "@/components/links/Links";

describe("LinkItem", () => {
  it("tag=\"a\" iken caller'ın onClick'ini çağırır", async () => {
    const onClick = vi.fn();
    render(
      <MemoryRouter>
        <ul>
          <LinkItem tag="a" link="#" text="Bağlantı" onClick={onClick} />
        </ul>
      </MemoryRouter>
    );

    await userEvent.click(screen.getByText("Bağlantı"));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("tag=\"a\" ve onClick verilmemişse varsayılan navigasyonu engeller", async () => {
    render(
      <MemoryRouter>
        <ul>
          <LinkItem tag="a" link="#" text="Bağlantı" />
        </ul>
      </MemoryRouter>
    );

    const link = screen.getByText("Bağlantı").closest("a") as HTMLAnchorElement;
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    link.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });
});
