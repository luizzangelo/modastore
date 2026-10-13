begin;
select plan(35);

select has_table('public', 'stores', 'stores exists');
select has_table('public', 'receivable_payments', 'payments exists');
select has_view('public', 'product_inventory', 'inventory view exists');
select has_view('public', 'receivables_with_status', 'receivables status view exists');

create temporary table test_ids as
select id as store_b from public.stores where owner_id = '20000000-0000-0000-0000-000000000002';
grant select on test_ids to authenticated;

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);

select is((select count(*)::integer from public.stores), 1, 'user A sees only own store');
select is((select count(*)::integer from public.products), 1, 'user A sees only own products');
select is((select count(*)::integer from public.product_variants), 2, 'user A sees only own variants');
select is((select count(*)::integer from public.customers), 1, 'user A sees only own customers');
select is((select count(*)::integer from public.sales), 1, 'user A sees only own sales');
select is((select count(*)::integer from public.receivables), 4, 'user A sees only own receivables');
select is((select count(*)::integer from public.receivable_payments), 2, 'user A sees only own payments');
select is((select count(*)::integer from public.product_inventory), 1, 'inventory view respects RLS');
select is((select count(*)::integer from public.receivables_with_status), 4, 'receivables view respects RLS');
select is((select count(*)::integer from public.customer_summary), 1, 'customer view respects RLS');

select is_empty($$update public.products set name = 'Ataque' where id = '30000000-0000-0000-0000-000000000002' returning id$$, 'user A cannot update user B product');
select is_empty($$delete from public.products where id = '30000000-0000-0000-0000-000000000002' returning id$$, 'user A cannot delete user B product');
select throws_ok(
  $$insert into public.products (store_id, name, cost_price, sale_price) select store_b, 'Invasão', 1, 2 from test_ids$$,
  '42501',
  'new row violates row-level security policy for table "products"',
  'user A cannot insert into user B store'
);

select lives_ok(
  $$select public.create_sale('{"customer_type":"existing","customer_id":"40000000-0000-0000-0000-000000000001","sold_at":"2026-10-13","payment_method":"pix","channel":"physical_store","total_amount":120,"total_cost":50,"pieces_count":2}'::jsonb)$$,
  'manual sale is created'
);
select is((select entry_mode from public.sales order by created_at desc limit 1), 'manual', 'manual sale stores mode');

select throws_like(
  $$select public.create_sale('{"customer_type":"existing","customer_id":"40000000-0000-0000-0000-000000000001","sold_at":"2026-10-13","payment_method":"cash","channel":"physical_store","items":[{"variant_id":"31000000-0000-0000-0000-000000000001","quantity":99}]}'::jsonb)$$,
  '%Estoque insuficiente%',
  'insufficient stock blocks sale'
);
select is((select quantity from public.product_variants where id = '31000000-0000-0000-0000-000000000001'), 2, 'failed sale leaves stock unchanged');

select lives_ok(
  $$select public.create_sale('{"customer_type":"existing","customer_id":"40000000-0000-0000-0000-000000000001","sold_at":"2026-10-13","payment_method":"cash","channel":"physical_store","items":[{"variant_id":"31000000-0000-0000-0000-000000000001","quantity":1}]}'::jsonb)$$,
  'itemized sale is created'
);
select is((select quantity from public.product_variants where id = '31000000-0000-0000-0000-000000000001'), 1, 'itemized sale decrements stock');

select lives_ok(
  $$select public.create_sale('{"customer_type":"existing","customer_id":"40000000-0000-0000-0000-000000000001","sold_at":"2026-10-13","payment_method":"credit","channel":"whatsapp","total_amount":101,"total_cost":40,"pieces_count":1,"entry_amount":20,"entry_method":"pix","installments":2,"first_due_date":"2026-10-31"}'::jsonb)$$,
  'credit sale is created atomically'
);
select is((select sum(amount) from public.receivables where sale_id = (select id from public.sales where total_amount = 101 and payment_method = 'credit' limit 1)), 101.00::numeric, 'installments sum exactly to total');
select is((select count(*)::integer from public.receivables where sale_id = (select id from public.sales where total_amount = 101 and payment_method = 'credit' limit 1)), 2, 'credit sale creates installments');

select lives_ok(
  $$select public.register_receivable_payment('60000000-0000-0000-0000-000000000002', 20, current_date, 'pix', 'teste pgTAP')$$,
  'partial payment is registered'
);
select is((select balance from public.receivables_with_status where id = '60000000-0000-0000-0000-000000000002'), 40.00::numeric, 'partial payment updates balance');
select throws_like(
  $$select public.register_receivable_payment('60000000-0000-0000-0000-000000000002', 41, current_date, 'pix', null)$$,
  '%maior que o saldo%',
  'payment above balance is blocked'
);
select lives_ok(
  $$select public.reverse_receivable_payment((select id from public.receivable_payments where notes = 'teste pgTAP' order by created_at desc limit 1))$$,
  'payment can be reversed'
);
select is((select balance from public.receivables_with_status where id = '60000000-0000-0000-0000-000000000002'), 60.00::numeric, 'reversal restores balance');

select throws_like(
  $$select public.cancel_sale('50000000-0000-0000-0000-000000000001')$$,
  '%Estorne os pagamentos%',
  'sale with active payments cannot be canceled'
);
select throws_like(
  $$select public.register_receivable_payment('60000000-0000-0000-0000-000000000005', 10, current_date, 'pix', null)$$,
  '%Parcela não encontrada%',
  'RPC cannot pay another store receivable'
);

select set_config('request.jwt.claim.sub', '20000000-0000-0000-0000-000000000002', true);
select is((select count(*)::integer from public.products), 1, 'user B sees only own products');
select is((select count(*)::integer from public.receivables), 1, 'user B sees only own receivables');

select * from finish();
rollback;
