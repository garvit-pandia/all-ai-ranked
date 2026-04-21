insert into providers (name, slug, website_url)
values
  ('Google AI Studio', 'google-ai-studio', 'https://aistudio.google.com'),
  ('OpenAI', 'openai', 'https://chatgpt.com'),
  ('GitHub Copilot', 'github-copilot', 'https://github.com/features/copilot'),
  ('Groq', 'groq', 'https://groq.com'),
  ('Cerebras', 'cerebras', 'https://www.cerebras.ai'),
  ('OpenRouter', 'openrouter', 'https://openrouter.ai'),
  ('NVIDIA NIM', 'nvidia-nim', 'https://build.nvidia.com'),
  ('DeepSeek', 'deepseek', 'https://chat.deepseek.com'),
  ('Perplexity AI', 'perplexity-ai', 'https://www.perplexity.ai'),
  ('Google', 'google', 'https://gemini.google.com'),
  ('Microsoft', 'microsoft', 'https://copilot.microsoft.com'),
  ('Anthropic', 'anthropic', 'https://claude.ai'),
  ('Moonshot AI', 'moonshot-ai', 'https://kimi.ai'),
  ('xAI', 'xai', 'https://x.com/i/grok'),
  ('Mistral AI', 'mistral-ai', 'https://chat.mistral.ai'),
  ('Hugging Face', 'hugging-face', 'https://huggingface.co/chat/')
on conflict (slug) do update set
  name = excluded.name,
  website_url = excluded.website_url,
  updated_at = now();
