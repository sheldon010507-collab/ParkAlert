-- Harden public schema access and row-level security for the ParkAlert MVP.
-- Safe to re-run after the initial schema migrations.

alter table public.profiles enable row level security;
alter table public.parking_locations enable row level security;
alter table public.parking_sessions enable row level security;
alter table public.alert_logs enable row level security;

revoke all on all tables in schema public from anon, authenticated;
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.parking_locations to authenticated;
grant select, insert, update, delete on public.parking_sessions to authenticated;
grant select, insert, update, delete on public.alert_logs to authenticated;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
on public.profiles for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users can view own parking locations" on public.parking_locations;
create policy "Users can view own parking locations"
on public.parking_locations for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own parking locations" on public.parking_locations;
create policy "Users can insert own parking locations"
on public.parking_locations for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own parking locations" on public.parking_locations;
create policy "Users can update own parking locations"
on public.parking_locations for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own parking locations" on public.parking_locations;
create policy "Users can delete own parking locations"
on public.parking_locations for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can view own parking sessions" on public.parking_sessions;
create policy "Users can view own parking sessions"
on public.parking_sessions for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own parking sessions" on public.parking_sessions;
create policy "Users can insert own parking sessions"
on public.parking_sessions for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own parking sessions" on public.parking_sessions;
create policy "Users can update own parking sessions"
on public.parking_sessions for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own parking sessions" on public.parking_sessions;
create policy "Users can delete own parking sessions"
on public.parking_sessions for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can view own alert logs" on public.alert_logs;
create policy "Users can view own alert logs"
on public.alert_logs for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own alert logs" on public.alert_logs;
create policy "Users can insert own alert logs"
on public.alert_logs for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own alert logs" on public.alert_logs;
create policy "Users can update own alert logs"
on public.alert_logs for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own alert logs" on public.alert_logs;
create policy "Users can delete own alert logs"
on public.alert_logs for delete
to authenticated
using (auth.uid() = user_id);
