export const AUTH = {
  ROLES: {
    ADMIN: 'Admin',
    MODERATOR: 'Moderador',
    USER: 'Usuario'
  },
  ROLE_LABELS: {
    admin: 'Administrador',
    mod: 'Moderador',
    user: 'Usuario'
  },
  PERMISSIONS: {
    CREATE_USER: 'create_user',
    EDIT_USER: 'edit_user',
    DELETE_USER: 'delete_user'
  }
} as const;

// Constantes de otros módulos (ejemplo)
export const PRODUCTS = {
  STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    PENDING: 'pending'
  },
  CATEGORIES: {
    ELECTRONICS: 'electronics',
    CLOTHING: 'clothing',
    BOOKS: 'books'
  }
} as const;