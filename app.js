// App.js Principal - Igreja Vida Nova
"use strict";

import { Storage } from './utils/storage.js';
import { CONFIG, DEFAULT_DATA } from './config/config.js';

// Estado da aplicação
const AppState = {
  isLoggedIn: false,
  user: null,
  isEditorMode: false
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

async function initApp() {
  // Carregar configurações salvas
  loadSettings();
  
  // Verificar sessão do usuário
  checkSession();
  
  // Carregar conteúdo dinâmico
  loadDynamicContent();
  
  // Configurar player de rádio
  setupRadioPlayer();
  
  // Configurar atalhos de admin
  setupAdminShortcuts();
  
  // Atualizar navegação ativa
  updateActiveNav();
}

function loadSettings() {
  const settings = Storage.settings.get();
  
  if (settings.corPrimaria) {
    document.documentElement.style.setProperty('--primary', settings.corPrimaria);
  }
  
  if (settings.modo === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
  
  if (settings.nome) {
    document.title = settings.nome;
    const headerTitle = document.querySelector('.header h1');
    if (headerTitle) {
      headerTitle.textContent = settings.nome;
    }
  }
}

function checkSession() {
  const session = Storage.session.get();
  if (session) {
    AppState.isLoggedIn = true;
    AppState.user = session;
    
    // Mostrar indicador de editor se logado
    if (AppState.isLoggedIn) {
      enableEditorMode();
    }
  }
}

function enableEditorMode() {
  AppState.isEditorMode = true;
  
  // Adicionar botão flutuante de editar
  addEditorButton();
  
  // Tornar elementos editáveis
  makeElementsEditable();
}

function addEditorButton() {
  // Remover se já existir
  const existingBtn = document.getElementById('editor-toggle-btn');
  if (existingBtn) existingBtn.remove();
  
  const btn = document.createElement('button');
  btn.id = 'editor-toggle-btn';
  btn.innerHTML = '✏️';
  btn.style.cssText = `
    position: fixed;
    bottom: calc(var(--nav-height) + 80px);
    right: 20px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--primary);
    color: white;
    border: none;
    font-size: 24px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 998;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  
  btn.addEventListener('click', toggleEditorPanel);
  document.body.appendChild(btn);
}

function toggleEditorPanel() {
  const existingPanel = document.getElementById('editor-panel');
  
  if (existingPanel) {
    existingPanel.remove();
    return;
  }
  
  const panel = document.createElement('div');
  panel.id = 'editor-panel';
  panel.className = 'editor-panel';
  panel.innerHTML = `
    <div class="editor-panel-header">
      <h3>Modo Editor</h3>
      <button class="editor-panel-close" onclick="document.getElementById('editor-panel').remove()">×</button>
    </div>
    <p>Clique em qualquer elemento para editar seu conteúdo.</p>
    <div class="form-group mt-2">
      <button class="btn btn-primary btn-block" onclick="saveAllChanges()">💾 Salvar Alterações</button>
    </div>
    <div class="form-group mt-1">
      <button class="btn btn-secondary btn-block" onclick="logoutFromEditor()">🚪 Sair</button>
    </div>
  `;
  
  document.body.appendChild(panel);
  
  setTimeout(() => panel.classList.add('open'), 10);
}

function makeElementsEditable() {
  const editableElements = document.querySelectorAll('[data-cms-target]');
  
  editableElements.forEach(el => {
    el.setAttribute('data-editable', 'true');
    el.addEventListener('click', (e) => {
      if (!AppState.isEditorMode) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      openElementEditor(el);
    });
  });
}

function openElementEditor(element) {
  const target = element.getAttribute('data-cms-target');
  const content = element.innerHTML;
  
  const panel = document.getElementById('editor-panel');
  if (!panel) return;
  
  const editorBody = document.createElement('div');
  editorBody.innerHTML = `
    <h4>Editando: ${target}</h4>
    <div class="form-group">
      <label>Conteúdo HTML</label>
      <textarea id="editor-content" rows="6">${escapeHtml(content)}</textarea>
    </div>
    <button class="btn btn-primary btn-block" onclick="updateElementContent()">Atualizar</button>
  `;
  
  panel.appendChild(editorBody);
  
  // Armazenar referência ao elemento sendo editado
  panel.dataset.editingElement = target;
}

window.updateElementContent = function() {
  const textarea = document.getElementById('editor-content');
  if (!textarea) return;
  
  const newContent = textarea.value;
  const target = document.getElementById('editor-panel').dataset.editingElement;
  
  const element = document.querySelector(`[data-cms-target="${target}"]`);
  if (element) {
    element.innerHTML = newContent;
    
    // Salvar no localStorage
    saveContentChange(target, newContent);
    
    showToast('Conteúdo atualizado!');
  }
  
  // Fechar painel
  document.getElementById('editor-panel').remove();
};

window.saveAllChanges = function() {
  showToast('Todas as alterações foram salvas!');
};

window.logoutFromEditor = function() {
  Storage.session.clear();
  location.reload();
};

function saveContentChange(target, content) {
  const changes = Storage.load('content_changes', {});
  changes[target] = {
    content,
    updatedAt: new Date().toISOString()
  };
  Storage.save('content_changes', changes);
}

function loadDynamicContent() {
  // Carregar avisos
  loadAvisos();
  
  // Carregar eventos em destaque
  loadEventosDestaque();
  
  // Carregar versículo do dia
  loadVersiculoDia();
}

function loadAvisos() {
  const content = Storage.load('content', {});
  const avisos = content.avisos || DEFAULT_DATA.avisos;
  
  const container = document.getElementById('avisos-container');
  if (!container) return;
  
  if (avisos.length === 0) {
    container.innerHTML = '<p class="text-muted">Nenhum aviso no momento</p>';
    return;
  }
  
  container.innerHTML = avisos.map(aviso => `
    <div class="notice-item">
      <p class="notice-title">${escapeHtml(aviso.titulo)}</p>
      <p class="text-muted">${escapeHtml(aviso.texto)}</p>
      <span class="notice-date">${formatDate(aviso.dataPublicacao)}</span>
    </div>
  `).join('');
}

function loadEventosDestaque() {
  const content = Storage.load('content', {});
  let events = content.events || DEFAULT_DATA.events;
  
  // Filtrar eventos futuros e destaques
  const now = new Date();
  const upcomingEvents = events
    .filter(e => new Date(e.data) >= now)
    .sort((a, b) => new Date(a.data) - new Date(b.data))
    .slice(0, 3);
  
  const container = document.getElementById('eventos-destaque');
  if (!container) return;
  
  if (upcomingEvents.length === 0) {
    container.innerHTML = '<p class="text-muted">Nenhum evento próximo</p>';
    return;
  }
  
  container.innerHTML = upcomingEvents.map(event => `
    <div class="event-card">
      <img src="${event.imagem || 'assets/images/default-event.jpg'}" alt="${escapeHtml(event.titulo)}" class="event-image" loading="lazy">
      <div class="event-content">
        <h4 class="event-title">${escapeHtml(event.titulo)}</h4>
        <p class="event-description">${escapeHtml(event.descricao || '')}</p>
        <div class="event-meta">
          <span>📅 ${formatDate(event.data)}</span>
          <span>📍 ${escapeHtml(event.local)}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function loadVersiculoDia() {
  const content = Storage.load('content', {});
  const versiculo = content.versiculoDia || DEFAULT_DATA.versiculoDia;
  
  const card = document.querySelector('.verse-card');
  if (!card) return;
  
  card.querySelector('.verse-text').textContent = `"${versiculo.texto}"`;
  card.querySelector('.verse-ref').textContent = versiculo.referencia;
}

function setupRadioPlayer() {
  const playBtn = document.getElementById('play-pause-btn');
  if (!playBtn) return;
  
  let isPlaying = false;
  
  playBtn.addEventListener('click', () => {
    isPlaying = !isPlaying;
    playBtn.textContent = isPlaying ? '⏸' : '▶';
    
    if (isPlaying) {
      showToast('Rádio iniciada');
      // Aqui iria a lógica real do player de áudio
    } else {
      showToast('Rádio pausada');
    }
  });
}

function setupAdminShortcuts() {
  // Ctrl + Shift + L para acessar admin
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && (e.key === 'L' || e.key === 'l')) {
      e.preventDefault();
      window.location.href = 'admin/admin.html';
    }
  });
  
  // 5 cliques no logo para acessar admin
  let clickCount = 0;
  let clickTimer = null;
  
  const logo = document.querySelector('.logo');
  if (logo) {
    logo.addEventListener('click', () => {
      clickCount++;
      
      if (clickTimer) clearTimeout(clickTimer);
      
      clickTimer = setTimeout(() => {
        clickCount = 0;
      }, 2000);
      
      if (clickCount >= 5) {
        window.location.href = 'admin/admin.html';
        clickCount = 0;
      }
    });
  }
}

function updateActiveNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    const href = item.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'pages/home.html')) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
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
  return date.toLocaleDateString('pt-BR');
}

function showToast(message, type = 'success') {
  const existingToast = document.querySelector('.toast');
  if (existingToast) existingToast.remove();
  
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.background = type === 'success' ? 'var(--success)' : 'var(--danger)';
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Exportar funções globais necessárias
window.AppState = AppState;
window.escapeHtml = escapeHtml;
window.showToast = showToast;
