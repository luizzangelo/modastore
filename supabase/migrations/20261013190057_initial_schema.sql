-- ModaStore initial data model. Every business row carries store_id and is
-- protected at the database boundary, not only in application code.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null default 'Minha loja' check (char_length(trim(name)) between 1 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, owner_id)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 160),
  cost_price numeric(12,2) not null check (cost_price >= 0),
  sale_price numeric(12,2) not null check (sale_price > 0),
  min_stock integer not null default 0 check (min_stock >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, store_id)
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  product_id uuid not null,
  size text not null check (size in ('P', 'M', 'G', 'GG', 'UNICO')),
  quantity integer not null default 0 check (quantity >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, size),
  unique (id, store_id),
  unique (id, product_id, store_id),
  foreign key (product_id, store_id) references public.products(id, store_id) on delete cascade
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 160),
  phone text check (phone is null or phone ~ '^\d{10,11}$'),
  origin text not null check (origin in ('new', 'existing')),
  acquired_at date,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, store_id),
  check ((origin = 'new' and acquired_at is not null) or origin = 'existing')
);

create table public.sales (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  customer_id uuid,
  sold_at date not null,
  payment_method text not null check (payment_method in ('pix', 'card', 'cash', 'credit')),
  channel text not null check (channel in ('physical_store', 'online', 'mail', 'whatsapp', 'other')),
  status text not null default 'completed' check (status in ('completed', 'canceled')),
  entry_mode text not null check (entry_mode in ('itemized', 'manual')),
  total_amount numeric(12,2) not null check (total_amount > 0),
  total_cost numeric(12,2) not null check (total_cost >= 0),
  pieces_count integer not null default 0 check (pieces_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, store_id),
  foreign key (customer_id, store_id) references public.customers(id, store_id) on delete restrict,
  check (payment_method <> 'credit' or customer_id is not null)
);

create table public.sale_items (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  sale_id uuid not null,
  product_id uuid not null,
  variant_id uuid not null,
  product_name text not null,
  size text not null check (size in ('P', 'M', 'G', 'GG', 'UNICO')),
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price > 0),
  unit_cost numeric(12,2) not null check (unit_cost >= 0),
  created_at timestamptz not null default now(),
  foreign key (sale_id, store_id) references public.sales(id, store_id) on delete restrict,
  foreign key (product_id, store_id) references public.products(id, store_id) on delete restrict,
  foreign key (variant_id, product_id, store_id) references public.product_variants(id, product_id, store_id) on delete restrict
);

create table public.receivables (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  customer_id uuid not null,
  sale_id uuid,
  description text not null check (char_length(trim(description)) between 1 and 240),
  installment_number integer not null check (installment_number > 0),
  installments_total integer not null check (installments_total between 1 and 12),
  due_date date not null,
  amount numeric(12,2) not null check (amount > 0),
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, store_id),
  unique (sale_id, installment_number),
  foreign key (customer_id, store_id) references public.customers(id, store_id) on delete restrict,
  foreign key (sale_id, store_id) references public.sales(id, store_id) on delete restrict,
  check (installment_number <= installments_total)
);

create table public.receivable_payments (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  receivable_id uuid not null,
  amount numeric(12,2) not null check (amount > 0),
  paid_at date not null,
  method text not null check (method in ('pix', 'card', 'cash')),
  notes text check (notes is null or char_length(notes) <= 500),
  reversed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (id, store_id),
  foreign key (receivable_id, store_id) references public.receivables(id, store_id) on delete restrict
);

