// Script Principal do Painel Administrativo
"use strict";

import { Auth } from './auth.js';
import { Storage, md5 } from '../utils/storage.js';
import { CONFIG, DEFAULT_DATA } from '../config/config.js';

// Estado da aplicação
let currentTab = 'dashboard';
let currentContentTab = 'events';

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  initAdmin();
});

async function initAdmin() {
  // Verificar se já está logado
  if (Auth.isLoggedIn()) {
    showAdminPanel();
  } else {
    showLoginScreen();
  }
  
  // Configurar eventos
  setupEventListeners();
  
  // Carregar dados iniciais
  initializeDefaultData();
}

function initializeDefaultData() {
  // Inicializar dados padrão se não existirem
  if (!Storage.load('content')) {
    Storage.save('content', {
      events: DEFAULT_DATA.events,
      avisos: DEFAULT_DATA.avisos,
      midias: DEFAULT_DATA.midias
    });
  }
  
  if (!Storage.load('usuarios')) {
    Storage.save('usuarios', CONFIG.usuarios);
  }
  
  if (!Storage.load('permissoes')) {
    Storage.save('permissoes', CONFIG.permissoes);
  }
  
  if (!Storage.load('component_types')) {
    const defaultComponents = [
      {
        id: 'banner-hero',
        nome: 'Banner Hero',
        descricao: 'Banner grande para destaque',
        categoria: 'layout',
        campos: [
          { nome: 'titulo', tipo: 'text', label: 'Título' },
          { nome: 'subtitulo', tipo: 'text', label: 'Subtítulo' },
          { nome: 'imagem', tipo: 'image', label: 'Imagem de Fundo' },
          { nome: 'cor', tipo: 'color', label: 'Cor de Fundo' }
        ],
        template: '<div class="banner-hero" style="background-image: url({imagem}); background-color: {cor};"><h2>{titulo}</h2><p>{subtitulo}</p></div>'
      },
      {
        id: 'card-evento',
        nome: 'Card de Evento',
        descricao: 'Card para exibição de eventos',
        categoria: 'layout',
        campos: [
          { nome: 'titulo', tipo: 'text', label: 'Título' },
          { nome: 'descricao', tipo: 'textarea', label: 'Descrição' },
          { nome: 'data', tipo: 'datetime', label: 'Data/Hora' },
          { nome: 'local', tipo: 'text', label: 'Local' },
          { nome: 'imagem', tipo: 'image', label: 'Imagem' }
        ],
        template: '<div class="card-evento"><img src="{imagem}" alt="{titulo}"><h3>{titulo}</h3><p>{descricao}</p><span class="data">{data}</span><span class="local">{local}</span></div>'
      },
      {
        id: 'bloco-texto',
        nome: 'Bloco de Texto',
        descricao: 'Bloco simples de texto',
        categoria: 'info',
        campos: [
          { nome: 'titulo', tipo: 'text', label: 'Título' },
          { nome: 'conteudo', tipo: 'textarea', label: 'Conteúdo' }
        ],
        template: '<div class="bloco-texto"><h3>{titulo}</h3><p>{conteudo}</p></div>'
      }
    ];
    Storage.save('component_types', defaultComponents);
  }
}

function setupEventListeners() {
  // Login Form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  // Logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => Auth.logout());
  }
  
  // Menu Toggle (mobile)
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }
  
  // Navigation
  const navItems = document.querySelectorAll('.nav-item[data-tab]');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = item.dataset.tab;
      switchTab(tab);
      
      // Fechar sidebar no mobile
      if (window.innerWidth < 768) {
        sidebar.classList.remove('open');
      }
    });
  });
  
  // Content Tabs
  const contentTabBtns = document.querySelectorAll('.content-tab-btn');
  contentTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const content = btn.dataset.content;
      switchContentTab(content);
    });
  });
  
  // Add Event Button
  const addEventBtn = document.getElementById('add-event-btn');
  if (addEventBtn) {
    addEventBtn.addEventListener('click', () => openAddEventModal());
  }
  
  // Add Aviso Button
  const addAvisoBtn = document.getElementById('add-aviso-btn');
  if (addAvisoBtn) {
    addAvisoBtn.addEventListener('click', () => openAddAvisoModal());
  }
  
  // Settings Form
  const settingsForm = document.getElementById('settings-form');
  if (settingsForm) {
    settingsForm.addEventListener('submit', handleSettingsSave);
  }
  
  // Export Data
  const exportBtn = document.getElementById('export-data-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportData);
  }
  
  // Import Data
  const importBtn = document.getElementById('import-data-btn');
  if (importBtn) {
    importBtn.addEventListener('click', importData);
  }
  
  // Clear All Data
  const clearBtn = document.getElementById('clear-all-data-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearAllData);
  }
  
  // Component Type Button
  const addComponentBtn = document.getElementById('add-component-type-btn');
  if (addComponentBtn) {
    addComponentBtn.addEventListener('click', openAddComponentTypeModal);
  }
  
  // Add User Button
  const addUserBtn = document.getElementById('add-user-btn');
  if (addUserBtn) {
    addUserBtn.addEventListener('click', openAddUserModal);
  }
}

