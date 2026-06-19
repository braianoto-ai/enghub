-- Adiciona coluna de idioma nas fontes e artigos para priorizar PT-BR
alter table public.news_sources add column if not exists language text not null default 'en';
alter table public.news_articles add column if not exists language text not null default 'en';

-- Marca fontes brasileiras como português
update public.news_sources set language = 'pt' where url ilike '%confea%'
  or url ilike '%crea%' or url ilike '%caubr%' or url ilike '%aecweb%'
  or url ilike '%pini%' or url ilike '%sienge%' or url ilike '%vitruvius%'
  or url ilike '%minhacasa%' or url ilike '%archdaily.com.br%';

-- Atualiza artigos já inseridos com o idioma da fonte
update public.news_articles a
set language = s.language
from public.news_sources s
where a.source_id = s.id;

create index if not exists news_articles_language_idx on public.news_articles(language);
