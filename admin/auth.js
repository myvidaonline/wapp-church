// Sistema de Autenticação
"use strict";

import { Storage, md5 } from '../utils/storage.js';
import { CONFIG } from '../config/config.js';

export const Auth = {
  // Tentativas de login falhas
  failedAttempts: 0,
  lockoutUntil: null,
  
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
        usuarios = CONFIG.usuarios;
        Storage.save('usuarios', usuarios);
      }
      
      // Hash da senha fornecida
      const passwordHash = md5(password);
      
      // Buscar usuário
      const user = usuarios.find(u => 
        u.user === username && 
        u.pass === passwordHash && 
        u.ativo !== false
      );
      
      if (!user) {
        this.failedAttempts++;
        
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