async function handleLogin(e) {
  e.preventDefault();
  
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('login-error');
  
  try {
    const result = await Auth.login(username, password);
    
    if (result.success) {
      showAdminPanel();
      updateDashboard();
    }
  } catch (error) {
    errorDiv.textContent = error.message;
    errorDiv.style.display = 'block';
    
    // Esconder erro após 5 segundos
    setTimeout(() => {
      errorDiv.style.display = 'none';
    }, 5000);
  }
}

function showLoginScreen() {
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('admin-panel').style.display = 'none';
}

function showAdminPanel() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('admin-panel').style.display = 'flex';
  
  // Atualizar info do usuário
  const user = Auth.getCurrentUser();
  if (user) {
    document.getElementById('user-info').textContent = `${user.nome} (${user.role})`;
    
    // Mostrar/ocultar aba de usuários baseado na permissão
    const usersTab = document.querySelector('[data-tab="users"]');
    const usersSection = document.getElementById('tab-users');
    if (user.role === 'admin') {
      if (usersTab) usersTab.style.display = 'flex';
      if (usersSection) usersSection.classList.add('visible');
    } else {
      if (usersTab) usersTab.style.display = 'none';
      if (usersSection) usersSection.classList.remove('visible');
    }
  }
  
  updateDashboard();
}

function switchTab(tab) {
  // Remover active de todas as tabs
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  
  document.querySelectorAll('.admin-tab').forEach(section => {
    section.classList.remove('active');
  });
  
  // Adicionar active na tab selecionada
  const navItem = document.querySelector(`.nav-item[data-tab="${tab}"]`);
  if (navItem) {
    navItem.classList.add('active');
  }
  
  const section = document.getElementById(`tab-${tab}`);
  if (section) {
    section.classList.add('active');
  }
  
  currentTab = tab;
  
  // Atualizar conteúdo específico da tab
  if (tab === 'dashboard') {
    updateDashboard();
  } else if (tab === 'content') {
    loadContentList(currentContentTab);
  } else if (tab === 'components') {
    loadComponentTypes();
  } else if (tab === 'users') {
    loadUsersList();
  } else if (tab === 'settings') {
    loadSettings();
  }
}

function switchContentTab(content) {
  // Remover active de todos os botões
  document.querySelectorAll('.content-tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  document.querySelectorAll('.content-section').forEach(section => {
    section.classList.remove('active');
  });
  
  // Adicionar active no selecionado
  const btn = document.querySelector(`.content-tab-btn[data-content="${content}"]`);
  if (btn) {
    btn.classList.add('active');
  }
  
  const section = document.getElementById(`content-${content}`);
  if (section) {
    section.classList.add('active');
  }
  
  currentContentTab = content;
  loadContentList(content);
}

function updateDashboard() {
  const content = Storage.load('content', {});
  const componentTypes = Storage.load('component_types', []);
  const usuarios = Storage.load('usuarios', []);
  
  // Atualizar estatísticas
  document.getElementById('stat-events').textContent = (content.events || []).length;
  document.getElementById('stat-avisos').textContent = (content.avisos || []).length;
  document.getElementById('stat-users').textContent = usuarios.length;
  document.getElementById('stat-components').textContent = componentTypes.length;
  
  // Atualizar atividade recente (placeholder)
  const activityLog = document.getElementById('activity-log');
  if (activityLog) {
    activityLog.innerHTML = `
      <div class="activity-item">
        <span>Sistema iniciado</span>
        <small>${new Date().toLocaleTimeString()}</small>
      </div>
    `;
  }
}

