create or replace function public.get_monthly_reports(p_start date, p_end date)
returns table (month date, revenue numeric, net_profit numeric, new_customers bigint, pieces_sold bigint, credit_sold numeric, received numeric)
language sql stable security invoker set search_path = '' as $$
  select m.month::date,
    (
      coalesce((
        select sum(s.total_amount)
        from public.sales s
        where s.status = 'completed'
          and s.payment_method <> 'credit'
          and s.sold_at >= m.month::date
          and s.sold_at < (m.month + interval '1 month')::date
      ), 0) +
      coalesce((
        select sum(p.amount)
        from public.receivable_payments p
        join public.receivables r on r.id = p.receivable_id and r.store_id = p.store_id
        join public.sales s on s.id = r.sale_id and s.store_id = r.store_id
        where p.reversed_at is null
          and s.status = 'completed'
          and s.payment_method = 'credit'
          and p.paid_at >= m.month::date
          and p.paid_at < (m.month + interval '1 month')::date
      ), 0)
    )::numeric,
    (
      coalesce((
        select sum(s.total_amount - s.total_cost)
        from public.sales s
        where s.status = 'completed'
          and s.payment_method <> 'credit'
          and s.sold_at >= m.month::date
          and s.sold_at < (m.month + interval '1 month')::date
      ), 0) +
      coalesce((
        select sum(p.amount * (s.total_amount - s.total_cost) / nullif(s.total_amount, 0))
        from public.receivable_payments p
        join public.receivables r on r.id = p.receivable_id and r.store_id = p.store_id
        join public.sales s on s.id = r.sale_id and s.store_id = r.store_id
        where p.reversed_at is null
          and s.status = 'completed'
          and s.payment_method = 'credit'
          and p.paid_at >= m.month::date
          and p.paid_at < (m.month + interval '1 month')::date
      ), 0)
    )::numeric,
    coalesce((select count(*) from public.customers c where c.origin = 'new' and c.acquired_at >= m.month::date and c.acquired_at < (m.month + interval '1 month')::date), 0)::bigint,
    coalesce((select sum(s.pieces_count) from public.sales s where s.status = 'completed' and s.sold_at >= m.month::date and s.sold_at < (m.month + interval '1 month')::date), 0)::bigint,
    coalesce((select sum(s.total_amount) from public.sales s where s.status = 'completed' and s.payment_method = 'credit' and s.sold_at >= m.month::date and s.sold_at < (m.month + interval '1 month')::date), 0)::numeric,
    coalesce((select sum(p.amount) from public.receivable_payments p where p.reversed_at is null and p.paid_at >= m.month::date and p.paid_at < (m.month + interval '1 month')::date), 0)::numeric
  from generate_series(date_trunc('month', p_start::timestamp), date_trunc('month', p_end::timestamp), interval '1 month') as m(month)
  where p_start <= p_end order by m.month;
$$;
