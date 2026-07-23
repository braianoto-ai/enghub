create table public.blog_posts (
  id uuid default gen_random_uuid() primary key,
  slug text not null unique,
  title text not null,
  excerpt text not null,
  content text not null,
  category text not null default 'Digest Semanal',
  read_time int not null default 5,
  published_at timestamptz default now() not null,
  author_name text not null default 'EngHub Editorial',
  author_initials text not null default 'EH',
  author_role text not null default 'Redação EngHub',
  is_published boolean default true not null,
  is_ai_generated boolean default false not null,
  created_at timestamptz default now() not null
);

create index blog_posts_published_at_idx on public.blog_posts(published_at desc);
create index blog_posts_slug_idx on public.blog_posts(slug);

alter table public.blog_posts enable row level security;

create policy "Posts publicados são públicos"
  on public.blog_posts for select using (is_published = true);

-- Migra os 4 posts hardcoded existentes
insert into public.blog_posts (slug, title, excerpt, content, category, read_time, published_at, author_name, author_initials, author_role, is_ai_generated) values
(
  'como-montar-portfolio-engenharia',
  'Como montar um portfólio de engenharia que atrai clientes',
  'Um portfólio bem estruturado pode ser a diferença entre conseguir o projeto dos sonhos ou perder para a concorrência. Veja como profissionais de engenharia estão se destacando.',
  '## Por que todo engenheiro precisa de um portfólio digital

O mercado de engenharia no Brasil é competitivo. Mais de 800 mil engenheiros registrados no CREA disputam projetos todos os dias. A diferença entre quem consegue os melhores contratos e quem depende de indicações aleatórias muitas vezes se resume a uma coisa: **visibilidade profissional**.

Um portfólio digital bem construído funciona como um vendedor 24 horas por dia, 7 dias por semana. Enquanto você está em campo, em reunião ou dormindo, seu portfólio está apresentando seu trabalho para potenciais clientes.

## O que não pode faltar no seu portfólio

### 1. Foto e bio profissional
Clientes contratam pessoas, não currículos. Uma foto profissional e uma bio bem escrita (150-200 palavras) que explique sua especialidade, experiência e o tipo de projeto que você executa faz toda a diferença.

**Evite:** bio genérica como "engenheiro com 10 anos de experiência"
**Prefira:** "Engenheiro civil especializado em estruturas metálicas industriais. Já executei mais de 50 projetos em São Paulo, Minas Gerais e Paraná, com foco em galpões logísticos e plantas industriais."

### 2. Projetos com fotos reais
Mostre projetos reais com foto antes e depois, breve descrição do desafio, dados técnicos relevantes e localização para aparecer em buscas regionais.

### 3. Registro profissional
Exiba seu CREA ou CAU de forma destacada. Isso transmite credibilidade imediata e reduz a barreira para o cliente entrar em contato.

### 4. Serviços com valores orientativos
Coloque uma faixa de valores ("Projetos a partir de R$ 3.000") — isso qualifica o cliente antes mesmo de ele te contatar.

### 5. Avaliações de clientes
Peça avaliações para todos os clientes satisfeitos. Uma nota média acima de 4.5 com depoimentos reais aumenta em até 3x a taxa de contato no perfil.',
  'Carreira', 6, '2024-12-10T00:00:00Z', 'Braian Otovicz', 'BO', 'Co-fundador do EngHub', false
),
(
  'engenheiro-freelancer-como-precificar',
  'Engenheiro freelancer: como precificar seus serviços corretamente',
  'Cobrar pouco afasta clientes bons. Cobrar muito sem embasamento perde contratos. Veja como encontrar o preço justo para seus serviços de engenharia.',
  '## O erro mais comum na precificação de serviços de engenharia

A maioria dos engenheiros que atua como freelancer comete o mesmo erro: precificar baseado no custo em vez do valor para o cliente.

## Os três modelos de precificação mais usados

### 1. Por hora
Funciona para consultorias, laudos, pareceres técnicos. Referência de mercado: R$ 150–R$ 500/hora dependendo da especialidade.

**Dica:** Nunca venda hora. Transforme em pacotes. "Consultoria de 3 horas — R$ 750" é mais fácil de vender do que "R$ 250/hora".

### 2. Por projeto (preço fixo)
Funciona para projetos com escopo bem definido. Estime as horas, multiplique pelo seu valor-hora e adicione 20-30% de margem para imprevistos.

### 3. Por metro quadrado ou unidade
Funciona para projetos residenciais e comerciais. Referência: R$ 25–R$ 80/m² para projetos estruturais.

## Fatores que justificam cobrar mais

- Prazo urgente (+ 20–50%)
- Área de alta especialização
- Cliente corporativo
- Histórico comprovado com avaliações e portfólio sólido

## A armadilha do desconto

Prefira reduzir o escopo a reduzir o preço. "Posso fazer o projeto básico por esse valor, sem detalhamento executivo" é uma resposta muito melhor do que simplesmente dar desconto.',
  'Negócios', 8, '2024-12-20T00:00:00Z', 'Braian Otovicz', 'BO', 'Co-fundador do EngHub', false
),
(
  'crea-cau-diferenca-engenheiro',
  'CREA vs CAU: qual o registro certo para cada profissional?',
  'Entenda as diferenças entre CREA e CAU, quando cada registro é obrigatório e como isso impacta sua atuação profissional e a captação de clientes.',
  '## CREA e CAU: entendendo os conselhos profissionais

Para quem está de fora da área, CREA e CAU parecem a mesma coisa. Para quem trabalha na área, a distinção é fundamental.

## O que é o CREA?

O **Conselho Regional de Engenharia e Agronomia (CREA)** regula engenharia, agronomia, geologia, meteorologia e geografia. Se você se formou em qualquer modalidade de **Engenharia**, seu registro obrigatório é no CREA.

## O que é o CAU?

O **Conselho de Arquitetura e Urbanismo (CAU)** foi criado em 2010 e regula exclusivamente arquitetos e urbanistas. Antes de 2010, arquitetos também se registravam no CREA.

## Posso atuar nas duas áreas?

Um engenheiro civil não pode assinar projetos de arquitetura (que exigem CAU), assim como um arquiteto não pode assinar projetos estruturais (que exigem CREA). Muitos escritórios resolvem isso com parceria entre engenheiro e arquiteto.

## ART e RRT

A **ART (Anotação de Responsabilidade Técnica)** é emitida pelo CREA e obrigatória em todos os serviços de engenharia. A **RRT** é o equivalente do CAU para arquitetos. Ambas protegem profissional e cliente.',
  'Regulamentação', 5, '2025-01-05T00:00:00Z', 'Gabriel', 'GA', 'Co-fundador do EngHub', false
),
(
  'linkedin-engenheiro-dicas',
  'Como usar o LinkedIn para conseguir projetos de engenharia',
  'O LinkedIn é a rede profissional mais poderosa do Brasil. Saiba como engenheiros estão usando a plataforma para fechar contratos sem depender de indicações.',
  '## Por que o LinkedIn é subestimado por engenheiros

A maioria dos engenheiros usa o LinkedIn como um currículo online estático. Profissionais que usam a plataforma ativamente relatam receber 3 a 5 contatos qualificados por mês sem investir em anúncios.

## Os erros mais comuns no perfil

**Headline:** Não escreva apenas "Engenheiro Civil | CREA-SP". Escreva o que você resolve: "Engenheiro Civil | Projetos estruturais para construção civil e industrial | São Paulo"

**Sobre:** Explique sua especialidade, o tipo de cliente que você atende e os resultados que entrega. Termine com uma chamada para ação.

**Experiências:** Adicione fotos e métricas. "Gerenciei construção de 2.400m² com entrega 15 dias antes do prazo" é mais impactante do que "Gerenciamento de obras".

## Conteúdo que funciona para engenheiros

- Antes e depois de projetos com contexto técnico
- Aprendizados de obra
- Dicas técnicas que um cliente leigo consegue entender
- Bastidores do dia a dia

## Como transformar conexões em contratos

Conecte-se com arquitetos e construtoras da sua região, interaja genuinamente com o conteúdo deles e compartilhe seu portfólio EngHub como complemento. O LinkedIn gera interesse, o EngHub fecha a confiança.',
  'Marketing', 7, '2025-01-15T00:00:00Z', 'Braian Otovicz', 'BO', 'Co-fundador do EngHub', false
);