function loadContentList(type) {
  const content = Storage.load('content', {});
  const items = content[type] || [];
  
  const listElement = document.getElementById(`${type}-list`);
  if (!listElement) return;
  
  if (items.length === 0) {
    listElement.innerHTML = '<p class="empty-state">Nenhum item encontrado</p>';
    return;
  }
  
  if (type === 'events') {
    listElement.innerHTML = items.map(event => `
      <div class="content-item">
        <div class="content-item-info">
          <h4>${escapeHtml(event.titulo)}</h4>
          <p>${formatDate(event.data)} • ${escapeHtml(event.local)}</p>
        </div>
        <div class="content-item-actions">
          <button class="btn-secondary btn-small" onclick="editEvent(${event.id})">Editar</button>
          <button class="btn-danger btn-small" onclick="deleteEvent(${event.id})">Excluir</button>
        </div>
      </div>
    `).join('');
  } else if (type === 'avisos') {
    listElement.innerHTML = items.map(aviso => `
      <div class="content-item">
        <div class="content-item-info">
          <h4>${escapeHtml(aviso.titulo)}</h4>
          <p>${formatDate(aviso.dataPublicacao)}</p>
        </div>
        <div class="content-item-actions">
          <button class="btn-secondary btn-small" onclick="editAviso(${aviso.id})">Editar</button>
          <button class="btn-danger btn-small" onclick="deleteAviso(${aviso.id})">Excluir</button>
        </div>
      </div>
    `).join('');
  } else if (type === 'midias') {
    listElement.innerHTML = '<p class="empty-state">Gerenciamento de mídias em desenvolvimento</p>';
  }
}

function loadComponentTypes() {
  const types = Storage.load('component_types', []);
  const container = document.getElementById('component-types-list');
  
  if (!container) return;
  
  if (types.length === 0) {
    container.innerHTML = '<p class="empty-state">Nenhum tipo de componente criado</p>';
    return;
  }
  
  container.innerHTML = types.map(type => `
    <div class="component-type-card">
      <h4>${escapeHtml(type.nome)}</h4>
      <p>${escapeHtml(type.descricao)}</p>
      <div class="content-item-actions">
        <button class="btn-secondary btn-small" onclick="editComponentType('${type.id}')">Editar</button>
        <button class="btn-danger btn-small" onclick="deleteComponentType('${type.id}')">Excluir</button>
      </div>
    </div>
  `).join('');
}

function loadUsersList() {
  const usuarios = Storage.load('usuarios', []);
  const container = document.getElementById('users-list');
  
  if (!container) return;
  
  container.innerHTML = usuarios.map(user => `
    <div class="user-item">
      <div>
        <strong>${escapeHtml(user.nome)}</strong><br>
        <small>@${escapeHtml(user.user)}</small>
      </div>
      <div>
        <span class="user-badge ${user.role}">${user.role}</span>
        <button class="btn-secondary btn-small" onclick="editUser(${user.id})">Editar</button>
        <button class="btn-danger btn-small" onclick="deleteUser(${user.id})">Excluir</button>
      </div>
    </div>
  `).join('');
}

function loadSettings() {
  const settings = Storage.load('settings', {});
  
  document.getElementById('setting-nome').value = settings.nome || CONFIG.igreja.nome;
  document.getElementById('setting-cor-primaria').value = settings.corPrimaria || CONFIG.tema.cores.primario;
  document.getElementById('setting-modo').value = settings.modo || CONFIG.tema.modo;
}

async function handleSettingsSave(e) {
  e.preventDefault();
  
  const settings = {
    nome: document.getElementById('setting-nome').value,
    corPrimaria: document.getElementById('setting-cor-primaria').value,
    modo: document.getElementById('setting-modo').value
  };
  
  Storage.settings.save(settings);
  
  showToast('Configurações salvas com sucesso!');
}

// Funções de Modal
window.openModal = function(title, content, footer) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = content;
  document.getElementById('modal-footer').innerHTML = footer || '';
  document.getElementById('modal-overlay').style.display = 'flex';
};

window.closeModal = function() {
  document.getElementById('modal-overlay').style.display = 'none';
};

