// utils/quotationUtils.ts (o en tu archivo quotation.ts)
export interface ValidezInfo {
  estado: 'valida' | 'por_vencer' | 'vencida';
  dias_restantes: number;
  color: string;
}

export function calcularValidez(
  fechaCreacion: string,
  validezDias: number,
  fechaVencimiento?: string
): ValidezInfo {
  const fechaVenc = fechaVencimiento 
    ? new Date(fechaVencimiento)
    : new Date(new Date(fechaCreacion).getTime() + validezDias * 24 * 60 * 60 * 1000);
  
  const hoy = new Date();
  const diffTiempo = fechaVenc.getTime() - hoy.getTime();
  const diasRestantes = Math.ceil(diffTiempo / (1000 * 60 * 60 * 24));
  
  let estado: 'valida' | 'por_vencer' | 'vencida' = 'valida';
  let color = '#06d6a0'; // Verde por defecto
  
  if (diasRestantes <= 0) {
    estado = 'vencida';
    color = '#94a3b8'; // Gris
  } else if (diasRestantes <= 3) {
    estado = 'por_vencer';
    color = '#d29922'; // Amarillo/Naranja
  }
  
  return {
    estado,
    dias_restantes: diasRestantes,
    color
  };
}

// Función para obtener el color según el estado principal
export function getEstadoColor(estado: string): string {
  const colores = {
    'creada': '#ff6b35',     // Naranja
    'enviada': '#3a86ff',    // Azul
    'aceptada': '#06d6a0',   // Verde
    'rechazada': '#94a3b8',  // Gris
  };
  
  return colores[estado.toLowerCase() as keyof typeof colores] || '#6b7280';
}

// Función para obtener el texto del estado
export function getEstadoTexto(estado: string): string {
  const textos = {
    'creada': 'Creada',
    'enviada': 'Enviada',
    'aceptada': 'Aceptada',
    'rechazada': 'Rechazada',
  };
  
  return textos[estado.toLowerCase() as keyof typeof textos] || estado;
}