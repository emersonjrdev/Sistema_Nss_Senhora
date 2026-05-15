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
    status: "ativo",
  },
  {
    id: "presenca",
    label: "Controle de presença",
    shortLabel: "Presença",
    description: "Registro de presença em celebrações.",
    status: "ativo",
  },
  {
    id: "eventos",
    label: "Eventos e missas",
    shortLabel: "Eventos",
    description: "Calendário litúrgico e eventos paroquiais.",
    status: "ativo",
  },
  {
    id: "relatorios",
    label: "Relatórios",
    shortLabel: "Relatórios",
    description: "Resumo numérico e exportação dos cadastros.",
    status: "ativo",
  },
  {
    id: "aniversariantes",
    label: "Aniversariantes",
    shortLabel: "Aniversários",
    description: "Próximos aniversários a partir da data de nascimento.",
    status: "ativo",
  },
  {
    id: "comunidades",
    label: "Comunidades",
    shortLabel: "Comunidades",
    description: "Servidores agrupados por comunidade informada.",
    status: "ativo",
  },
  {
    id: "importacao-coroinhas",
    label: "Importar coroinhas",
    shortLabel: "Importar",
    description: "Cruzar Excel de inscrições com Word de formação e cadastrar.",
    status: "ativo",
  },
  {
    id: "historico",
    label: "Histórico do servidor",
    shortLabel: "Histórico",
    description: "Linha do tempo de participação e observações pastorais.",
    status: "ativo",
  },
];

export function getModuleById(id) {
  return MODULES.find((m) => m.id === id) || MODULES[0];
}
