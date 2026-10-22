import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CustomerList } from "./customer-list";

vi.mock("./actions", () => ({
  deleteCustomer: vi.fn(),
  toggleCustomer: vi.fn(),
}));

afterEach(cleanup);

const baseCustomer = {
  id: "40000000-0000-0000-0000-000000000001",
  name: "Cliente teste",
  phone: "82999999999",
  last_purchase: null,
  outstanding_balance: 0,
  active: true,
};

describe("CustomerList", () => {
  it("blocks deletion while the customer has completed sales", async () => {
    const user = userEvent.setup();
    render(
      <CustomerList customers={[{ ...baseCustomer, purchases_count: 1 }]} />,
    );

    await user.click(
      screen.getByRole("button", { name: /excluir cliente teste/i }),
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Cancele todas as vendas",
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("asks for confirmation when the customer has no completed sales", async () => {
    const user = userEvent.setup();
    render(
      <CustomerList customers={[{ ...baseCustomer, purchases_count: 0 }]} />,
    );

    await user.click(
      screen.getByRole("button", { name: /excluir cliente teste/i }),
    );

    expect(
      screen.getByRole("dialog", { name: "Excluir cliente" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/será excluído permanentemente/i),
    ).toBeInTheDocument();
  });
});
