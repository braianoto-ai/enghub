-- Fontes de engenharia mecânica, elétrica, automação e indústria
-- Expande o portal além de civil/arquitetura

insert into public.news_sources (name, url, rss_url, category, language) values

  -- =============================================
  -- BRASIL — Engenharia Elétrica e Eletrônica
  -- =============================================
  ('Mundo da Elétrica',
   'https://www.mundodaeletrica.com.br',
   'https://www.mundodaeletrica.com.br/feed/',
   'ENGINEERING', 'pt'),

  ('Eletricidade Moderna',
   'https://www.eletricidademoderna.com.br',
   'https://www.eletricidademoderna.com.br/feed/',
   'ENGINEERING', 'pt'),

  ('Canal Solar',
   'https://canalsolar.com.br',
   'https://canalsolar.com.br/feed/',
   'ENGINEERING', 'pt'),

  -- =============================================
  -- BRASIL — Engenharia Mecânica e Metal-Mecânica
  -- =============================================
  ('Metal Mecânica',
   'https://www.metalmecanica.com',
   'https://www.metalmecanica.com/feed/',
   'ENGINEERING', 'pt'),

  ('Mecânica Industrial',
   'https://www.mecanicaindustrial.com.br',
   'https://www.mecanicaindustrial.com.br/feed/',
   'ENGINEERING', 'pt'),

  ('Revista Máquinas e Metais',
   'https://www.maquinasemetais.com.br',
   'https://www.maquinasemetais.com.br/feed/',
   'ENGINEERING', 'pt'),

  -- =============================================
  -- BRASIL — Automação e Indústria
  -- =============================================
  ('Automação Industrial',
   'https://www.automacaoindustrial.com.br',
   'https://www.automacaoindustrial.com.br/feed/',
   'TECHNOLOGY', 'pt'),

  ('Banas Qualidade',
   'https://www.banas.com.br',
   'https://www.banas.com.br/feed/',
   'ENGINEERING', 'pt'),

  ('Portal da Indústria (CNI)',
   'https://noticias.portaldaindustria.com.br',
   'https://noticias.portaldaindustria.com.br/feed/',
   'ENGINEERING', 'pt'),

  -- =============================================
  -- INTERNACIONAL — Engenharia Elétrica e Eletrônica
  -- =============================================
  ('IEEE Spectrum',
   'https://spectrum.ieee.org',
   'https://spectrum.ieee.org/feeds/feed.rss',
   'ENGINEERING', 'en'),

  ('Electronic Design',
   'https://www.electronicdesign.com',
   'https://www.electronicdesign.com/rss/all',
   'ENGINEERING', 'en'),

  ('Power Engineering',
   'https://www.power-eng.com',
   'https://www.power-eng.com/rss/all',
   'ENGINEERING', 'en'),

  -- =============================================
  -- INTERNACIONAL — Engenharia Mecânica e Design
  -- =============================================
  ('Machine Design',
   'https://www.machinedesign.com',
   'https://www.machinedesign.com/rss/all',
   'ENGINEERING', 'en'),

  ('Design News',
   'https://www.designnews.com',
   'https://www.designnews.com/rss',
   'ENGINEERING', 'en'),

  ('Engineering.com',
   'https://www.engineering.com',
   'https://www.engineering.com/rss/contenttype/news/rss.aspx',
   'ENGINEERING', 'en'),

  -- =============================================
  -- INTERNACIONAL — Automação e Controle
  -- =============================================
  ('Control Engineering',
   'https://www.controleng.com',
   'https://www.controleng.com/rss/all',
   'TECHNOLOGY', 'en'),

  ('Automation World',
   'https://www.automationworld.com',
   'https://www.automationworld.com/rss',
   'TECHNOLOGY', 'en'),

  ('Plant Engineering',
   'https://www.plantengineering.com',
   'https://www.plantengineering.com/rss/all',
   'ENGINEERING', 'en')

on conflict (rss_url) do nothing;
