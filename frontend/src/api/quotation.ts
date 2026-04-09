import axios from "axios";
import type { QuotationForm } from "../types/quotation";

const API_URL = "http://localhost:8000/quotations";

export async function createQuotation(data: QuotationForm) {
  try {
    console.log("Enviando datos al backend:", JSON.stringify(data, null, 2));
    
    const response = await axios.post("http://localhost:8000/quotations/", data);
    
    console.log("Respuesta del backend:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error completo:", error);
    console.error("Response error:", error.response?.data);
    console.error("Status:", error.response?.status);
    throw error;
  }
}
export async function getQuotations(skip: number = 0, limit: number = 100) {
  try {
    const response = await axios.get(`${API_URL}/`, {
      params: { skip, limit }
    });
    return response.data;
  } catch (error: any) {
    console.error("Error obteniendo cotizaciones:", error);
    throw error;
  }
}

// api/quotation.ts
export const getQuotationById = async (id: string): Promise<ApiResponse<QuotationItem>> => {
  try {
    console.log('Buscando cotización con ID:', id);
    
    // Si usas una API local
    const response = await fetch(`http://localhost:8000/quotations/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Respuesta de la API:', data);
    
    return data;
  } catch (error) {
    console.error('Error en getQuotationById:', error);
    throw error;
  }
}

// Tipo para la respuesta de cotizaciones
export interface QuotationItem {
  id: string;
  codigo_tracking: string;
  referencia: string;
  tipo_operacion: string;
  pol?: string;
  pod?: string;
  incoterm_origen?: string;
  incoterm_destino?: string;
  mercaderia?: string;
  bultos?: number;
  peso_bruto_kg?: number;
  volumen_cbm?: number;
  tipo_carga?: string;
  tipo_contenedor?: string;
  estado: 'creada' | 'enviada' | 'aceptada' | 'rechazada'; // Estado principal
  fecha_envio?: string; // Fecha cuando se envió
  fecha_respuesta?: string; // Fecha cuando se respondió
  fecha_vencimiento: string; // Fecha de vencimiento
  validez_dias: number; // Días de validez (ya existe)
  created_at: string;
  updated_at: string;
}

export interface QuotationsResponse {
  success: boolean;
  data: QuotationItem[];
  total: number;
  skip: number;
  limit: number;
}

export async function updateQuotation(id: string, data: any) {
  try {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error("Error actualizando cotización:", error);
    throw error;
  }
}

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
