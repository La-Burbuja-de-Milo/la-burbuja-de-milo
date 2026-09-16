export const ROLES = {
  GERENTE: 'gerente',
  ASESOR: 'asesor',
  USUARIO: 'usuario'
};

export const ROLE_LABELS = {
  gerente: 'Gerente',
  asesor: 'Asesor',
  usuario: 'Usuario'
};

export const ROLE_HINTS = {
  gerente: 'Administrador: tienda, CMS, equipo y CRM',
  asesor: 'Vendedor: agenda de citas y clientes',
  usuario: 'Cliente: Mi Burbuja, tienda y reservas'
};

export function isGerente(rol) {
  return rol === ROLES.GERENTE || rol === 'admin';
}

export function isAsesor(rol) {
  return rol === ROLES.ASESOR;
}

export function isStaff(rol) {
  return isGerente(rol) || isAsesor(rol);
}

export function homeForRole(rol) {
  return isStaff(rol) ? '/admin' : '/mi-burbuja';
}
