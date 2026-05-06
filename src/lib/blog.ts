export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: number; // minutos
  publishedAt: string; // ISO date
  author: { name: string; initials: string; role: string };
}

export const blogPosts: BlogPost[] = [
  {
    slug: "como-montar-portfolio-engenharia",
    title: "Como montar um portfólio de engenharia que atrai clientes",
    excerpt:
      "Um portfólio bem estruturado pode ser a diferença entre conseguir o projeto dos sonhos ou perder para a concorrência. Veja como profissionais de engenharia estão se destacando.",
    category: "Carreira",
    readTime: 6,
    publishedAt: "2024-12-10",
    author: { name: "Braian Otovicz", initials: "BO", role: "Co-fundador do EngHub" },
    content: `
## Por que todo engenheiro precisa de um portfólio digital

O mercado de engenharia no Brasil é competitivo. Mais de 800 mil engenheiros registrados no CREA disputam projetos todos os dias. A diferença entre quem consegue os melhores contratos e quem depende de indicações aleatórias muitas vezes se resume a uma coisa: **visibilidade profissional**.

Um portfólio digital bem construído funciona como um vendedor 24 horas por dia, 7 dias por semana. Enquanto você está em campo, em reunião ou dormindo, seu portfólio está apresentando seu trabalho para potenciais clientes.

## O que não pode faltar no seu portfólio

### 1. Foto e bio profissional
Clientes contratam pessoas, não currículos. Uma foto profissional e uma bio bem escrita (150-200 palavras) que explique sua especialidade, experiência e o tipo de projeto que você executa faz toda a diferença.

**Evite:** bio genérica como "engenheiro com 10 anos de experiência"
**Prefira:** "Engenheiro civil especializado em estruturas metálicas industriais. Já executei mais de 50 projetos em São Paulo, Minas Gerais e Paraná, com foco em galpões logísticos e plantas industriais."

### 2. Projetos com fotos reais
Essa é a parte mais importante. Mostre projetos reais com:
- **Foto antes e depois** (quando aplicável)
- **Breve descrição do desafio** que o projeto resolveu
- **Dados técnicos relevantes** (metragem, capacidade, prazo)
- **Localização** para aparecer em buscas regionais

### 3. Registro profissional
Exiba seu CREA ou CAU de forma destacada. Isso transmite credibilidade imediata e reduz a barreira para o cliente entrar em contato.

### 4. Serviços com valores orientativos
Muitos engenheiros evitam colocar preços por medo de "assustar" clientes. Na prática, o contrário é verdadeiro: clientes sem referência de preço tendem a não entrar em contato por insegurança.

Coloque uma faixa de valores ("Projetos a partir de R$ 3.000") — isso qualifica o cliente antes mesmo de ele te contatar.

### 5. Avaliações de clientes
Peça avaliações para todos os clientes satisfeitos. Uma nota média acima de 4.5 com depoimentos reais aumenta em até 3x a taxa de contato no perfil.

## Como o EngHub facilita isso tudo

O EngHub foi construído especificamente para engenheiros. Em menos de 30 minutos você cria um perfil completo com todas essas seções, recebe um link exclusivo (enghub.com.br/seunome) e já aparece nas buscas por área e localização.

Mais de 500 engenheiros já têm seus portfólios no EngHub. Comece gratuitamente e veja a diferença.
    `,
  },
  {
    slug: "engenheiro-freelancer-como-precificar",
    title: "Engenheiro freelancer: como precificar seus serviços corretamente",
    excerpt:
      "Cobrar pouco afasta clientes bons. Cobrar muito sem embasamento perde contratos. Veja como encontrar o preço justo para seus serviços de engenharia.",
    category: "Negócios",
    readTime: 8,
    publishedAt: "2024-12-20",
    author: { name: "Braian Otovicz", initials: "BO", role: "Co-fundador do EngHub" },
    content: `
## O erro mais comum na precificação de serviços de engenharia

A maioria dos engenheiros que atua como freelancer comete o mesmo erro: precificar baseado no custo (quanto tempo vou gastar?) em vez do valor (quanto esse projeto vale para o cliente?).

Essa distinção parece sutil, mas muda completamente a conversa de negociação.

## Os três modelos de precificação mais usados

### 1. Por hora
**Funciona para:** consultorias, laudos, pareceres técnicos, projetos de escopo incerto.
**Referência de mercado (2024):** R$ 150–R$ 500/hora dependendo da especialidade e complexidade.

**Dica:** Nunca venda hora. Transforme em pacotes. "Consultoria de 3 horas — R$ 750" é mais fácil de vender do que "R$ 250/hora".

### 2. Por projeto (preço fixo)
**Funciona para:** projetos com escopo bem definido (projeto estrutural de residência, instalação elétrica de galpão).
**Como calcular:**
1. Estime as horas reais de trabalho
2. Multiplique pelo seu valor-hora
3. Adicione 20-30% de margem para imprevistos e revisões
4. Compare com o mercado regional

### 3. Por metro quadrado ou unidade
**Funciona para:** projetos residenciais e comerciais.
**Referência:** R$ 25–R$ 80/m² para projetos estruturais (varia muito por região e complexidade).

## Fatores que justificam cobrar mais

- Prazo urgente (+ 20–50%)
- Área de alta especialização (estruturas especiais, laudos periciais)
- Cliente corporativo (empresas pagam mais e são mais fáceis de trabalhar)
- Região de maior custo de vida (São Paulo, Rio, Brasília)
- Histórico comprovado com avaliações e portfólio sólido

## A armadilha do "faço mais barato para pegar o cliente"

Clientes que exigem desconto antes mesmo de ver seu trabalho raramente se tornam bons clientes. Eles tendem a:
- Pedir mais revisões
- Atrasar pagamentos
- Indicar outros clientes igualmente problemáticos

Prefira reduzir o escopo a reduzir o preço. "Posso fazer o projeto básico por esse valor, sem detalhamento executivo" é uma resposta muito melhor do que simplesmente dar desconto.

## Como o portfólio digital justifica preços maiores

Um engenheiro com portfólio bem montado, avaliações positivas e presença digital profissional consegue cobrar 20-40% a mais do que um profissional sem essa presença — e ainda assim fechar mais contratos.

A razão é simples: o cliente percebe mais valor e confia mais. Invista no seu portfólio antes de baixar seus preços.
    `,
  },
  {
    slug: "crea-cau-diferenca-engenheiro",
    title: "CREA vs CAU: qual o registro certo para cada profissional?",
    excerpt:
      "Entenda as diferenças entre CREA e CAU, quando cada registro é obrigatório e como isso impacta sua atuação profissional e a captação de clientes.",
    category: "Regulamentação",
    readTime: 5,
    publishedAt: "2025-01-05",
    author: { name: "Gabriel", initials: "GA", role: "Co-fundador do EngHub" },
    content: `
## CREA e CAU: entendendo os conselhos profissionais

Para quem está de fora da área, CREA e CAU parecem a mesma coisa. Para quem trabalha na área, a distinção é fundamental — inclusive do ponto de vista legal.

## O que é o CREA?

O **Conselho Regional de Engenharia e Agronomia (CREA)** é o órgão responsável pela fiscalização e regulamentação das profissões de:
- Engenharia (civil, elétrica, mecânica, de produção, ambiental, e dezenas de outras)
- Agronomia
- Geologia
- Meteorologia
- Geografia

Se você se formou em qualquer modalidade de **Engenharia**, seu registro obrigatório é no CREA.

## O que é o CAU?

O **Conselho de Arquitetura e Urbanismo (CAU)** foi criado em 2010 e regula exclusivamente:
- Arquitetos e urbanistas
- Designers de interiores (com formação em arquitetura)

Antes de 2010, arquitetos também se registravam no CREA. Hoje, é obrigatório migrar para o CAU.

## Posso atuar nas duas áreas?

Tecnicamente, um engenheiro civil formado não pode assinar projetos de arquitetura (que exigem CAU), assim como um arquiteto não pode assinar projetos estruturais (que exigem CREA).

Na prática, existe uma área cinzenta em projetos integrados, e muitos escritórios resolvem isso com uma parceria entre engenheiro e arquiteto.

## Por que exibir seu CREA ou CAU no portfólio é importante

Pesquisas mostram que clientes verificam o registro profissional antes de contratar um engenheiro ou arquiteto — especialmente para projetos de maior porte.

Exibir seu número de registro no portfólio:
- Aumenta a credibilidade imediata
- Reduz a desconfiança do cliente
- Diferencia você de profissionais não habilitados

No EngHub, você pode adicionar seu CREA ou CAU diretamente no perfil. Ele aparece no seu portfólio público com um selo de verificação, sinalizando para o cliente que você é um profissional habilitado.

## ART e RRT: o que são e quando emitir

A **ART (Anotação de Responsabilidade Técnica)** é emitida pelo CREA e deve ser registrada em todos os serviços de engenharia. A **RRT (Registro de Responsabilidade Técnica)** é o equivalente do CAU para arquitetos.

Ambas são obrigatórias por lei e protegem tanto o profissional quanto o cliente em caso de problemas técnicos ou jurídicos.
    `,
  },
  {
    slug: "linkedin-engenheiro-dicas",
    title: "Como usar o LinkedIn para conseguir projetos de engenharia",
    excerpt:
      "O LinkedIn é a rede profissional mais poderosa do Brasil. Saiba como engenheiros estão usando a plataforma para fechar contratos sem depender de indicações.",
    category: "Marketing",
    readTime: 7,
    publishedAt: "2025-01-15",
    author: { name: "Braian Otovicz", initials: "BO", role: "Co-fundador do EngHub" },
    content: `
## Por que o LinkedIn é subestimado por engenheiros

A maioria dos engenheiros usa o LinkedIn como um currículo online estático — atualiza quando muda de emprego e esquece. Isso é desperdiçar uma das ferramentas de captação mais poderosas disponíveis.

Profissionais que usam o LinkedIn ativamente relatam receber 3 a 5 contatos qualificados por mês apenas pela plataforma, sem investir em anúncios.

## Os erros mais comuns no perfil de engenheiro no LinkedIn

**Foto:** Use foto profissional com boa iluminação. Sem selfie, sem foto de casamento, sem foto com óculos de sol.

**Headline:** Não escreva apenas "Engenheiro Civil | CREA-SP". Escreva o que você resolve: "Engenheiro Civil | Projetos estruturais para construção civil e industrial | São Paulo"

**Sobre:** Use os primeiros 2-3 parágrafos para explicar sua especialidade, o tipo de cliente que você atende e os resultados que entrega. Termine com uma chamada para ação.

**Experiências:** Adicione fotos e métricas em cada projeto relevante. "Gerenciei construção de 2.400m² com entrega 15 dias antes do prazo" é muito mais impactante do que "Gerenciamento de obras".

## Conteúdo que funciona para engenheiros

Você não precisa postar todo dia. 2-3 posts por semana já são suficientes para manter presença. Os formatos que mais engajam para engenheiros:

1. **Antes e depois de projetos** — fotos reais com contexto técnico
2. **Aprendizados de obra** — "O que aprendi gerenciando meu primeiro projeto de R$ 5 milhões"
3. **Dicas técnicas simples** — conteúdo que um cliente leigo consegue entender e valorizar
4. **Bastidores do dia a dia** — humaniza o profissional e cria conexão

## Como transformar conexões em contratos

O maior erro é pedir trabalho diretamente. A sequência que funciona:

1. Conecte-se com arquitetos, construtoras e gestores de obras da sua região
2. Interaja genuinamente com o conteúdo deles (comente com substância, não só "ótimo post")
3. Envie mensagem direta apresentando-se brevemente APENAS depois de algumas interações
4. Compartilhe seu portfólio (EngHub) como complemento, não como argumento de venda

## O combo LinkedIn + EngHub

O LinkedIn é excelente para construir relacionamentos e gerar visibilidade. O EngHub é onde o cliente vai verificar seus projetos, ler avaliações e decidir entrar em contato.

Coloque o link do seu perfil EngHub no LinkedIn (na seção "Website" e na bio). Isso cria um funil: LinkedIn gera interesse, EngHub fecha a confiança.
    `,
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
