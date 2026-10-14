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
    coalesce((select sum(s.total_amount - s.total_cost) from public.sales s where s.status = 'completed' and s.sold_at >= m.month::date and s.sold_at < (m.month + interval '1 month')::date), 0)::numeric,
    coalesce((select count(*) from public.customers c where c.origin = 'new' and c.acquired_at >= m.month::date and c.acquired_at < (m.month + interval '1 month')::date), 0)::bigint,
    coalesce((select sum(s.pieces_count) from public.sales s where s.status = 'completed' and s.sold_at >= m.month::date and s.sold_at < (m.month + interval '1 month')::date), 0)::bigint,
    coalesce((select sum(s.total_amount) from public.sales s where s.status = 'completed' and s.payment_method = 'credit' and s.sold_at >= m.month::date and s.sold_at < (m.month + interval '1 month')::date), 0)::numeric,
    coalesce((select sum(p.amount) from public.receivable_payments p where p.reversed_at is null and p.paid_at >= m.month::date and p.paid_at < (m.month + interval '1 month')::date), 0)::numeric
  from generate_series(date_trunc('month', p_start::timestamp), date_trunc('month', p_end::timestamp), interval '1 month') as m(month)
  where p_start <= p_end order by m.month;
$$;

create or replace function public.get_dashboard_summary()
returns table (sales_today numeric, sales_yesterday numeric, new_customers_week bigint, sales_month numeric, sales_previous_month numeric, products_total bigint, low_stock bigint, total_outstanding numeric, overdue numeric)
language sql stable security invoker set search_path = '' as $$
  with dates as (
    select (now() at time zone 'America/Fortaleza')::date as today
  ), revenue as (
    select d.day,
      coalesce((select sum(s.total_amount) from public.sales s where s.status = 'completed' and s.payment_method <> 'credit' and s.sold_at = d.day), 0) +
      coalesce((select sum(p.amount) from public.receivable_payments p join public.receivables r on r.id = p.receivable_id and r.store_id = p.store_id join public.sales s on s.id = r.sale_id and s.store_id = r.store_id where p.reversed_at is null and s.status = 'completed' and s.payment_method = 'credit' and p.paid_at = d.day), 0) as amount
    from dates, lateral generate_series(
      (date_trunc('month', dates.today) - interval '1 month')::date,
      dates.today,
      interval '1 day'
    ) as d(day)
  )
  select
    coalesce((select amount from revenue, dates where day = dates.today), 0)::numeric,
    coalesce((select amount from revenue, dates where day = dates.today - 1), 0)::numeric,
    coalesce((select count(*) from public.customers, dates where origin = 'new' and acquired_at >= dates.today - 6), 0)::bigint,
    coalesce((select sum(amount) from revenue, dates where day >= date_trunc('month', dates.today)::date and day <= dates.today), 0)::numeric,
    coalesce((select sum(amount) from revenue, dates where day >= (date_trunc('month', dates.today) - interval '1 month')::date and day < date_trunc('month', dates.today)::date), 0)::numeric,
    coalesce((select count(*) from public.product_inventory where active), 0)::bigint,
    coalesce((select count(*) from public.product_inventory where active and stock_status = 'low'), 0)::bigint,
    coalesce((select total_outstanding from public.receivables_summary limit 1), 0)::numeric,
    coalesce((select overdue from public.receivables_summary limit 1), 0)::numeric;
$$;
