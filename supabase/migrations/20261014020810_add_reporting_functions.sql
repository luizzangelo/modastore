create function public.get_monthly_reports(p_start date, p_end date)
returns table (month date, revenue numeric, net_profit numeric, new_customers bigint, pieces_sold bigint, credit_sold numeric, received numeric)
language sql stable security invoker set search_path = '' as $$
  select m.month::date,
    coalesce((select sum(s.total_amount) from public.sales s where s.status = 'completed' and s.sold_at >= m.month::date and s.sold_at < (m.month + interval '1 month')::date), 0)::numeric,
    coalesce((select sum(s.total_amount - s.total_cost) from public.sales s where s.status = 'completed' and s.sold_at >= m.month::date and s.sold_at < (m.month + interval '1 month')::date), 0)::numeric,
    coalesce((select count(*) from public.customers c where c.origin = 'new' and c.acquired_at >= m.month::date and c.acquired_at < (m.month + interval '1 month')::date), 0)::bigint,
    coalesce((select sum(s.pieces_count) from public.sales s where s.status = 'completed' and s.sold_at >= m.month::date and s.sold_at < (m.month + interval '1 month')::date), 0)::bigint,
    coalesce((select sum(s.total_amount) from public.sales s where s.status = 'completed' and s.payment_method = 'credit' and s.sold_at >= m.month::date and s.sold_at < (m.month + interval '1 month')::date), 0)::numeric,
    coalesce((select sum(p.amount) from public.receivable_payments p where p.reversed_at is null and p.paid_at >= m.month::date and p.paid_at < (m.month + interval '1 month')::date), 0)::numeric
  from generate_series(date_trunc('month', p_start::timestamp), date_trunc('month', p_end::timestamp), interval '1 month') as m(month)
  where p_start <= p_end order by m.month;
$$;

create function public.get_top_customers(p_start date, p_end date)
returns table (customer_id uuid, name text, purchases_count bigint, total_spent numeric, last_purchase date)
language sql stable security invoker set search_path = '' as $$
  select c.id, c.name, count(s.id)::bigint, sum(s.total_amount)::numeric, max(s.sold_at)::date
  from public.customers c join public.sales s on s.customer_id = c.id and s.store_id = c.store_id
  where s.status = 'completed' and s.sold_at between p_start and p_end
  group by c.id, c.name order by count(s.id) desc, sum(s.total_amount) desc, max(s.sold_at) desc limit 10;
$$;

create function public.get_dashboard_summary()
returns table (sales_today numeric, sales_yesterday numeric, new_customers_week bigint, sales_month numeric, sales_previous_month numeric, products_total bigint, low_stock bigint, total_outstanding numeric, overdue numeric)
language sql stable security invoker set search_path = '' as $$
  with dates as (select (now() at time zone 'America/Sao_Paulo')::date as today)
  select
    coalesce((select sum(total_amount) from public.sales, dates where status = 'completed' and sold_at = dates.today), 0)::numeric,
    coalesce((select sum(total_amount) from public.sales, dates where status = 'completed' and sold_at = dates.today - 1), 0)::numeric,
    coalesce((select count(*) from public.customers, dates where origin = 'new' and acquired_at >= dates.today - 6), 0)::bigint,
    coalesce((select sum(total_amount) from public.sales, dates where status = 'completed' and sold_at >= date_trunc('month', dates.today)::date and sold_at <= dates.today), 0)::numeric,
    coalesce((select sum(total_amount) from public.sales, dates where status = 'completed' and sold_at >= (date_trunc('month', dates.today) - interval '1 month')::date and sold_at < date_trunc('month', dates.today)::date), 0)::numeric,
    coalesce((select count(*) from public.product_inventory where active), 0)::bigint,
    coalesce((select count(*) from public.product_inventory where active and stock_status = 'low'), 0)::bigint,
    coalesce((select total_outstanding from public.receivables_summary limit 1), 0)::numeric,
    coalesce((select overdue from public.receivables_summary limit 1), 0)::numeric;
$$;

revoke all on function public.get_monthly_reports(date, date) from public, anon;
revoke all on function public.get_top_customers(date, date) from public, anon;
revoke all on function public.get_dashboard_summary() from public, anon;
grant execute on function public.get_monthly_reports(date, date) to authenticated;
grant execute on function public.get_top_customers(date, date) to authenticated;
grant execute on function public.get_dashboard_summary() to authenticated;