function openAddEventModal() {
  const content = `
    <form id="event-form">
      <div class="form-group">
        <label>Título</label>
        <input type="text" name="titulo" required>
      </div>
      <div class="form-group">
        <label>Descrição</label>
        <textarea name="descricao" rows="3"></textarea>
      </div>
      <div class="form-group">
        <label>Data/Hora</label>
        <input type="datetime-local" name="data" required>
      </div>
      <div class="form-group">
        <label>Local</label>
        <input type="text" name="local" required>
      </div>
      <div class="form-group">
        <label>URL da Imagem</label>
        <input type="url" name="imagem">
      </div>
      <div class="form-group">
        <label>Categoria</label>
        <select name="categoria">
          <option value="culto">Culto</option>
          <option value="ensino">Ensino</option>
          <option value="jovens">Jovens</option>
          <option value="outro">Outro</option>
        </select>
      </div>
    </form>
  `;
  
  const footer = `
    <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
    <button class="btn-primary" onclick="saveEvent()">Salvar</button>
  `;
  
  openModal('Novo Evento', content, footer);
}

window.saveEvent = function() {
  const form = document.getElementById('event-form');
  const formData = new FormData(form);
  
  const event = {
    id: Date.now(),
    titulo: formData.get('titulo'),
    descricao: formData.get('descricao'),
    data: formData.get('data'),
    local: formData.get('local'),
    imagem: formData.get('imagem'),
    categoria: formData.get('categoria'),
    destaque: false
  };
  
  const content = Storage.load('content', {});
  content.events = content.events || [];
  content.events.push(event);
  Storage.save('content', content);
  
  closeModal();
  loadContentList('events');
  updateDashboard();
  showToast('Evento salvo com sucesso!');
};

window.editEvent = function(id) {
  const content = Storage.load('content', {});
  const event = content.events.find(e => e.id === id);
  
  if (!event) return;
  
  const formContent = `
    <form id="event-form-edit">
      <div class="form-group">
        <label>Título</label>
        <input type="text" name="titulo" value="${escapeHtml(event.titulo)}" required>
      </div>
      <div class="form-group">
        <label>Descrição</label>
        <textarea name="descricao" rows="3">${escapeHtml(event.descricao || '')}</textarea>
      </div>
      <div class="form-group">
        <label>Data/Hora</label>
        <input type="datetime-local" name="data" value="${event.data}" required>
      </div>
      <div class="form-group">
        <label>Local</label>
        <input type="text" name="local" value="${escapeHtml(event.local)}" required>
      </div>
      <div class="form-group">
        <label>URL da Imagem</label>
        <input type="url" name="imagem" value="${escapeHtml(event.imagem || '')}">
      </div>
      <div class="form-group">
        <label>Categoria</label>
        <select name="categoria">
          <option value="culto" ${event.categoria === 'culto' ? 'selected' : ''}>Culto</option>
          <option value="ensino" ${event.categoria === 'ensino' ? 'selected' : ''}>Ensino</option>
          <option value="jovens" ${event.categoria === 'jovens' ? 'selected' : ''}>Jovens</option>
          <option value="outro" ${event.categoria === 'outro' ? 'selected' : ''}>Outro</option>
        </select>
      </div>
    </form>
  `;
  
  const footer = `
    <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
    <button class="btn-primary" onclick="updateEvent(${id})">Atualizar</button>
  `;
  
  openModal('Editar Evento', formContent, footer);
};

window.updateEvent = function(id) {
  const form = document.getElementById('event-form-edit');
  const formData = new FormData(form);
  
  const content = Storage.load('content', {});
  const eventIndex = content.events.findIndex(e => e.id === id);
  
  if (eventIndex === -1) return;
  
  content.events[eventIndex] = {
    ...content.events[eventIndex],
    titulo: formData.get('titulo'),
    descricao: formData.get('descricao'),
    data: formData.get('data'),
    local: formData.get('local'),
    imagem: formData.get('imagem'),
    categoria: formData.get('categoria')
  };
  
  Storage.save('content', content);
  
  closeModal();
  loadContentList('events');
  updateDashboard();
  showToast('Evento atualizado com sucesso!');
};

window.deleteEvent = function(id) {
  if (!confirm('Tem certeza que deseja excluir este evento?')) return;
  
  const content = Storage.load('content', {});
  content.events = content.events.filter(e => e.id !== id);
  Storage.save('content', content);
  
  loadContentList('events');
  updateDashboard();
  showToast('Evento excluído!');
};

// Avisos
function openAddAvisoModal() {
  const content = `
    <form id="aviso-form">
      <div class="form-group">
        <label>Título</label>
        <input type="text" name="titulo" required>
      </div>
      <div class="form-group">
        <label>Texto</label>
        <textarea name="texto" rows="3" required></textarea>
      </div>
    </form>
  `;
  
  const footer = `
    <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
    <button class="btn-primary" onclick="saveAviso()">Salvar</button>
  `;
  
  openModal('Novo Aviso', content, footer);
}

