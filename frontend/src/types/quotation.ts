export type TipoOperacion =
  | "EM"
  | "IM"
  | "EA"
  | "IA"
  | "ET"
  | "IT"
  | "CO";

export type QuotationForm = {
  referencia: string;
  tipo_operacion: TipoOperacion | "";

  // Sección 2: Ruta y Transporte
  pol?: string;
  transbordo_1?: string;
  transbordo_2?: string;
  transbordo_3?: string;
  pod?: string;
  linea_maritima?: string;
  aerolinea?: string;
  transit_time?: number;
  dias_libres_destino?: number;
  incoterm_origen: string;
  incoterm_destino: string;
  lugar_pickup: string;
  lugar_delivery: string;
  dias_libres_origen: number;

  // Sección 3: Detalles de Mercadería
  mercaderia?: string;
  bultos?: number;
  peso_bruto_kg?: number;
  toneladas?: number;
  volumen_cbm?: number;
  chargeable_weight?: number;
  largo?: number;
  ancho?: number;
  alto?: number;
  valor_comercial?: number;

   // Sección 4: Equipo y Especificaciones
  tipo_carga?: "FCL" | "LCL";
  tipo_contenedor?: string;
  cantidad_contenedores?: number;
  cantidad_bls?: number;

  apto_alimento?: boolean;
  tiene_hielo_seco?: boolean;
  validez_dias?: number;
};
