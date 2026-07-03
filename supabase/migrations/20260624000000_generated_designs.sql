-- Create generated_designs table to store each AI landscape design generation
-- Simpler than the chinese-names batch/names split: each row here is one
-- complete generation (one source photo -> one result image).

create table public.generated_designs (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade not null,
    original_image_url text not null,
    result_image_url text not null,
    style_id text not null,
    custom_description text,
    plan_type text not null check (plan_type in ('1', '3')),
    credits_used integer not null default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance
create index generated_designs_user_id_idx on public.generated_designs(user_id);
create index generated_designs_created_at_idx on public.generated_designs(created_at);
create index generated_designs_style_id_idx on public.generated_designs(style_id);

-- updated_at trigger (reuses the existing update_updated_at_column() function
-- created in 20241231000001_create_update_function.sql)
create trigger handle_generated_designs_updated_at
    before update on public.generated_designs
    for each row
    execute procedure update_updated_at_column();

-- Enable RLS
alter table public.generated_designs enable row level security;

-- RLS policies: users can only access their own designs
create policy "Users can view their own designs"
    on public.generated_designs for select
    using (auth.uid() = user_id);

create policy "Users can insert their own designs"
    on public.generated_designs for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own designs"
    on public.generated_designs for update
    using (auth.uid() = user_id);

create policy "Users can delete their own designs"
    on public.generated_designs for delete
    using (auth.uid() = user_id);

-- Grant permissions
grant usage on schema public to authenticated;
grant all on public.generated_designs to authenticated;
grant all on public.generated_designs to service_role;