window.saveAviso = function() {
  const form = document.getElementById('aviso-form');
  const formData = new FormData(form);
  
  const aviso = {
    id: Date.now(),
    titulo: formData.get('titulo'),
    texto: formData.get('texto'),
    dataPublicacao: new Date().toISOString().split('T')[0],
    ativo: true
  };
  
  const content = Storage.load('content', {});
  content.avisos = content.avisos || [];
  content.avisos.push(aviso);
  Storage.save('content', content);
  
  closeModal();
  loadContentList('avisos');
  updateDashboard();
  showToast('Aviso salvo com sucesso!');
};

window.editAviso = function(id) {
  const content = Storage.load('content', {});
  const aviso = content.avisos.find(a => a.id === id);
  
  if (!aviso) return;
  
  const formContent = `
    <form id="aviso-form-edit">
      <div class="form-group">
        <label>Título</label>
        <input type="text" name="titulo" value="${escapeHtml(aviso.titulo)}" required>
      </div>
      <div class="form-group">
        <label>Texto</label>
        <textarea name="texto" rows="3" required>${escapeHtml(aviso.texto)}</textarea>
      </div>
    </form>
  `;
  
  const footer = `
    <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
    <button class="btn-primary" onclick="updateAviso(${id})">Atualizar</button>
  `;
  
  openModal('Editar Aviso', formContent, footer);
};

window.updateAviso = function(id) {
  const form = document.getElementById('aviso-form-edit');
  const formData = new FormData(form);
  
  const content = Storage.load('content', {});
  const avisoIndex = content.avisos.findIndex(a => a.id === id);
  
  if (avisoIndex === -1) return;
  
  content.avisos[avisoIndex] = {
    ...content.avisos[avisoIndex],
    titulo: formData.get('titulo'),
    texto: formData.get('texto')
  };
  
  Storage.save('content', content);
  
  closeModal();
  loadContentList('avisos');
  updateDashboard();
  showToast('Aviso atualizado com sucesso!');
};

window.deleteAviso = function(id) {
  if (!confirm('Tem certeza que deseja excluir este aviso?')) return;
  
  const content = Storage.load('content', {});
  content.avisos = content.avisos.filter(a => a.id !== id);
  Storage.save('content', content);
  
  loadContentList('avisos');
  updateDashboard();
  showToast('Aviso excluído!');
};

// Component Types
function openAddComponentTypeModal() {
  const content = `
    <form id="component-type-form">
      <div class="form-group">
        <label>ID (único)</label>
        <input type="text" name="id" required pattern="[a-z0-9-]+">
      </div>
      <div class="form-group">
        <label>Nome</label>
        <input type="text" name="nome" required>
      </div>
      <div class="form-group">
        <label>Descrição</label>
        <textarea name="descricao" rows="2"></textarea>
      </div>
      <div class="form-group">
        <label>Categoria</label>
        <select name="categoria">
          <option value="layout">Layout</option>
          <option value="midia">Mídia</option>
          <option value="formulario">Formulário</option>
          <option value="info">Informação</option>
        </select>
      </div>
    </form>
  `;
  
  const footer = `
    <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
    <button class="btn-primary" onclick="saveComponentType()">Salvar</button>
  `;
  
  openModal('Novo Tipo de Componente', content, footer);
}

window.saveComponentType = function() {
  const form = document.getElementById('component-type-form');
  const formData = new FormData(form);
  
  const type = {
    id: formData.get('id'),
    nome: formData.get('nome'),
    descricao: formData.get('descricao'),
    categoria: formData.get('categoria'),
    campos: [],
    template: ''
  };
  
  const types = Storage.load('component_types', []);
  types.push(type);
  Storage.save('component_types', types);
  
  closeModal();
  loadComponentTypes();
  updateDashboard();
  showToast('Tipo de componente criado!');
};

window.deleteComponentType = function(id) {
  if (!confirm('Tem certeza que deseja excluir este tipo de componente?')) return;
  
  const types = Storage.load('component_types', []);
  const filtered = types.filter(t => t.id !== id);
  Storage.save('component_types', filtered);
  
  loadComponentTypes();
  updateDashboard();
  showToast('Tipo de componente excluído!');
};

