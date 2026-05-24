// Configuração Central da Igreja App
export const CONFIG = {
  igreja: { 
    nome: "Igreja Vida Nova", 
    logo: "/assets/icons/logo.svg",
    descricao: "Uma igreja acolhedora para toda a família"
  },
  tema: { 
    modo: "light", 
    cores: { 
      primario: "#2563eb", 
      secundario: "#f59e0b",
      fundo: "#f8fafc",
      texto: "#1e293b"
    }, 
    fonte: "system-ui, -apple-system, sans-serif" 
  },
  pwa: { 
    nomeCurto: "IgrejaApp", 
    nomeLongo: "Igreja Vida Nova",
    temaBarra: "#2563eb",
    corFundo: "#ffffff",
    display: "standalone",
    orientacao: "portrait"
  },
  acesso: { 
    metodo: "logoClick", 
    urlOculta: "/admin/admin.html?access=true",
    tentativasMaximas: 3,
    timeoutSessao: 30 // minutos
  },
  sessoes: [
    { id: "home", nome: "Início", slug: "pages/home.html", ativo: true, ordem: 1, icone: "🏠", cor: "#10b981" },
    { id: "agenda", nome: "Agenda", slug: "pages/agenda.html", ativo: true, ordem: 2, icone: "📅", cor: "#3b82f6" },
    { id: "eventos", nome: "Eventos", slug: "pages/eventos.html", ativo: true, ordem: 3, icone: "🎉", cor: "#8b5cf6" },
    { id: "biblia", nome: "Bíblia", slug: "pages/biblia.html", ativo: true, ordem: 4, icone: "📖", cor: "#f59e0b" },
    { id: "radio", nome: "Rádio", slug: "pages/radio.html", ativo: true, ordem: 5, icone: "📻", cor: "#ef4444" },
    { id: "doacoes", nome: "Doações", slug: "pages/doacoes.html", ativo: true, ordem: 6, icone: "💝", cor: "#ec4899" },
    { id: "contato", nome: "Contato", slug: "pages/contato.html", ativo: true, ordem: 7, icone: "📞", cor: "#6b7280" }
  ],
  permissoes: { 
    editor: ["edit", "add", "delete_content", "publish_events"], 
    admin: ["*"] 
  },
  usuarios: [
    { 
      id: 1, 
      nome: "Administrador", 
      user: "admin", 
      pass: "5e884898da28047d91651409992588ce", // senha: password (hash MD5 simples para demo)
      role: "admin",
      ativo: true 
    },
    { 
      id: 2, 
      nome: "Editor", 
      user: "editor", 
      pass: "1c63129ae9db9cfa73665463094f8140", // senha: editor123
      role: "editor",
      ativo: true 
    }
  ],
  notificacoes: {
    enabled: true,
    icon: "/assets/icons/notification.png"
  },
  exportacao: {
    incluirDados: true,
    formato: "json"
  }
};

// Dados padrão para inicialização
export const DEFAULT_DATA = {
  events: [
    {
      id: 1,
      titulo: "Culto de Domingo",
      descricao: "Celebração semanal com louvor e palavra",
      data: "2025-06-01T10:00:00",
      local: "Templo Principal",
      imagem: "/assets/images/culto-domingo.jpg",
      categoria: "culto",
      destaque: true
    },
    {
      id: 2,
      titulo: "Escola Bíblica",
      descricao: "Estudo bíblico para todas as idades",
      data: "2025-06-01T09:00:00",
      local: "Salão de Aulas",
      imagem: "/assets/images/escola-biblica.jpg",
      categoria: "ensino",
      destaque: false
    },
    {
      id: 3,
      titulo: "Grupo de Jovens",
      descricao: "Encontro semanal da juventude",
      data: "2025-06-04T19:30:00",
      local: "Auditório Jovem",
      imagem: "/assets/images/jovens.jpg",
      categoria: "jovens",
      destaque: true
    }
  ],
  avisos: [
    {
      id: 1,
      titulo: "Retiro Espiritual",
      texto: "Inscrições abertas para o retiro de casais",
      dataPublicacao: "2025-05-20",
      ativo: true
    },
    {
      id: 2,
      titulo: "Campanha de Doação",
      texto: "Estamos arrecadando alimentos para famílias carentes",
      dataPublicacao: "2025-05-18",
      ativo: true
    }
  ],
  versiculoDia: {
    referencia: "João 3:16",
    texto: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.",
    data: "2025-05-24"
  },
  midias: {
    radios: [
      {
        id: 1,
        nome: "Rádio Vida Nova",
        url: "https://stream.zeno.fm/your-stream-url",
        ativo: true
      }
    ],
    videos: [],
    imagens: []
  },
  oracoes: [],
  componentes: []
};

export default CONFIG;
