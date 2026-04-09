import type { QuotationForm } from "../../types/quotation";
import { useState, useRef, useEffect } from "react";
import styles from "../../styles/Step3CargoDetails.module.css";

interface Props {
  data: QuotationForm;
  updateField: (field: keyof QuotationForm, value: any) => void;
  updateMultipleFields: (fields: any) => void;
  onNext: () => void;
  onBack: () => void;
}

interface Bulto {
  id: number;
  peso_bruto_kg: number;
  largo: number;
  ancho: number;
  alto: number;
}

export default function Step3CargoDetails({ data, updateField, updateMultipleFields, onNext, onBack }: Props) {
  const nextId = useRef(1);
  
  const [bultos, setBultos] = useState<Bulto[]>(() => {
    const initialBultos: Bulto[] = [];
    
    if (data.bultos && data.bultos > 0) {
      for (let i = 0; i < data.bultos; i++) {
        initialBultos.push({
          id: nextId.current++,
          peso_bruto_kg: data.peso_bruto_kg || 0,
          largo: data.largo || 0,
          ancho: data.ancho || 0,
          alto: data.alto || 0,
        });
      }
    } else {
      initialBultos.push({
        id: nextId.current++,
        peso_bruto_kg: data.peso_bruto_kg || 0,
        largo: data.largo || 0,
        ancho: data.ancho || 0,
        alto: data.alto || 0,
      });
    }
    
    return initialBultos;
  });

  const calcularTotales = () => {
    const totalPesoBruto = bultos.reduce((sum, bulto) => sum + (Number(bulto.peso_bruto_kg) || 0), 0);
    const totalVolumenCBM = bultos.reduce((sum, bulto) => {
      const volumenBulto = ((Number(bulto.largo) || 0) * (Number(bulto.ancho) || 0) * (Number(bulto.alto) || 0)) / 1000000;
      return sum + volumenBulto;
    }, 0);
    
    const factor = data.modalidad === "maritima" ? 1000 : 167;
    const pesoVolumetrico = totalVolumenCBM * factor;
    const chargeableWeight = Math.max(totalPesoBruto, pesoVolumetrico);
    const toneladas = totalPesoBruto / 1000;
    
    return {
      totalPesoBruto,
      totalVolumenCBM,
      pesoVolumetrico,
      chargeableWeight,
      toneladas,
      esCargaMaritima: data.modalidad === "maritima"
    };
  };

  const {
    totalPesoBruto,
    totalVolumenCBM,
    pesoVolumetrico,
    chargeableWeight,
    toneladas,
    esCargaMaritima
  } = calcularTotales();

  const calcularDimensionesPromedio = () => {
    if (bultos.length === 0) return null;
    
    const totalLargo = bultos.reduce((sum, b) => sum + (Number(b.largo) || 0), 0);
    const totalAncho = bultos.reduce((sum, b) => sum + (Number(b.ancho) || 0), 0);
    const totalAlto = bultos.reduce((sum, b) => sum + (Number(b.alto) || 0), 0);
    
    return {
      largo: totalLargo / bultos.length,
      ancho: totalAncho / bultos.length,
      alto: totalAlto / bultos.length,
    };
  };

  useEffect(() => {
    const dimensionesPromedio = calcularDimensionesPromedio();
    
    const updates = {
      bultos: bultos.length,
      peso_bruto_kg: totalPesoBruto,
      volumen_cbm: totalVolumenCBM,
      chargeable_weight: chargeableWeight,
      toneladas: toneladas,
      ...(dimensionesPromedio && {
        largo: dimensionesPromedio.largo,
        ancho: dimensionesPromedio.ancho,
        alto: dimensionesPromedio.alto,
      })
    };

    updateMultipleFields(updates);
  }, [bultos, totalPesoBruto, totalVolumenCBM, chargeableWeight, toneladas]);

  const agregarBulto = () => {
    const nuevoBulto: Bulto = {
      id: nextId.current++,
      peso_bruto_kg: 0,
      largo: 0,
      ancho: 0,
      alto: 0,
    };
    setBultos([...bultos, nuevoBulto]);
  };

  const eliminarBulto = (id: number) => {
    if (bultos.length > 1) {
      setBultos(bultos.filter(bulto => bulto.id !== id));
    }
  };

  const actualizarBulto = (id: number, campo: keyof Bulto, valor: string) => {
    const numValor = Number(valor) || 0;
    setBultos(bultos.map(bulto => 
      bulto.id === id ? { ...bulto, [campo]: numValor } : bulto
    ));
  };

  const copiarABultos = () => {
    if (bultos.length > 0) {
      const primerBulto = bultos[0];
      setBultos(bultos.map(bulto => ({
        ...bulto,
        peso_bruto_kg: primerBulto.peso_bruto_kg || 0,
        largo: primerBulto.largo || 0,
        ancho: primerBulto.ancho || 0,
        alto: primerBulto.alto || 0,
      })));
    }
  };

  const handleNext = () => {
    const dimensionesPromedio = calcularDimensionesPromedio();
    
    updateField("bultos", bultos.length);
    updateField("peso_bruto_kg", totalPesoBruto);
    updateField("volumen_cbm", totalVolumenCBM);
    updateField("chargeable_weight", chargeableWeight);
    updateField("toneladas", toneladas);
    
    if (dimensionesPromedio) {
      updateField("largo", dimensionesPromedio.largo);
      updateField("ancho", dimensionesPromedio.ancho);
      updateField("alto", dimensionesPromedio.alto);
    }
    
    onNext();
  };

  const isValid = 
    data.mercaderia && 
    data.mercaderia.trim() !== "" &&
    totalPesoBruto > 0 && 
    totalVolumenCBM > 0 &&
    data.valor_comercial !== undefined && 
    data.valor_comercial !== null &&
    data.valor_comercial > 0;

  return (
    <div className={styles.stepContainer}>
      <h3 className={styles.title}>Paso 3 – Detalles de Mercadería</h3>

      <div className={styles.mainGrid}>
        {/* COLUMNA IZQUIERDA: Detalles de mercadería */}
        <div className={styles.leftColumn}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Mercadería <span className={styles.requiredMarker}>*</span>
            </label>
            <input
              type="text"
              value={data.mercaderia || ""}
              onChange={(e) => updateField("mercaderia", e.target.value)}
              className={styles.formInput}
              placeholder="Descripción de la mercadería"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Valor Comercial (USD) <span className={styles.requiredMarker}>*</span>
            </label>
            <input
              type="number"
              value={data.valor_comercial || ""}
              onChange={(e) => updateField("valor_comercial", Number(e.target.value))}
              className={styles.formInput}
              placeholder="Valor en dólares"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className={styles.bultosContainer}>
            <div className={styles.sectionHeader}>
              <h4 className={styles.sectionTitle}>Detalle de Bultos</h4>
              <div className={styles.buttonGroup}>
                <button 
                  type="button" 
                  onClick={agregarBulto}
                  className={`${styles.button} ${styles.buttonPrimary}`}
                >
                  + Agregar Bulto
                </button>
                {bultos.length > 1 && (
                  <button 
                    type="button" 
                    onClick={copiarABultos}
                    className={`${styles.button} ${styles.buttonSuccess}`}
                  >
                    Copiar a Todos
                  </button>
                )}
              </div>
            </div>

            <div className={styles.bultosGrid}>
              {bultos.map((bulto, index) => (
                <div key={`bulto-${bulto.id}`} className={styles.bultoCard}>
                  <div className={styles.bultoHeader}>
                    <strong className={styles.bultoTitle}>Bulto {index + 1}</strong>
                    {bultos.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => eliminarBulto(bulto.id)}
                        className={styles.deleteButton}
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                  
                  <div className={styles.bultoFieldsGrid}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        Peso (kg) *
                      </label>
                      <input
                        type="number"
                        value={bulto.peso_bruto_kg || ""}
                        onChange={(e) => actualizarBulto(bulto.id, "peso_bruto_kg", e.target.value)}
                        className={styles.fieldInput}
                        min="0"
                        step="0.1"
                        required
                      />
                    </div>
                    
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        Largo (cm) *
                      </label>
                      <input
                        type="number"
                        value={bulto.largo || ""}
                        onChange={(e) => actualizarBulto(bulto.id, "largo", e.target.value)}
                        className={styles.fieldInput}
                        min="0"
                        step="0.1"
                        required
                      />
                    </div>
                    
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        Ancho (cm) *
                      </label>
                      <input
                        type="number"
                        value={bulto.ancho || ""}
                        onChange={(e) => actualizarBulto(bulto.id, "ancho", e.target.value)}
                        className={styles.fieldInput}
                        min="0"
                        step="0.1"
                        required
                      />
                    </div>
                    
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        Alto (cm) *
                      </label>
                      <input
                        type="number"
                        value={bulto.alto || ""}
                        onChange={(e) => actualizarBulto(bulto.id, "alto", e.target.value)}
                        className={styles.fieldInput}
                        min="0"
                        step="0.1"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Totales y cálculos */}
        <div className={styles.rightColumn}>
  <div className={styles.totalesContainer}>
    <h4 className={styles.totalesTitle}>Totales y Cálculos</h4>
    
    <div className={styles.totalesGrid}>
      {/* NÚMERO DE BULTOS - OCUPA 2 COLUMNAS */}
      <div className={styles.totalItem}>
        <label className={styles.totalLabel}>
          Número de Bultos
        </label>
        <div className={styles.totalValue}>
          <div className={styles.highlightValue}>{bultos.length}</div>
          <span className={styles.totalSubtext}>
            {bultos.length === 1 ? "bulto" : "bultos"}
          </span>
        </div>
      </div>
      
      {/* PESO BRUTO TOTAL - COLUMNA IZQUIERDA */}
      <div className={styles.totalItem}>
        <label className={styles.totalLabel}>
          Peso Bruto Total
        </label>
        <div className={styles.totalValue}>
          <div className={styles.highlightValue}>{totalPesoBruto.toFixed(2)}</div>
          <span className={styles.totalSubtext}>kg</span>
        </div>
      </div>
      
      {/* TONELADAS - COLUMNA DERECHA (Sustituye el ítem original de toneladas) */}
      <div className={`${styles.totalItem} ${styles.toneladasItem}`}>
        <div className={styles.toneladasLabel}>
          <label className={styles.totalLabel}>
            Toneladas
          </label>
          {esCargaMaritima && (
            <span className={styles.modalityBadge}>MARÍTIMO</span>
          )}
        </div>
        <div className={`${styles.toneladasBox} ${esCargaMaritima ? styles.toneladasMaritima : ''}`}>
          <div className={styles.highlightValue}>{toneladas.toFixed(4)}</div>
          <span className={styles.totalSubtext}>
            {totalPesoBruto.toFixed(2)} kg ÷ 1000
          </span>
        </div>
      </div>
      
      {/* VOLUMEN TOTAL - COLUMNA IZQUIERDA */}
      <div className={styles.totalItem}>
        <label className={styles.totalLabel}>
          Volumen Total
        </label>
        <div className={styles.totalValue}>
          <div className={styles.highlightValue}>{totalVolumenCBM.toFixed(4)}</div>
          <span className={styles.totalSubtext}>m³ (CBM)</span>
        </div>
      </div>
      
      {/* PESO VOLUMÉTRICO - COLUMNA DERECHA */}
      <div className={styles.totalItem}>
        <label className={styles.totalLabel}>
          Peso Volumétrico
        </label>
        <div className={styles.totalValue}>
          <div className={styles.highlightValue}>{pesoVolumetrico.toFixed(2)}</div>
          <span className={styles.totalSubtext}>
            {esCargaMaritima ? "1 m³ = 1000 kg" : "1 m³ = 167 kg"}
          </span>
        </div>
      </div>
      
      {/* CHARGEABLE WEIGHT - OCUPA 2 COLUMNAS */}
      <div className={styles.totalItem}>
        <label className={styles.totalLabel}>
          Chargeable Weight
        </label>
        <div className={`${styles.totalValue} ${styles.chargeableWeight}`}>
          <div className={styles.highlightValue}>{chargeableWeight.toFixed(2)}</div>
          <span className={styles.totalSubtext}>kg (el mayor entre peso y volumétrico)</span>
        </div>
      </div>
    </div>
    
    {/* INFO TEXT debajo de la grid */}
    <div className={styles.infoText}>
      Factor volumétrico: {esCargaMaritima ? "1:1000" : "1:167"} 
      <br/>
      ({esCargaMaritima ? "marítimo" : "aéreo"})
    </div>
  </div>
</div>
      </div>

      {/* NAVEGACIÓN - Ocupa todo el ancho */}
      <div className={styles.navigation}>
        <button 
          type="button"
          onClick={onBack}
          className={`${styles.button} ${styles.buttonSecondary}`}
        >
          ← Anterior
        </button>
        
        <button 
          type="button"
          disabled={!isValid} 
          onClick={handleNext}
          className={`${styles.button} ${styles.buttonPrimary}`}
          style={!isValid ? { backgroundColor: '#ccc' } : {}}
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}