import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { saleIdSchema } from "@/features/sales/schemas";

function csvCell(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!saleIdSchema.safeParse(id).success)
    return new NextResponse("Venda inválida.", { status: 400 });
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims)
    return new NextResponse("Não autorizado.", { status: 401 });
  const { data: sale } = await supabase
    .from("sales")
    .select("*,customers(name)")
    .eq("id", id)
    .single();
  if (!sale) return new NextResponse("Venda não encontrada.", { status: 404 });
  const { data: items } = await supabase
    .from("sale_items")
    .select("product_name,size,quantity,unit_price")
    .eq("sale_id", id);
  const lines = [
    ["Venda", sale.id],
    ["Data", sale.sold_at],
    ["Cliente", sale.customers?.name ?? ""],
    ["Pagamento", sale.payment_method],
    ["Status", sale.status],
    ["Total", sale.total_amount],
    [],
    ["Produto", "Tamanho", "Quantidade", "Preço unitário"],
    ...(items ?? []).map((item) => [
      item.product_name,
      item.size,
      item.quantity,
      item.unit_price,
    ]),
  ];
  const csv = `\uFEFF${lines.map((line) => line.map(csvCell).join(";")).join("\n")}`;
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="venda-${id}.csv"`,
    },
  });
}
