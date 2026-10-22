create function public.delete_customer(p_customer_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_store uuid := private.current_store_id();
begin
  if (select auth.uid()) is null or v_store is null then
    raise exception using errcode = '42501', message = 'Não autorizado.';
  end if;

  perform 1
  from public.customers
  where id = p_customer_id and store_id = v_store
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'Cliente não encontrado.';
  end if;

  if exists (
    select 1
    from public.sales
    where customer_id = p_customer_id
      and store_id = v_store
      and status <> 'canceled'
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'Cancele todas as vendas do cliente antes de excluir o cadastro.';
  end if;

  if exists (
    select 1
    from public.receivables
    where customer_id = p_customer_id
      and store_id = v_store
      and (sale_id is null or canceled_at is null)
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'Exclua as contas a receber do cliente antes de excluir o cadastro.';
  end if;

  delete from public.receivable_payments p
  using public.receivables r
  where p.receivable_id = r.id
    and p.store_id = v_store
    and r.customer_id = p_customer_id
    and r.store_id = v_store;

  delete from public.receivables
  where customer_id = p_customer_id and store_id = v_store;

  delete from public.sale_items i
  using public.sales s
  where i.sale_id = s.id
    and i.store_id = v_store
    and s.customer_id = p_customer_id
    and s.store_id = v_store
    and s.status = 'canceled';

  delete from public.sales
  where customer_id = p_customer_id
    and store_id = v_store
    and status = 'canceled';

  delete from public.customers
  where id = p_customer_id and store_id = v_store;
end;
$$;

revoke all on function public.delete_customer(uuid) from public, anon;
grant execute on function public.delete_customer(uuid) to authenticated;

comment on function public.delete_customer(uuid) is
  'Exclui um cliente da loja autenticada somente após todas as vendas terem sido canceladas.';