create index products_store_active_idx on public.products (store_id, active);
create index variants_store_product_idx on public.product_variants (store_id, product_id);
create index customers_store_name_idx on public.customers (store_id, name);
create unique index customers_store_phone_uidx on public.customers (store_id, phone) where phone is not null;
create index sales_store_sold_at_idx on public.sales (store_id, sold_at desc);
create index sales_store_customer_idx on public.sales (store_id, customer_id);
create index receivables_store_due_idx on public.receivables (store_id, due_date);
create index receivables_store_customer_idx on public.receivables (store_id, customer_id);
create index payments_store_receivable_idx on public.receivable_payments (store_id, receivable_id);
create index payments_store_paid_at_idx on public.receivable_payments (store_id, paid_at) where reversed_at is null;

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger stores_set_updated_at before update on public.stores for each row execute function private.set_updated_at();
create trigger products_set_updated_at before update on public.products for each row execute function private.set_updated_at();
create trigger variants_set_updated_at before update on public.product_variants for each row execute function private.set_updated_at();
create trigger customers_set_updated_at before update on public.customers for each row execute function private.set_updated_at();
create trigger sales_set_updated_at before update on public.sales for each row execute function private.set_updated_at();
create trigger receivables_set_updated_at before update on public.receivables for each row execute function private.set_updated_at();

create function private.current_store_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id from public.stores where owner_id = (select auth.uid()) limit 1
$$;
revoke all on function private.current_store_id() from public;
grant execute on function private.current_store_id() to authenticated;
grant usage on schema private to authenticated;

create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.stores (owner_id, name)
  values (new.id, coalesce(nullif(trim(new.raw_user_meta_data ->> 'store_name'), ''), 'Minha loja'));
  return new;
end;
$$;
revoke all on function private.handle_new_user() from public;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

alter table public.stores enable row level security;
alter table public.stores force row level security;
alter table public.products enable row level security;
alter table public.products force row level security;
alter table public.product_variants enable row level security;
alter table public.product_variants force row level security;
alter table public.customers enable row level security;
alter table public.customers force row level security;
alter table public.sales enable row level security;
alter table public.sales force row level security;
alter table public.sale_items enable row level security;
alter table public.sale_items force row level security;
alter table public.receivables enable row level security;
alter table public.receivables force row level security;
alter table public.receivable_payments enable row level security;
alter table public.receivable_payments force row level security;

create policy stores_select_own on public.stores for select to authenticated using ((select auth.uid()) = owner_id);
create policy stores_update_own on public.stores for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);

create policy products_select_own on public.products for select to authenticated using (store_id = (select private.current_store_id()));
create policy products_insert_own on public.products for insert to authenticated with check (store_id = (select private.current_store_id()));
create policy products_update_own on public.products for update to authenticated using (store_id = (select private.current_store_id())) with check (store_id = (select private.current_store_id()));
create policy products_delete_own on public.products for delete to authenticated using (store_id = (select private.current_store_id()));

create policy variants_select_own on public.product_variants for select to authenticated using (store_id = (select private.current_store_id()));
create policy variants_insert_own on public.product_variants for insert to authenticated with check (store_id = (select private.current_store_id()));
create policy variants_update_own on public.product_variants for update to authenticated using (store_id = (select private.current_store_id())) with check (store_id = (select private.current_store_id()));
create policy variants_delete_own on public.product_variants for delete to authenticated using (store_id = (select private.current_store_id()));

create policy customers_select_own on public.customers for select to authenticated using (store_id = (select private.current_store_id()));
create policy customers_insert_own on public.customers for insert to authenticated with check (store_id = (select private.current_store_id()));
create policy customers_update_own on public.customers for update to authenticated using (store_id = (select private.current_store_id())) with check (store_id = (select private.current_store_id()));
create policy customers_delete_own on public.customers for delete to authenticated using (store_id = (select private.current_store_id()));

create policy sales_select_own on public.sales for select to authenticated using (store_id = (select private.current_store_id()));
create policy sales_insert_own on public.sales for insert to authenticated with check (store_id = (select private.current_store_id()));
create policy sales_update_own on public.sales for update to authenticated using (store_id = (select private.current_store_id())) with check (store_id = (select private.current_store_id()));

