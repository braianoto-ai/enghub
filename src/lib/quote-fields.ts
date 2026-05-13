export type FieldType = "select" | "text" | "number" | "textarea" | "range";

export interface QuoteField {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  unit?: string;
}

export interface AreaQuoteConfig {
  label: string;
  description: string;
  fields: QuoteField[];
}

export const quoteFieldsByArea: Record<string, AreaQuoteConfig> = {
  CIVIL: {
    label: "Engenharia Civil",
    description: "Projetos estruturais, laudos, obras e reformas",
    fields: [
      {
        id: "project_type",
        label: "Tipo de projeto",
        type: "select",
        required: true,
        options: ["Residencial", "Comercial", "Industrial", "Reforma", "Laudo estrutural", "Outro"],
      },
      {
        id: "area_m2",
        label: "Área estimada",
        type: "number",
        placeholder: "Ex: 120",
        unit: "m²",
      },
      {
        id: "location",
        label: "Cidade / Estado",
        type: "text",
        placeholder: "Ex: São Paulo, SP",
        required: true,
      },
      {
        id: "deadline",
        label: "Prazo desejado",
        type: "select",
        options: ["Urgente (até 2 semanas)", "1 mês", "2 a 3 meses", "Mais de 3 meses", "Sem prazo definido"],
      },
      {
        id: "budget_range",
        label: "Orçamento estimado",
        type: "select",
        options: ["Até R$ 5.000", "R$ 5.000 – R$ 20.000", "R$ 20.000 – R$ 50.000", "Acima de R$ 50.000", "A definir"],
      },
      {
        id: "description",
        label: "Descreva o projeto",
        type: "textarea",
        placeholder: "Conte mais detalhes sobre o que precisa...",
        required: true,
      },
    ],
  },

  ELETRICA: {
    label: "Engenharia Elétrica",
    description: "Instalações, projetos elétricos e laudos",
    fields: [
      {
        id: "project_type",
        label: "Tipo de serviço",
        type: "select",
        required: true,
        options: ["Instalação elétrica nova", "Manutenção/revisão", "Laudo de conformidade", "SPDA (para-raios)", "Automação residencial", "Energia solar", "Outro"],
      },
      {
        id: "property_type",
        label: "Tipo de imóvel",
        type: "select",
        options: ["Residencial", "Comercial", "Industrial", "Rural"],
      },
      {
        id: "area_m2",
        label: "Área do imóvel",
        type: "number",
        placeholder: "Ex: 200",
        unit: "m²",
      },
      {
        id: "location",
        label: "Cidade / Estado",
        type: "text",
        placeholder: "Ex: Curitiba, PR",
        required: true,
      },
      {
        id: "deadline",
        label: "Prazo desejado",
        type: "select",
        options: ["Urgente (até 2 semanas)", "1 mês", "2 a 3 meses", "Sem prazo definido"],
      },
      {
        id: "description",
        label: "Descreva o que precisa",
        type: "textarea",
        placeholder: "Descreva o serviço com o máximo de detalhes...",
        required: true,
      },
    ],
  },

  ARQUITETURA: {
    label: "Arquitetura",
    description: "Projetos arquitetônicos, interiores e reformas",
    fields: [
      {
        id: "project_type",
        label: "Tipo de projeto",
        type: "select",
        required: true,
        options: ["Residencial", "Comercial", "Interiores", "Reforma", "Urbanismo", "Paisagismo", "Outro"],
      },
      {
        id: "area_m2",
        label: "Área estimada",
        type: "number",
        placeholder: "Ex: 150",
        unit: "m²",
      },
      {
        id: "rooms",
        label: "Número de ambientes/quartos",
        type: "number",
        placeholder: "Ex: 3",
      },
      {
        id: "style",
        label: "Estilo preferido",
        type: "select",
        options: ["Moderno", "Contemporâneo", "Minimalista", "Rústico/Industrial", "Clássico", "Sem preferência"],
      },
      {
        id: "location",
        label: "Cidade / Estado",
        type: "text",
        placeholder: "Ex: Florianópolis, SC",
        required: true,
      },
      {
        id: "budget_range",
        label: "Orçamento estimado",
        type: "select",
        options: ["Até R$ 10.000", "R$ 10.000 – R$ 50.000", "R$ 50.000 – R$ 150.000", "Acima de R$ 150.000", "A definir"],
      },
      {
        id: "deadline",
        label: "Prazo desejado",
        type: "select",
        options: ["Urgente (até 1 mês)", "2 a 3 meses", "4 a 6 meses", "Sem prazo definido"],
      },
      {
        id: "description",
        label: "Descreva sua visão",
        type: "textarea",
        placeholder: "Fale sobre o que você imagina para o projeto...",
        required: true,
      },
    ],
  },

  MECANICA: {
    label: "Engenharia Mecânica",
    description: "Projetos mecânicos, HVAC e manutenção industrial",
    fields: [
      {
        id: "project_type",
        label: "Tipo de serviço",
        type: "select",
        required: true,
        options: ["Projeto de máquinas/equipamentos", "Manutenção industrial", "Análise de falhas", "HVAC / Climatização", "Caldeiras e vasos de pressão", "Automação industrial", "Outro"],
      },
      {
        id: "sector",
        label: "Setor",
        type: "select",
        options: ["Industrial", "Automotivo", "Alimentício", "Farmacêutico", "Petroquímico", "Outro"],
      },
      {
        id: "location",
        label: "Cidade / Estado",
        type: "text",
        placeholder: "Ex: Santo André, SP",
        required: true,
      },
      {
        id: "deadline",
        label: "Prazo desejado",
        type: "select",
        options: ["Urgente (até 2 semanas)", "1 mês", "2 a 3 meses", "Sem prazo definido"],
      },
      {
        id: "description",
        label: "Descreva o projeto ou problema",
        type: "textarea",
        placeholder: "Detalhe o que você precisa...",
        required: true,
      },
    ],
  },

  AMBIENTAL: {
    label: "Engenharia Ambiental",
    description: "Licenciamento, EIA/RIMA e gestão ambiental",
    fields: [
      {
        id: "project_type",
        label: "Tipo de serviço",
        type: "select",
        required: true,
        options: ["EIA/RIMA", "Licenciamento ambiental", "Gestão de resíduos (PGRS)", "Recuperação de área degradada", "Auditoria ambiental", "Monitoramento ambiental", "Outro"],
      },
      {
        id: "enterprise_type",
        label: "Tipo de empreendimento",
        type: "text",
        placeholder: "Ex: Indústria alimentícia, loteamento, posto de combustível...",
      },
      {
        id: "location",
        label: "Localização",
        type: "text",
        placeholder: "Ex: Campinas, SP",
        required: true,
      },
      {
        id: "deadline",
        label: "Prazo desejado",
        type: "select",
        options: ["Urgente", "1 mês", "2 a 3 meses", "Sem prazo definido"],
      },
      {
        id: "description",
        label: "Descreva o que precisa",
        type: "textarea",
        placeholder: "Descreva o projeto ou a situação ambiental...",
        required: true,
      },
    ],
  },

  PRODUCAO: {
    label: "Engenharia de Produção",
    description: "Otimização de processos, qualidade e logística",
    fields: [
      {
        id: "project_type",
        label: "Tipo de serviço",
        type: "select",
        required: true,
        options: ["Otimização de processos", "Gestão da qualidade (ISO)", "Layout industrial", "Logística e supply chain", "Gestão de projetos (PMO)", "Lean / Six Sigma", "Outro"],
      },
      {
        id: "company_size",
        label: "Tamanho da empresa",
        type: "select",
        options: ["Microempresa (até 9 func.)", "Pequena (10–49 func.)", "Média (50–249 func.)", "Grande (250+ func.)"],
      },
      {
        id: "sector",
        label: "Setor",
        type: "text",
        placeholder: "Ex: Alimentício, têxtil, logística...",
      },
      {
        id: "location",
        label: "Cidade / Estado",
        type: "text",
        placeholder: "Ex: Belo Horizonte, MG",
        required: true,
      },
      {
        id: "description",
        label: "Descreva o desafio ou projeto",
        type: "textarea",
        placeholder: "Qual é o problema ou oportunidade que quer resolver?",
        required: true,
      },
    ],
  },

  QUIMICA: {
    label: "Engenharia Química",
    description: "Processos industriais, análises e controle de qualidade",
    fields: [
      {
        id: "project_type",
        label: "Tipo de serviço",
        type: "select",
        required: true,
        options: ["Projeto de processo industrial", "Análise laboratorial", "Controle de qualidade", "Desenvolvimento de produto", "Tratamento de efluentes", "Outro"],
      },
      {
        id: "sector",
        label: "Setor industrial",
        type: "text",
        placeholder: "Ex: Petroquímico, farmacêutico, alimentos...",
      },
      {
        id: "location",
        label: "Cidade / Estado",
        type: "text",
        placeholder: "Ex: Camaçari, BA",
        required: true,
      },
      {
        id: "description",
        label: "Descreva o projeto",
        type: "textarea",
        placeholder: "Detalhes sobre o processo ou análise necessária...",
        required: true,
      },
    ],
  },

  HIDRAULICA: {
    label: "Engenharia Hidráulica",
    description: "Projetos hidrossanitários, drenagem e abastecimento",
    fields: [
      {
        id: "project_type",
        label: "Tipo de serviço",
        type: "select",
        required: true,
        options: ["Projeto hidrossanitário", "Drenagem urbana", "Irrigação agrícola", "Abastecimento de água", "Aproveitamento de água da chuva", "Outro"],
      },
      {
        id: "area_m2",
        label: "Área estimada",
        type: "number",
        placeholder: "Ex: 500",
        unit: "m²",
      },
      {
        id: "location",
        label: "Cidade / Estado",
        type: "text",
        placeholder: "Ex: Recife, PE",
        required: true,
      },
      {
        id: "deadline",
        label: "Prazo desejado",
        type: "select",
        options: ["Urgente", "1 mês", "2 a 3 meses", "Sem prazo definido"],
      },
      {
        id: "description",
        label: "Descreva o projeto",
        type: "textarea",
        placeholder: "Detalhe o que você precisa...",
        required: true,
      },
    ],
  },

  TOPOGRAFIA: {
    label: "Topografia",
    description: "Levantamentos topográficos e georeferenciamento",
    fields: [
      {
        id: "project_type",
        label: "Tipo de serviço",
        type: "select",
        required: true,
        options: ["Levantamento planialtimétrico", "Locação de obra", "Georeferenciamento de imóvel", "Demarcação de limites", "Levantamento batimétrico", "Outro"],
      },
      {
        id: "area_ha",
        label: "Área do terreno",
        type: "number",
        placeholder: "Ex: 2,5",
        unit: "ha",
      },
      {
        id: "location",
        label: "Cidade / Estado",
        type: "text",
        placeholder: "Ex: Goiânia, GO",
        required: true,
      },
      {
        id: "deadline",
        label: "Prazo desejado",
        type: "select",
        options: ["Urgente (até 1 semana)", "2 semanas", "1 mês", "Sem prazo definido"],
      },
      {
        id: "description",
        label: "Detalhes adicionais",
        type: "textarea",
        placeholder: "Tipo de uso do imóvel, finalidade do levantamento...",
        required: true,
      },
    ],
  },

  AGRONOMIA: {
    label: "Agronomia",
    description: "Projetos agrícolas, análise de solo e irrigação",
    fields: [
      {
        id: "project_type",
        label: "Tipo de serviço",
        type: "select",
        required: true,
        options: ["Projeto de irrigação", "Análise e correção de solo", "Receituário agronômico", "Projeto de drenagem agrícola", "Gestão de propriedade rural", "Outro"],
      },
      {
        id: "area_ha",
        label: "Área rural",
        type: "number",
        placeholder: "Ex: 50",
        unit: "ha",
      },
      {
        id: "culture",
        label: "Cultura / produto",
        type: "text",
        placeholder: "Ex: Soja, milho, café, fruticultura...",
      },
      {
        id: "location",
        label: "Cidade / Estado",
        type: "text",
        placeholder: "Ex: Sorriso, MT",
        required: true,
      },
      {
        id: "description",
        label: "Descreva sua necessidade",
        type: "textarea",
        placeholder: "Detalhe o problema ou o projeto...",
        required: true,
      },
    ],
  },
};

// Default fallback for areas without specific config
export const defaultQuoteFields: QuoteField[] = [
  {
    id: "project_type",
    label: "Tipo de serviço",
    type: "text",
    placeholder: "Descreva brevemente o tipo de serviço",
    required: true,
  },
  {
    id: "location",
    label: "Cidade / Estado",
    type: "text",
    placeholder: "Ex: Porto Alegre, RS",
    required: true,
  },
  {
    id: "deadline",
    label: "Prazo desejado",
    type: "select",
    options: ["Urgente", "1 mês", "2 a 3 meses", "Sem prazo definido"],
  },
  {
    id: "description",
    label: "Descreva o projeto",
    type: "textarea",
    placeholder: "Quanto mais detalhes, melhor será a proposta.",
    required: true,
  },
];
