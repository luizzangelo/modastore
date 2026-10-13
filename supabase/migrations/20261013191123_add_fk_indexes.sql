-- Composite foreign keys prevent cross-tenant references. These indexes use
-- the FK column order so updates/deletes on parent rows remain efficient.
create index variants_product_store_fk_idx on public.product_variants (product_id, store_id);
create index payments_receivable_store_fk_idx on public.receivable_payments (receivable_id, store_id);
create index receivables_customer_store_fk_idx on public.receivables (customer_id, store_id);
create index receivables_sale_store_fk_idx on public.receivables (sale_id, store_id);
create index sale_items_product_store_fk_idx on public.sale_items (product_id, store_id);
create index sale_items_sale_store_fk_idx on public.sale_items (sale_id, store_id);
create index sale_items_store_fk_idx on public.sale_items (store_id);
create index sale_items_variant_product_store_fk_idx on public.sale_items (variant_id, product_id, store_id);
create index sales_customer_store_fk_idx on public.sales (customer_id, store_id);

comment on function public.create_sale(jsonb) is
  'SECURITY DEFINER is intentional: the RPC atomically writes protected financial tables. It requires auth.uid(), resolves the caller store internally, uses an empty search_path, and is executable only by authenticated.';
comment on function public.register_receivable_payment(uuid, numeric, date, text, text) is
  'SECURITY DEFINER is intentional: direct payment writes are denied. The RPC authenticates the caller, scopes by store, locks the receivable, and validates the balance.';
comment on function public.reverse_receivable_payment(uuid) is
  'SECURITY DEFINER is intentional: direct payment updates are denied. The RPC authenticates the caller and scopes the payment by caller store.';
comment on function public.cancel_sale(uuid) is
  'SECURITY DEFINER is intentional: cancellation updates sale, stock and receivables atomically after caller and store validation.';
comment on function public.create_manual_receivables(uuid, text, numeric, integer, date) is
  'SECURITY DEFINER is intentional: receivable writes are restricted to this validated, caller-scoped RPC.';