create policy sale_items_select_own on public.sale_items for select to authenticated using (store_id = (select private.current_store_id()));
create policy sale_items_insert_own on public.sale_items for insert to authenticated with check (store_id = (select private.current_store_id()));

create policy receivables_select_own on public.receivables for select to authenticated using (store_id = (select private.current_store_id()));
create policy receivables_insert_own on public.receivables for insert to authenticated with check (store_id = (select private.current_store_id()));
create policy receivables_update_own on public.receivables for update to authenticated using (store_id = (select private.current_store_id())) with check (store_id = (select private.current_store_id()));

create policy payments_select_own on public.receivable_payments for select to authenticated using (store_id = (select private.current_store_id()));

grant usage on schema public to anon, authenticated;
grant select on public.stores, public.products, public.product_variants, public.customers, public.sales, public.sale_items, public.receivables, public.receivable_payments to authenticated;
grant insert, update, delete on public.products, public.product_variants, public.customers to authenticated;
grant update (name) on public.stores to authenticated;
revoke insert, update, delete on public.receivable_payments from anon, authenticated;

create function private.ensure_payment_balance()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_amount numeric(12,2);
  v_paid numeric(12,2);
begin
  select amount into v_amount from public.receivables where id = new.receivable_id and store_id = new.store_id for update;
  if v_amount is null then raise exception using errcode = 'P0001', message = 'Parcela não encontrada.'; end if;
  select coalesce(sum(amount), 0) into v_paid from public.receivable_payments
    where receivable_id = new.receivable_id and reversed_at is null and id <> new.id;
  if new.reversed_at is null and v_paid + new.amount > v_amount then
    raise exception using errcode = 'P0001', message = 'O pagamento excede o saldo da parcela.';
  end if;
  return new;
end;
$$;
revoke all on function private.ensure_payment_balance() from public;
create trigger ensure_payment_balance before insert or update on public.receivable_payments for each row execute function private.ensure_payment_balance();

create view public.product_inventory with (security_invoker = true) as
select p.*, coalesce(sum(v.quantity), 0)::integer as total_stock,
  case when coalesce(sum(v.quantity), 0) <= p.min_stock then 'low' else 'normal' end as stock_status
from public.products p left join public.product_variants v on v.product_id = p.id and v.store_id = p.store_id
group by p.id;

create view public.receivables_with_status with (security_invoker = true) as
select r.*, c.name as customer_name, c.phone as customer_phone,
  coalesce(sum(p.amount) filter (where p.reversed_at is null), 0)::numeric(12,2) as paid_amount,
  (r.amount - coalesce(sum(p.amount) filter (where p.reversed_at is null), 0))::numeric(12,2) as balance,
  case
    when r.canceled_at is not null then 'canceled'
    when coalesce(sum(p.amount) filter (where p.reversed_at is null), 0) >= r.amount then 'paid'
    when coalesce(sum(p.amount) filter (where p.reversed_at is null), 0) > 0 then 'partial'
    when r.due_date < (now() at time zone 'America/Sao_Paulo')::date then 'overdue'
    else 'open'
  end as computed_status
from public.receivables r
join public.customers c on c.id = r.customer_id and c.store_id = r.store_id
left join public.receivable_payments p on p.receivable_id = r.id and p.store_id = r.store_id
group by r.id, c.name, c.phone;

create view public.customer_summary with (security_invoker = true) as
select c.*,
  s.last_purchase,
  coalesce(s.purchases_count, 0)::integer as purchases_count,
  coalesce(r.outstanding_balance, 0)::numeric(12,2) as outstanding_balance
from public.customers c
left join lateral (
  select max(sold_at) as last_purchase, count(*)::integer as purchases_count
  from public.sales
  where customer_id = c.id and store_id = c.store_id and status = 'completed'
) s on true
left join lateral (
  select sum(balance) as outstanding_balance
  from public.receivables_with_status
  where customer_id = c.id and store_id = c.store_id and computed_status not in ('paid', 'canceled')
) r on true;

