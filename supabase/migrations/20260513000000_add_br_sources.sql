-- Adiciona fontes brasileiras de engenharia e arquitetura

insert into public.news_sources (name, url, rss_url, category) values
  ('ArchDaily Brasil',    'https://www.archdaily.com.br',        'https://www.archdaily.com.br/br/feed',                  'ARCHITECTURE'),
  ('Arcoweb',             'https://www.arcoweb.com.br',          'https://www.arcoweb.com.br/feed',                       'ARCHITECTURE'),
  ('Construnews',         'https://www.construnews.com.br',      'https://www.construnews.com.br/feed/',                  'ENGINEERING'),
  ('Téchne',              'https://techne.pini.com.br',          'https://techne.pini.com.br/feed/',                      'ENGINEERING'),
  ('AU Arquitetura',      'https://au.pini.com.br',              'https://au.pini.com.br/feed/',                          'ARCHITECTURE')
on conflict (rss_url) do nothing;
