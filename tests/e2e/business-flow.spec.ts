import { expect, test } from "@playwright/test";

test("completes the core store workflow", async ({ page }) => {
  const runId = Date.now();
  const productName = `Camiseta E2E ${runId}`;
  const customerName = `Cliente E2E ${runId}`;
  const customerPhone = `859${String(runId).slice(-8)}`;

  await page.goto("/login");
  await page.getByLabel("E-mail").fill("ana@modastore.local");
  await page.getByLabel("Senha").fill("ModaStore123!");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  await page.goto("/estoque/novo");
  await page.getByLabel("Nome").fill(productName);
  await page.getByLabel("Custo (R$)").fill("25");
  await page.getByLabel("Venda (R$)").fill("60");
  await page.getByLabel("Estoque mínimo").fill("1");
  await expect(page.getByLabel("Único", { exact: true })).toBeVisible();
  await expect(page.getByLabel("P", { exact: true })).toHaveCount(0);
  await page.getByLabel("P, M, G e GG").check();
  await expect(page.getByLabel("Único", { exact: true })).toHaveCount(0);
  await expect(page.getByLabel("P", { exact: true })).toBeVisible();
  await page.getByLabel("P", { exact: true }).fill("5");
  await page.getByRole("button", { name: "Salvar produto" }).click();
  await expect(page).toHaveURL(/\/estoque\?created=1/);
  await expect(page.getByText(productName)).toBeVisible();

  await page.goto("/vendas/novo");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Tipo de cliente").selectOption("new");
  await page.getByLabel("Nome do cliente (opcional)").fill(customerName);
  await page.getByLabel("Telefone com DDD").fill(customerPhone);
  const productOption = page
    .locator('select[aria-label="Produto 1"] option')
    .filter({ hasText: productName })
    .first();
  const variantId = await productOption.getAttribute("value");
  expect(variantId).toBeTruthy();
  await page.locator('select[aria-label="Produto 1"]').selectOption(variantId!);
  await expect(page.getByText("Total: R$ 60,00")).toBeVisible();
  await page.getByRole("button", { name: "Finalizar venda" }).click();
  await expect(page).toHaveURL(/\/vendas\?created=1/, { timeout: 15_000 });

  await page.goto("/vendas/novo");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Buscar cliente cadastrado").fill(customerName);
  await expect(page.getByText("Cliente selecionado")).toBeVisible();
  await expect(page.getByText(/Telefone: \(85\) 9\d{4}-\d{4}/)).toBeVisible();
  await page.getByLabel("Custo total (R$)").fill("30");
  await page.getByLabel("Valor total (R$)").fill("90");
  await page.getByLabel("Quantidade de peças").fill("2");
  await page.getByLabel("Forma de pagamento").selectOption("cash");
  await page.getByRole("button", { name: "Finalizar venda" }).click();
  await expect(page).toHaveURL(/\/vendas\?created=1/, { timeout: 15_000 });

  await page.goto("/vendas/novo");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Buscar cliente cadastrado").fill(customerName);
  await page.getByLabel("Custo total (R$)").fill("40");
  await page.getByLabel("Valor total (R$)").fill("120");
  await page.getByLabel("Quantidade de peças").fill("2");
  await page.getByLabel("Forma de pagamento").selectOption("credit");
  await page.getByLabel("Entrada recebida (R$)").fill("20");
  await page.getByLabel("Número de parcelas").fill("2");
  await page.getByLabel("Primeiro vencimento").fill("2026-11-30");
  await expect(page.getByText("Prévia das parcelas")).toBeVisible();
  await page.getByRole("button", { name: "Finalizar venda" }).click();
  await expect(page).toHaveURL(/\/vendas\?created=1/, { timeout: 15_000 });

  await page.goto("/contas-a-receber");
  await page
    .locator('select[name="customer"]')
    .selectOption({ label: customerName });
  await page.getByRole("button", { name: "Filtrar" }).click();
  const customerRow = page
    .getByRole("row")
    .filter({ hasText: customerName })
    .first();
  await customerRow.getByRole("button", { name: "Receber" }).click();
  const dialog = page.getByRole("dialog", { name: "Receber parcela" });
  await dialog.getByRole("button", { name: "Confirmar recebimento" }).click();
  await expect(page).toHaveURL(/\/contas-a-receber\?paid=1/);

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await page.goto("/relatorios");
  await expect(page.getByRole("heading", { name: "Relatórios" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ontem" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Últimos 12 meses" }),
  ).toBeVisible();
  await expect(page.getByText("Top 10 melhores clientes")).toBeVisible();
});