grant select on public.product_inventory, public.receivables_with_status, public.customer_summary to authenticated;

create function public.create_sale(payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_store uuid := private.current_store_id();
  v_customer uuid;
  v_sale uuid;
  v_item jsonb;
  v_variant public.product_variants%rowtype;
  v_product public.products%rowtype;
  v_total numeric(12,2) := 0;
  v_cost numeric(12,2) := 0;
  v_pieces integer := 0;
  v_entry numeric(12,2) := coalesce((payload->>'entry_amount')::numeric, 0);
  v_installments integer := coalesce((payload->>'installments')::integer, 1);
  v_base_cents bigint;
  v_total_cents bigint;
  v_part_cents bigint;
  v_due date;
  v_receivable uuid;
  v_remaining_entry numeric(12,2);
begin
  if (select auth.uid()) is null or v_store is null then raise exception using errcode = '42501', message = 'Não autorizado.'; end if;
  if payload->>'customer_type' not in ('new', 'existing') then raise exception using errcode = '22023', message = 'Informe o tipo de cliente.'; end if;

  v_customer := nullif(payload->>'customer_id', '')::uuid;
  if v_customer is null and payload ? 'customer' then
    insert into public.customers (store_id, name, phone, origin, acquired_at)
    values (v_store, trim(payload#>>'{customer,name}'), nullif(regexp_replace(payload#>>'{customer,phone}', '\D', '', 'g'), ''),
      case when payload->>'customer_type' = 'new' then 'new' else 'existing' end,
      case when payload->>'customer_type' = 'new' then (payload->>'sold_at')::date else null end)
    returning id into v_customer;
  elsif v_customer is not null and not exists (select 1 from public.customers where id = v_customer and store_id = v_store) then
    raise exception using errcode = 'P0001', message = 'Cliente não encontrado.';
  end if;

  if payload->>'payment_method' = 'credit' and v_customer is null then raise exception using errcode = '22023', message = 'Venda fiado exige cliente.'; end if;

  if jsonb_array_length(coalesce(payload->'items', '[]'::jsonb)) > 0 then
    perform 1 from public.product_variants
      where store_id = v_store and id in (select (value->>'variant_id')::uuid from jsonb_array_elements(payload->'items'))
      order by id for update;
    for v_item in select value from jsonb_array_elements(payload->'items') loop
      select * into v_variant from public.product_variants where id = (v_item->>'variant_id')::uuid and store_id = v_store;
      if not found then raise exception using errcode = 'P0001', message = 'Variação não encontrada.'; end if;
      select * into v_product from public.products where id = v_variant.product_id and store_id = v_store and active;
      if not found then raise exception using errcode = 'P0001', message = 'Produto inativo ou não encontrado.'; end if;
      if (v_item->>'quantity')::integer <= 0 or v_variant.quantity < (v_item->>'quantity')::integer then raise exception using errcode = 'P0001', message = 'Estoque insuficiente para ' || v_product.name || ' (' || v_variant.size || ').'; end if;
      v_total := v_total + v_product.sale_price * (v_item->>'quantity')::integer;
      v_cost := v_cost + v_product.cost_price * (v_item->>'quantity')::integer;
      v_pieces := v_pieces + (v_item->>'quantity')::integer;
    end loop;
    insert into public.sales (store_id, customer_id, sold_at, payment_method, channel, entry_mode, total_amount, total_cost, pieces_count)
    values (v_store, v_customer, coalesce((payload->>'sold_at')::date, (now() at time zone 'America/Sao_Paulo')::date), payload->>'payment_method', payload->>'channel', 'itemized', v_total, v_cost, v_pieces)
    returning id into v_sale;
    for v_item in select value from jsonb_array_elements(payload->'items') loop
      select * into v_variant from public.product_variants where id = (v_item->>'variant_id')::uuid and store_id = v_store;
      select * into v_product from public.products where id = v_variant.product_id and store_id = v_store;
      update public.product_variants set quantity = quantity - (v_item->>'quantity')::integer where id = v_variant.id;
      insert into public.sale_items (store_id, sale_id, product_id, variant_id, product_name, size, quantity, unit_price, unit_cost)
      values (v_store, v_sale, v_product.id, v_variant.id, v_product.name, v_variant.size, (v_item->>'quantity')::integer, v_product.sale_price, v_product.cost_price);
    end loop;
  else
    v_total := (payload->>'total_amount')::numeric;
    v_cost := (payload->>'total_cost')::numeric;
    v_pieces := coalesce((payload->>'pieces_count')::integer, 0);
    if v_total <= 0 or v_cost < 0 or v_pieces < 0 then raise exception using errcode = '22023', message = 'Valores da venda manual são inválidos.'; end if;
    insert into public.sales (store_id, customer_id, sold_at, payment_method, channel, entry_mode, total_amount, total_cost, pieces_count)
    values (v_store, v_customer, coalesce((payload->>'sold_at')::date, (now() at time zone 'America/Sao_Paulo')::date), payload->>'payment_method', payload->>'channel', 'manual', v_total, v_cost, v_pieces)
    returning id into v_sale;
  end if;

  if payload->>'payment_method' = 'credit' then
    if v_entry < 0 or v_entry > v_total or v_installments not between 1 and 12 or nullif(payload->>'first_due_date', '') is null then raise exception using errcode = '22023', message = 'Dados do fiado são inválidos.'; end if;
    v_total_cents := round(v_total * 100)::bigint;
    v_base_cents := v_total_cents / v_installments;
    v_remaining_entry := v_entry;
    for i in 1..v_installments loop
      v_part_cents := case when i = v_installments then v_total_cents - v_base_cents * (v_installments - 1) else v_base_cents end;
      v_due := ((payload->>'first_due_date')::date + make_interval(months => i - 1))::date;
      insert into public.receivables (store_id, customer_id, sale_id, description, installment_number, installments_total, due_date, amount)
      values (v_store, v_customer, v_sale, 'Venda ' || v_sale::text, i, v_installments, v_due, v_part_cents / 100.0)
      returning id into v_receivable;
      if v_remaining_entry > 0 then
        insert into public.receivable_payments (store_id, receivable_id, amount, paid_at, method, notes)
        values (v_store, v_receivable, least(v_remaining_entry, v_part_cents / 100.0), coalesce((payload->>'sold_at')::date, (now() at time zone 'America/Sao_Paulo')::date), coalesce(nullif(payload->>'entry_method', ''), 'cash'), 'Entrada da venda');
        v_remaining_entry := greatest(0, v_remaining_entry - v_part_cents / 100.0);
      end if;
    end loop;
  end if;
  return v_sale;
end;
$$;

create function public.register_receivable_payment(p_receivable_id uuid, p_amount numeric, p_paid_at date, p_method text, p_notes text default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_store uuid := private.current_store_id(); v_due numeric(12,2); v_paid numeric(12,2); v_id uuid;
begin
  if (select auth.uid()) is null or v_store is null then raise exception using errcode = '42501', message = 'Não autorizado.'; end if;
  select amount into v_due from public.receivables where id = p_receivable_id and store_id = v_store and canceled_at is null for update;
  if not found then raise exception using errcode = 'P0001', message = 'Parcela não encontrada.'; end if;
  select coalesce(sum(amount), 0) into v_paid from public.receivable_payments where receivable_id = p_receivable_id and reversed_at is null;
  if p_amount <= 0 or p_amount > v_due - v_paid then raise exception using errcode = 'P0001', message = 'Valor maior que o saldo disponível.'; end if;
  if p_method not in ('pix', 'card', 'cash') then raise exception using errcode = '22023', message = 'Forma de pagamento inválida.'; end if;
  insert into public.receivable_payments (store_id, receivable_id, amount, paid_at, method, notes) values (v_store, p_receivable_id, p_amount, p_paid_at, p_method, p_notes) returning id into v_id;
  return v_id;
end; $$;

create function public.reverse_receivable_payment(p_payment_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare v_store uuid := private.current_store_id();
begin
  if (select auth.uid()) is null or v_store is null then raise exception using errcode = '42501', message = 'Não autorizado.'; end if;
  update public.receivable_payments set reversed_at = now() where id = p_payment_id and store_id = v_store and reversed_at is null;
  if not found then raise exception using errcode = 'P0001', message = 'Pagamento não encontrado ou já estornado.'; end if;
end; $$;

create function public.cancel_sale(p_sale_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare v_store uuid := private.current_store_id(); v_sale public.sales%rowtype;
begin
  if (select auth.uid()) is null or v_store is null then raise exception using errcode = '42501', message = 'Não autorizado.'; end if;
  select * into v_sale from public.sales where id = p_sale_id and store_id = v_store for update;
  if not found or v_sale.status = 'canceled' then raise exception using errcode = 'P0001', message = 'Venda não encontrada ou já cancelada.'; end if;
  if exists (select 1 from public.receivable_payments p join public.receivables r on r.id = p.receivable_id where r.sale_id = p_sale_id and p.reversed_at is null) then raise exception using errcode = 'P0001', message = 'Estorne os pagamentos antes de cancelar a venda.'; end if;
  update public.product_variants v set quantity = v.quantity + i.quantity from public.sale_items i where i.sale_id = p_sale_id and i.variant_id = v.id and i.store_id = v_store;
  update public.receivables set canceled_at = now() where sale_id = p_sale_id and store_id = v_store and canceled_at is null;
  update public.sales set status = 'canceled' where id = p_sale_id;
end; $$;

create function public.create_manual_receivables(p_customer_id uuid, p_description text, p_total numeric, p_installments integer, p_first_due_date date)
returns setof uuid language plpgsql security definer set search_path = '' as $$
declare v_store uuid := private.current_store_id(); v_total_cents bigint; v_base_cents bigint; v_part bigint; v_id uuid;
begin
  if (select auth.uid()) is null or v_store is null then raise exception using errcode = '42501', message = 'Não autorizado.'; end if;
  if not exists (select 1 from public.customers where id = p_customer_id and store_id = v_store) then raise exception using errcode = 'P0001', message = 'Cliente não encontrado.'; end if;
  if p_total <= 0 or p_installments not between 1 and 12 or trim(p_description) = '' then raise exception using errcode = '22023', message = 'Dados da conta são inválidos.'; end if;
  v_total_cents := round(p_total * 100)::bigint; v_base_cents := v_total_cents / p_installments;
  for i in 1..p_installments loop
    v_part := case when i = p_installments then v_total_cents - v_base_cents * (p_installments - 1) else v_base_cents end;
    insert into public.receivables (store_id, customer_id, description, installment_number, installments_total, due_date, amount)
    values (v_store, p_customer_id, trim(p_description), i, p_installments, (p_first_due_date + make_interval(months => i - 1))::date, v_part / 100.0) returning id into v_id;
    return next v_id;
  end loop;
end; $$;

revoke all on function public.create_sale(jsonb) from public, anon;
revoke all on function public.register_receivable_payment(uuid, numeric, date, text, text) from public, anon;
revoke all on function public.reverse_receivable_payment(uuid) from public, anon;
revoke all on function public.cancel_sale(uuid) from public, anon;
revoke all on function public.create_manual_receivables(uuid, text, numeric, integer, date) from public, anon;
grant execute on function public.create_sale(jsonb) to authenticated;
grant execute on function public.register_receivable_payment(uuid, numeric, date, text, text) to authenticated;
grant execute on function public.reverse_receivable_payment(uuid) to authenticated;
grant execute on function public.cancel_sale(uuid) to authenticated;
grant execute on function public.create_manual_receivables(uuid, text, numeric, integer, date) to authenticated;
