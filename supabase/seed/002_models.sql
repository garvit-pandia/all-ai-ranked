with p as (
  select id, slug from providers
)
insert into models (
  slug,
  name,
  provider_id,
  source,
  context_window,
  speed_score,
  cost_label,
  capability_tags,
  is_new_2026,
  status,
  note
)
values
  ('gemini-3-1-pro', 'Gemini 3.1 Pro', (select id from p where slug = 'google-ai-studio'), 'paid', '1M', 3, 'included', '{reasoning,coding,long-context,multimodal}', true, 'active', null),
  ('gemini-3-flash', 'Gemini 3 Flash', (select id from p where slug = 'google-ai-studio'), 'paid', '1M', 5, 'included', '{speed,writing,multimodal,long-context}', true, 'active', null),
  ('gemini-3-pro', 'Gemini 3 Pro', (select id from p where slug = 'google-ai-studio'), 'paid', '1M', 3, 'included', '{coding,reasoning,writing,multimodal}', true, 'active', null),
  ('gemini-2-5-pro', 'Gemini 2.5 Pro', (select id from p where slug = 'google-ai-studio'), 'paid', '1M', 2, 'included', '{reasoning,coding,long-context}', false, 'active', null),
  ('gpt-5-2-instant', 'GPT-5.2 Instant', (select id from p where slug = 'openai'), 'paid', '128K', 5, 'included', '{speed,writing,coding}', true, 'active', null),
  ('gpt-5-2-thinking', 'GPT-5.2 Thinking', (select id from p where slug = 'openai'), 'paid', '256K', 2, 'included', '{reasoning,coding,writing}', true, 'active', 'Verify GPT-5.4 availability in Go plan.'),
  ('claude-sonnet-4-6', 'Claude Sonnet 4.6', (select id from p where slug = 'github-copilot'), 'paid', '1M beta', 3, 'included', '{writing,reasoning,coding,long-context}', true, 'active', null),
  ('claude-haiku-4-5', 'Claude Haiku 4.5', (select id from p where slug = 'github-copilot'), 'paid', '200K', 5, 'included', '{speed,writing}', true, 'active', null),
  ('gpt-5-2-codex', 'GPT-5.2-Codex', (select id from p where slug = 'github-copilot'), 'paid', '128K', 4, 'included', '{coding,reasoning,speed}', true, 'active', null),
  ('gpt-5-1-codex', 'GPT-5.1-Codex', (select id from p where slug = 'github-copilot'), 'paid', '128K', 4, 'included', '{coding,speed}', false, 'retired', 'Retired on March 11, 2026. Verify Copilot replacement.'),
  ('llama-4-scout-17b', 'Llama 4 Scout 17B', (select id from p where slug = 'groq'), 'free_api', '128K', 5, 'free_api', '{multimodal,speed,coding}', true, 'active', null),
  ('kimi-k2', 'Kimi K2', (select id from p where slug = 'groq'), 'free_api', '200K', 4, 'free_api', '{long-context,reasoning,writing}', true, 'active', null),
  ('qwen-3-32b', 'Qwen 3 32B', (select id from p where slug = 'groq'), 'free_api', '128K', 5, 'free_api', '{coding,reasoning,speed}', true, 'active', null),
  ('llama-3-3-70b-groq', 'Llama 3.3 70B', (select id from p where slug = 'groq'), 'free_api', '128K', 4, 'free_api', '{coding,reasoning,writing}', false, 'active', null),
  ('deepseek-r1', 'DeepSeek R1', (select id from p where slug = 'groq'), 'free_api', '128K', 3, 'free_api', '{reasoning,coding}', false, 'active', null),
  ('llama-3-3-70b-cerebras', 'Llama 3.3 70B', (select id from p where slug = 'cerebras'), 'free_api', '128K', 5, 'free_api', '{speed,coding,reasoning}', false, 'active', null),
  ('llama-3-1-8b-cerebras', 'Llama 3.1 8B', (select id from p where slug = 'cerebras'), 'free_api', '128K', 5, 'free_api', '{speed,writing}', false, 'active', null),
  ('deepseek-v3', 'DeepSeek V3', (select id from p where slug = 'openrouter'), 'free_api', '128K', 4, 'free_api', '{coding,reasoning}', false, 'active', null),
  ('qwen-2-5-72b', 'Qwen 2.5 72B', (select id from p where slug = 'openrouter'), 'free_api', '128K', 3, 'free_api', '{reasoning,coding,writing}', false, 'active', null),
  ('mistral-7b', 'Mistral 7B', (select id from p where slug = 'openrouter'), 'free_api', '32K', 5, 'free_api', '{speed,writing}', false, 'active', null),
  ('llama-3-1-nemotron-70b', 'Llama 3.1 Nemotron 70B', (select id from p where slug = 'nvidia-nim'), 'free_api', '128K', 4, 'free_api', '{reasoning,coding,multimodal}', false, 'active', null),
  ('mistral-nemo', 'Mistral NeMo', (select id from p where slug = 'nvidia-nim'), 'free_api', '128K', 4, 'free_api', '{speed,writing,coding}', false, 'active', null)
on conflict (slug) do update set
  name = excluded.name,
  provider_id = excluded.provider_id,
  source = excluded.source,
  context_window = excluded.context_window,
  speed_score = excluded.speed_score,
  cost_label = excluded.cost_label,
  capability_tags = excluded.capability_tags,
  is_new_2026 = excluded.is_new_2026,
  status = excluded.status,
  note = excluded.note,
  updated_at = now();
