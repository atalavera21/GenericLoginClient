export interface RegisterUserRequest {
    nombres?: string;
    apellidos?: string;
    email: string;
    contrasena: string;
    confirmarContrasena?: string;
    direccion?: string;
    ciudad?: string;
    codigoPostal?: string;
    fechaNacimiento?: string;
    estado?: string;
    pais?: string;
    url?: string;
    telefono?: string;
  }
  
  export interface AuthResponse {
    success: boolean;
    token?: string;
    Errors?: string[];
  }