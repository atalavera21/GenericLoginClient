export interface LoginRequest {
    email: string;
    password: string;
    rememberMe: boolean;
}

export interface RolData {
    data: any;
    errors: string[];
    mensaje: string;
    success: boolean;
    roles: string[];
}

export interface LoginResponse {
    success: boolean;
    mensaje: string;
    token: string;
    expiracion: string;
    userId: string;
    email: string;
    nombres: string;
    apellidos: string;
    errors: string[];
    rol: RolData;
}