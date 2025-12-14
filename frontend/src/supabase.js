// Versão mock do Supabase para desenvolvimento
export const supabase = {
  auth: {
    onAuthStateChange: (callback) => {
      // Simula um usuário logado
      const user = {
        id: 'dev-user-123',
        email: 'dev@example.com',
        user_metadata: { name: 'Usuário de Desenvolvimento' }
      };
      // Dispara o callback com o usuário mock
      callback('SIGNED_IN', { user });
      // Retorna um objeto com um método para cancelar a inscrição
      return { 
        data: { 
          subscription: { 
            unsubscribe: () => {} 
          } 
        } 
      };
    },
    currentUser: () => ({
      id: 'dev-user-123',
      email: 'dev@example.com',
      user_metadata: { name: 'Usuário de Desenvolvimento' }
    }),
    signOut: () => Promise.resolve()
  }
};