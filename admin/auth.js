// Sistema de Autenticação
"use strict";

import { Storage, md5 } from '../utils/storage.js';
import { CONFIG } from '../config/config.js';

export const Auth = {
  // Tentativas de login falhas
  failedAttempts: 0,
  lockoutUntil: null,
  
  // Debug: mostrar hashes para teste
  debugHashes() {
    console.log('=== DEBUG DE HASHES ===');
    console.log('Senha "password":', md5('password'));
    console.log('Senha "editor123":', md5('editor123'));
    console.log('Usuários no config:', CONFIG.usuarios.map(u => ({ user: u.user, pass: u.pass })));
    const storedUsers = Storage.load('usuarios');
    console.log('Usuários no storage:', storedUsers);
  },
  
  // Limpar dados de sessão e tentar novamente
  resetAuth() {
    Storage.session.clear();
    Storage.remove('usuarios');
    this.failedAttempts = 0;
    this.lockoutUntil = null;
    console.log('Autenticação resetada. Tente fazer login novamente.');
  },
  
  // Verificar se pode tentar login
  canAttemptLogin() {
    if (this.lockoutUntil && Date.now() < this.lockoutUntil) {
      return false;
    }
    if (this.lockoutUntil && Date.now() >= this.lockoutUntil) {
      this.failedAttempts = 0;
      this.lockoutUntil = null;
    }
    return true;
  },
  
  // Realizar login
  async login(username, password) {
    return new Promise((resolve, reject) => {
      // Verificar bloqueio por tentativas
      if (!this.canAttemptLogin()) {
        const remainingTime = Math.ceil((this.lockoutUntil - Date.now()) / 1000);
        reject(new Error(`Muitas tentativas. Tente novamente em ${remainingTime} segundos.`));
        return;
      }
      
      // Carregar usuários do storage ou usar padrão
      let usuarios = Storage.load('usuarios');
      if (!usuarios || usuarios.length === 0) {
        usuarios = JSON.parse(JSON.stringify(CONFIG.usuarios)); // Deep copy
        Storage.save('usuarios', usuarios);
        console.log('Usuários inicializados do config:', usuarios.map(u => u.user));
      }
      
      // Hash da senha fornecida
      const passwordHash = md5(password);
      console.log('🔐 Tentativa de login:', { username, password, passwordHash });
      console.log('👥 Usuários disponíveis:', usuarios.map(u => ({ user: u.user, pass: u.pass, ativo: u.ativo })));
      
      // Debug: mostrar hashes esperados
      console.log('🔍 Hash esperado para "password":', md5('password'));
      console.log('🔍 Hash esperado para "editor123":', md5('editor123'));

      // Buscar usuário
      const user = usuarios.find(u => {
        const userMatch = u.user === username;
        const passMatch = u.pass === passwordHash;
        const ativoMatch = u.ativo !== false;
        const match = userMatch && passMatch && ativoMatch;
        
        console.log(`🔎 Verificando usuário ${u.user}:`, { 
          userMatch, 
          passMatch, 
          ativoMatch,
          match,
          hashFornecido: passwordHash,
          hashArmazenado: u.pass
        });
        
        return match;
      });
      
      if (!user) {
        this.failedAttempts++;
        console.log('Login falhou. Tentativas:', this.failedAttempts);
        
        // Bloquear após 3 tentativas
        if (this.failedAttempts >= CONFIG.acesso.tentativasMaximas) {
          this.lockoutUntil = Date.now() + (5 * 60 * 1000); // 5 minutos
          reject(new Error('Muitas tentativas falhas. Aguarde 5 minutos.'));
        } else {
          reject(new Error('Usuário ou senha inválidos.'));
        }
        return;
      }
      
      // Resetar tentativas
      this.failedAttempts = 0;
      this.lockoutUntil = null;
      
      // Criar sessão
      Storage.session.set(user);
      
      // Salvar permissões se não existirem
      if (!Storage.load('permissoes')) {
        Storage.save('permissoes', CONFIG.permissoes);
      }
      
      console.log('Login sucesso:', user);
      resolve({
        success: true,
        user: {
          id: user.id,
          nome: user.nome,
          user: user.user,
          role: user.role
        }
      });
    });
  },
  
  // Realizar logout
  logout() {
    Storage.session.clear();
    window.location.href = window.location.pathname;
  },
  
  // Verificar se está logado
  isLoggedIn() {
    return Storage.session.isLoggedIn();
  },
  
  // Obter usuário atual
  getCurrentUser() {
    return Storage.session.get();
  },
  
  // Verificar permissão
  hasPermission(permission) {
    return Storage.session.hasPermission(permission);
  },
  
  // Obter papel do usuário
  getRole() {
    const session = Storage.session.get();
    return session ? session.role : null;
  },
  
  // Validar sessão expirada
  validateSession() {
    const session = Storage.session.get();
    if (!session) {
      return false;
    }
    
    // Verificar expiração
    if (Date.now() > session.expiresAt) {
      this.logout();
      return false;
    }
    
    return true;
  },
  
  // Estender sessão
  extendSession() {
    const session = Storage.session.get();
    if (session) {
      session.expiresAt = Date.now() + (CONFIG.acesso.timeoutSessao * 60 * 1000);
      Storage.save('session', session);
    }
  }
};

export default Auth;
