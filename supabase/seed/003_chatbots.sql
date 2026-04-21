with p as (
  select id, slug from providers
)
insert into chatbots (
  rank,
  slug,
  name,
  provider_id,
  best_for,
  free_model_name,
  context_window,
  signup_required,
  web_search_free,
  limit_note,
  url,
  use_case_tags
)
values
  (1, 'deepseek-chat', 'DeepSeek Chat', (select id from p where slug = 'deepseek'), 'coding & logic', 'DeepSeek V4 (DeepThink free)', '128K', 'email', true, 'Peak-hour throttling and occasional queue delays', 'https://chat.deepseek.com', '{coding,reasoning}'),
  (2, 'perplexity', 'Perplexity', (select id from p where slug = 'perplexity-ai'), 'research & citations', 'Sonar (free tier)', 'Search-centric retrieval', 'none', true, 'Deep research queries are limited daily', 'https://www.perplexity.ai', '{research,no-signup,reasoning}'),
  (3, 'gemini', 'Gemini', (select id from p where slug = 'google'), 'long-context reasoning', 'Gemini 3.1 Pro (AI Studio)', '1M', 'email', true, '5 RPM on AI Studio free tier', 'https://aistudio.google.com', '{long-context,reasoning,coding}'),
  (4, 'microsoft-copilot', 'Microsoft Copilot', (select id from p where slug = 'microsoft'), 'no-signup general assistant', 'Copilot free model routing', 'Session-based', 'none', true, '5 replies/chat without account, 30 with account', 'https://copilot.microsoft.com', '{no-signup,research,writing}'),
  (5, 'chatgpt', 'ChatGPT', (select id from p where slug = 'openai'), 'reasoning + coding', 'GPT-5.4 (rate-limited)', '128K', 'email', true, 'About 10 messages per 5 hours on best model', 'https://chatgpt.com', '{coding,reasoning,writing}'),
  (6, 'claude', 'Claude', (select id from p where slug = 'anthropic'), 'writing & analysis', 'Claude Sonnet 4.6', '1M beta', 'email', true, 'Strict daily cap and capacity limits', 'https://claude.ai', '{writing,reasoning,long-context}'),
  (7, 'kimi', 'Kimi', (select id from p where slug = 'moonshot-ai'), 'long documents', 'Kimi latest free model', '200K', 'email', true, 'Performance can degrade during peak traffic', 'https://kimi.ai', '{long-context,writing,research}'),
  (8, 'grok', 'Grok', (select id from p where slug = 'xai'), 'real-time social insights', 'Grok 4.1', '256K', 'email', true, 'Free access windows are limited on X', 'https://x.com/i/grok', '{research,reasoning}'),
  (9, 'le-chat', 'Le Chat', (select id from p where slug = 'mistral-ai'), 'fast multilingual chatting', 'Mistral free-tier routing', '128K', 'email', true, 'Daily cap and fallback under heavy load', 'https://chat.mistral.ai', '{speed,writing,research}'),
  (10, 'huggingchat', 'HuggingChat', (select id from p where slug = 'hugging-face'), 'open-source experimentation', 'Rotating open models', '8K-128K (varies)', 'none', false, 'Shared infra leads to variable speed and quality', 'https://huggingface.co/chat/', '{no-signup,writing}')
on conflict (slug) do update set
  rank = excluded.rank,
  name = excluded.name,
  provider_id = excluded.provider_id,
  best_for = excluded.best_for,
  free_model_name = excluded.free_model_name,
  context_window = excluded.context_window,
  signup_required = excluded.signup_required,
  web_search_free = excluded.web_search_free,
  limit_note = excluded.limit_note,
  url = excluded.url,
  use_case_tags = excluded.use_case_tags,
  updated_at = now();
