-- Adiciona fontes nacionais e internacionais de engenharia
-- O sistema trata falhas de RSS com timeout de 15s, então fontes instáveis não quebram nada

insert into public.news_sources (name, url, rss_url, category) values

  -- =============================================
  -- BRASIL — Órgãos oficiais
  -- =============================================
  ('Confea',
   'https://www.confea.org.br',
   'https://www.confea.org.br/feed',
   'NORMS'),

  ('CREA-SP',
   'https://www.creasp.org.br',
   'https://www.creasp.org.br/feed/',
   'NORMS'),

  ('CAU/BR',
   'https://caubr.gov.br',
   'https://caubr.gov.br/feed/',
   'NORMS'),

  -- =============================================
  -- BRASIL — Engenharia Civil e Construção
  -- =============================================
  ('Construção Mercado',
   'https://construcaomercado17.pini.com.br',
   'https://construcaomercado17.pini.com.br/feed/',
   'ENGINEERING'),

  ('Infraestrutura Urbana',
   'https://infraestruturaurbana17.pini.com.br',
   'https://infraestruturaurbana17.pini.com.br/feed/',
   'ENGINEERING'),

  ('Sienge Blog',
   'https://www.sienge.com.br/blog',
   'https://www.sienge.com.br/blog/feed/',
   'ENGINEERING'),

  ('Minhacasa Blog',
   'https://blog.minhacasa.com.br',
   'https://blog.minhacasa.com.br/feed/',
   'ENGINEERING'),

  -- =============================================
  -- BRASIL — Arquitetura e Urbanismo
  -- =============================================
  ('Vitruvius',
   'https://vitruvius.com.br',
   'https://vitruvius.com.br/index.php/revistas/read/arquitextos?format=feed&type=rss',
   'ARCHITECTURE'),

  -- =============================================
  -- INTERNACIONAL — Engenharia Civil e Estrutural
  -- =============================================
  ('New Civil Engineer',
   'https://www.newcivilengineer.com',
   'https://www.newcivilengineer.com/feed/',
   'ENGINEERING'),

  ('Civil + Structural Engineer',
   'https://csengineermag.com',
   'https://csengineermag.com/feed/',
   'ENGINEERING'),

  ('Roads & Bridges',
   'https://www.roadsbridges.com',
   'https://www.roadsbridges.com/rss.xml',
   'ENGINEERING'),

  ('Structural Engineer',
   'https://www.structuremag.org',
   'https://www.structuremag.org/feed/',
   'ENGINEERING'),

  -- =============================================
  -- INTERNACIONAL — Construção e Projetos
  -- =============================================
  ('BD+C Building Design',
   'https://www.bdcnetwork.com',
   'https://www.bdcnetwork.com/feed/',
   'ENGINEERING'),

  ('The Architect''s Newspaper',
   'https://www.archpaper.com',
   'https://www.archpaper.com/feed/',
   'ARCHITECTURE'),

  ('Planetizen',
   'https://www.planetizen.com',
   'https://www.planetizen.com/rss.xml',
   'ARCHITECTURE'),

  -- =============================================
  -- INTERNACIONAL — Tecnologia e BIM
  -- =============================================
  ('Autodesk Construction',
   'https://construction.autodesk.com/blog',
   'https://construction.autodesk.com/blog/feed/',
   'TECHNOLOGY'),

  ('Procore Blog',
   'https://www.procore.com/jobsite',
   'https://www.procore.com/jobsite/feed/',
   'TECHNOLOGY')

on conflict (rss_url) do nothing;
