-- Development-only identities. Password for both accounts: ModaStore123!
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'ana@modastore.local', extensions.crypt('ModaStore123!', extensions.gen_salt('bf')), now(), '', '', '', '', '{"provider":"email","providers":["email"]}', '{"store_name":"Boutique da Ana"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'bia@modastore.local', extensions.crypt('ModaStore123!', extensions.gen_salt('bf')), now(), '', '', '', '', '{"provider":"email","providers":["email"]}', '{"store_name":"Moda da Bia"}', now(), now());

insert into auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values
  ('11000000-0000-0000-0000-000000000001', 'ana@modastore.local', '10000000-0000-0000-0000-000000000001', '{"sub":"10000000-0000-0000-0000-000000000001","email":"ana@modastore.local"}', 'email', now(), now(), now()),
  ('22000000-0000-0000-0000-000000000002', 'bia@modastore.local', '20000000-0000-0000-0000-000000000002', '{"sub":"20000000-0000-0000-0000-000000000002","email":"bia@modastore.local"}', 'email', now(), now(), now());

do $$
declare
  store_a uuid;
  store_b uuid;
  product_a uuid := '30000000-0000-0000-0000-000000000001';
  customer_a uuid := '40000000-0000-0000-0000-000000000001';
  customer_b uuid := '40000000-0000-0000-0000-000000000002';
  sale_a uuid := '50000000-0000-0000-0000-000000000001';
begin
  select id into store_a from public.stores where owner_id = '10000000-0000-0000-0000-000000000001';
  select id into store_b from public.stores where owner_id = '20000000-0000-0000-0000-000000000002';

  insert into public.products (id, store_id, name, cost_price, sale_price, min_stock)
  values (product_a, store_a, 'Camiseta Essential', 35, 79.90, 3),
         ('30000000-0000-0000-0000-000000000002', store_b, 'Vestido Midi', 70, 169.90, 2);
  insert into public.product_variants (id, store_id, product_id, size, quantity)
  values ('31000000-0000-0000-0000-000000000001', store_a, product_a, 'P', 2),
         ('31000000-0000-0000-0000-000000000002', store_a, product_a, 'M', 8),
         ('31000000-0000-0000-0000-000000000003', store_b, '30000000-0000-0000-0000-000000000002', 'UNICO', 5);

  insert into public.customers (id, store_id, name, phone, origin, acquired_at)
  values (customer_a, store_a, 'Carla Souza', '85999990001', 'new', current_date - 30),
         (customer_b, store_b, 'Daniela Lima', '85999990002', 'existing', null);
  insert into public.sales (id, store_id, customer_id, sold_at, payment_method, channel, entry_mode, total_amount, total_cost, pieces_count)
  values (sale_a, store_a, customer_a, current_date - 30, 'credit', 'whatsapp', 'manual', 400, 150, 4);

  insert into public.receivables (id, store_id, customer_id, sale_id, description, installment_number, installments_total, due_date, amount)
  values
    ('60000000-0000-0000-0000-000000000001', store_a, customer_a, sale_a, 'Venda fiado', 1, 4, current_date - 15, 100),
    ('60000000-0000-0000-0000-000000000002', store_a, customer_a, sale_a, 'Venda fiado', 2, 4, current_date - 5, 100),
    ('60000000-0000-0000-0000-000000000003', store_a, customer_a, sale_a, 'Venda fiado', 3, 4, current_date + 3, 100),
    ('60000000-0000-0000-0000-000000000004', store_a, customer_a, sale_a, 'Venda fiado', 4, 4, current_date + 33, 100),
    ('60000000-0000-0000-0000-000000000005', store_b, customer_b, null, 'Dívida anterior', 1, 1, current_date + 7, 80);

  insert into public.receivable_payments (store_id, receivable_id, amount, paid_at, method, notes)
  values (store_a, '60000000-0000-0000-0000-000000000001', 100, current_date - 15, 'pix', 'Parcela quitada'),
         (store_a, '60000000-0000-0000-0000-000000000002', 40, current_date - 4, 'cash', 'Pagamento parcial');
end $$;