// Users
function openAddUserModal() {
  const content = `
    <form id="user-form">
      <div class="form-group">
        <label>Nome</label>
        <input type="text" name="nome" required>
      </div>
      <div class="form-group">
        <label>Usuário</label>
        <input type="text" name="user" required>
      </div>
      <div class="form-group">
        <label>Senha</label>
        <input type="password" name="password" required>
      </div>
      <div class="form-group">
        <label>Papel</label>
        <select name="role">
          <option value="editor">Editor</option>
          <option value="admin">Administrador</option>
        </select>
      </div>
    </form>
  `;
  
  const footer = `
    <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
    <button class="btn-primary" onclick="saveUser()">Salvar</button>
  `;
  
  openModal('Novo Usuário', content, footer);
}

window.saveUser = function() {
  const form = document.getElementById('user-form');
  const formData = new FormData(form);
  
  const user = {
    id: Date.now(),
    nome: formData.get('nome'),
    user: formData.get('user'),
    pass: md5(formData.get('password')),
    role: formData.get('role'),
    ativo: true
  };
  
  const usuarios = Storage.load('usuarios', []);
  usuarios.push(user);
  Storage.save('usuarios', usuarios);
  
  closeModal();
  loadUsersList();
  updateDashboard();
  showToast('Usuário criado com sucesso!');
};

window.editUser = function(id) {
  const usuarios = Storage.load('usuarios', []);
  const user = usuarios.find(u => u.id === id);
  
  if (!user) return;
  
  const formContent = `
    <form id="user-form-edit">
      <div class="form-group">
        <label>Nome</label>
        <input type="text" name="nome" value="${escapeHtml(user.nome)}" required>
      </div>
      <div class="form-group">
        <label>Usuário</label>
        <input type="text" name="user" value="${escapeHtml(user.user)}" required>
      </div>
      <div class="form-group">
        <label>Nova Senha (deixe em branco para manter)</label>
        <input type="password" name="password">
      </div>
      <div class="form-group">
        <label>Papel</label>
        <select name="role">
          <option value="editor" ${user.role === 'editor' ? 'selected' : ''}>Editor</option>
          <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Administrador</option>
        </select>
      </div>
    </form>
  `;
  
  const footer = `
    <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
    <button class="btn-primary" onclick="updateUser(${id})">Atualizar</button>
  `;
  
  openModal('Editar Usuário', formContent, footer);
};

window.updateUser = function(id) {
  const form = document.getElementById('user-form-edit');
  const formData = new FormData(form);
  
  const usuarios = Storage.load('usuarios', []);
  const userIndex = usuarios.findIndex(u => u.id === id);
  
  if (userIndex === -1) return;
  
  const password = formData.get('password');
  usuarios[userIndex] = {
    ...usuarios[userIndex],
    nome: formData.get('nome'),
    user: formData.get('user'),
    role: formData.get('role')
  };
  
  if (password) {
    usuarios[userIndex].pass = md5(password);
  }
  
  Storage.save('usuarios', usuarios);
  
  closeModal();
  loadUsersList();
  updateDashboard();
  showToast('Usuário atualizado!');
};

window.deleteUser = function(id) {
  if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
  
  const usuarios = Storage.load('usuarios', []);
  const filtered = usuarios.filter(u => u.id !== id);
  Storage.save('usuarios', filtered);
  
  loadUsersList();
  updateDashboard();
  showToast('Usuário excluído!');
};

// Export/Import
function exportData() {
  const data = Storage.exportAll();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup-igreja-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
  showToast('Backup exportado com sucesso!');
}

function importData() {
  const fileInput = document.getElementById('import-file');
  const file = fileInput.files[0];
  
  if (!file) {
    showToast('Selecione um arquivo JSON', 'error');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      Storage.importAll(data);
      showToast('Dados importados com sucesso!');
      updateDashboard();
    } catch (error) {
      showToast('Erro ao importar dados', 'error');
    }
  };
  reader.readAsText(file);
}

function clearAllData() {
  if (!confirm('ATENÇÃO: Isso apagará TODOS os dados. Tem certeza?')) return;
  if (!confirm('Esta ação não pode ser desfeita. Continuar?')) return;
  
  Storage.clear();
  showToast('Todos os dados foram limpos');
  location.reload();
}

// Utilitários
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function showToast(message, type = 'success') {
  // Implementação simples de toast
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 16px 24px;
    background: ${type === 'success' ? '#10b981' : '#ef4444'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 9999;
    animation: slideIn 0.3s ease;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Adicionar animações CSS para toast
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);
