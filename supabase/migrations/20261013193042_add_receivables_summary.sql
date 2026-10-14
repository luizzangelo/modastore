-- Aggregate on the database so dashboard cards use the same RLS-protected source
-- as the installment list. The invoker's policies on stores and financial tables
-- remain effective through this view.
create view public.receivables_summary with (security_invoker = true) as
select s.id as store_id,
  coalesce((
    select sum(r.balance)
    from public.receivables_with_status r
    where r.store_id = s.id and r.computed_status in ('open', 'partial', 'overdue')
  ), 0)::numeric(12,2) as total_outstanding,
  coalesce((
    select sum(r.balance)
    from public.receivables_with_status r
    where r.store_id = s.id and r.computed_status = 'overdue'
  ), 0)::numeric(12,2) as overdue,
  coalesce((
    select sum(r.balance)
    from public.receivables_with_status r
    where r.store_id = s.id
      and r.computed_status in ('open', 'partial')
      and r.due_date between (now() at time zone 'America/Sao_Paulo')::date
        and (now() at time zone 'America/Sao_Paulo')::date + 7
  ), 0)::numeric(12,2) as due_next_seven_days,
  coalesce((
    select sum(p.amount)
    from public.receivable_payments p
    where p.store_id = s.id and p.reversed_at is null
      and p.paid_at >= date_trunc('month', now() at time zone 'America/Sao_Paulo')::date
      and p.paid_at < (date_trunc('month', now() at time zone 'America/Sao_Paulo') + interval '1 month')::date
  ), 0)::numeric(12,2) as received_this_month
from public.stores s;

grant select on public.receivables_summary to authenticated;
