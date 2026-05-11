/**
 * Registro de módulos da plataforma paroquial.
 * `status`: "ativo" = tela implementada; "parcial" = usa dados atuais; "em_breve" = roadmap.
 */
export const MODULES = [
  {
    id: "servidores",
    label: "Servidores do altar",
    shortLabel: "Servidores",
    description: "Cadastro, filtros e gestão da lista.",
    status: "ativo",
  },
  {
    id: "escalas",
    label: "Escalas de serviço",
    shortLabel: "Escalas",
    description: "Montagem de escalas por missa e função.",
    status: "em_breve",
  },
  {
    id: "presenca",
    label: "Controle de presença",
    shortLabel: "Presença",
    description: "Registro de presença em celebrações.",
    status: "em_breve",
  },
  {
    id: "eventos",
    label: "Eventos e missas",
    shortLabel: "Eventos",
    description: "Calendário litúrgico e eventos paroquiais.",
    status: "em_breve",
  },
  {
    id: "relatorios",
    label: "Relatórios",
    shortLabel: "Relatórios",
    description: "Resumo numérico e exportação dos cadastros.",
    status: "parcial",
  },
  {
    id: "aniversariantes",
    label: "Aniversariantes",
    shortLabel: "Aniversários",
    description: "Próximos aniversários a partir da data de nascimento.",
    status: "parcial",
  },
  {
    id: "comunidades",
    label: "Comunidades",
    shortLabel: "Comunidades",
    description: "Servidores agrupados por comunidade informada.",
    status: "parcial",
  },
  {
    id: "historico",
    label: "Histórico do servidor",
    shortLabel: "Histórico",
    description: "Linha do tempo de participação e observações pastorais.",
    status: "em_breve",
  },
];

export function getModuleById(id) {
  return MODULES.find((m) => m.id === id) || MODULES[0];
}
