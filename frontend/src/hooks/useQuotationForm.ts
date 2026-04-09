import { useState } from "react";
import type { QuotationForm, TipoOperacion } from "../types/quotation";

const initialState: QuotationForm = {
  referencia: "",
  tipo_operacion: "",
  
  // Sección 2
  pol: "",
  transbordo_1: "",
  transbordo_2: "",
  transbordo_3: "",
  pod: "",
  linea_maritima: "",
  aerolinea: "",
  transit_time: undefined,
  dias_libres_destino: undefined,

  // Sección 3
  mercaderia: "",
  bultos: 1,
  peso_bruto_kg: undefined,
  toneladas: undefined,
  volumen_cbm: undefined,
  chargeable_weight: undefined,
  largo: undefined,
  ancho: undefined,
  alto: undefined,
  valor_comercial: undefined,
  // Sección 4
  tipo_carga: undefined,
  tipo_contenedor: "",
  cantidad_contenedores: 1,
  cantidad_bls: 1,
  apto_alimento: false,
  tiene_hielo_seco: false,
  validez_dias: undefined,
};

export function useQuotationForm() {
  const [data, setData] = useState<QuotationForm>(initialState);
  const [step, setStep] = useState(1);

  // En tu hook useQuotationForm
const updateField = (field: keyof QuotationForm, value: any) => {
  setData(prev => {
    const newData = { ...prev, [field]: value };

    // Cálculo automático CBM y chargeable weight (mantenemos tu lógica)
    const { largo, ancho, alto, peso_bruto_kg, tipo_operacion } = newData;
    if (largo && ancho && alto) {
      const cbm = (largo * ancho * alto) / 1_000_000;
      newData.volumen_cbm = cbm;
      if (peso_bruto_kg) {
        if (tipo_operacion?.includes("A")) {
          newData.chargeable_weight = Math.max(peso_bruto_kg, cbm * 167);
        } else {
          newData.chargeable_weight = peso_bruto_kg;
        }
      }
    }
    return newData;
  });
};

// Nueva función para actualizar todo de un solo golpe
const updateMultipleFields = (fields: Partial<QuotationForm>) => {
  setData(prev => ({
    ...prev,
    ...fields
  }));
};

  const resetForm = () => {
    setData(initialState);
    setStep(1);
  };

  return {
    step,
    data,
    setStep,
    updateField,
    updateMultipleFields,
    resetForm,
  };
}
