import { useState, useEffect } from "react";
import type { QuotationForm } from "../../types/quotation";
import { createQuotation } from "../../api/quotation";
import styles from "../../styles/Step4Equipment.module.css";

interface Props {
  data: QuotationForm;
  updateField: (field: keyof QuotationForm, value: any) => void;
  onBack: () => void;
  resetForm: () => void;
}

export default function Step4Equipment({ data, updateField, onBack, resetForm }: Props) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  
  // Determinar si se debe mostrar la sección de carga marítima
  const shouldShowCargoSection = data.tipo_operacion === "EM" || data.tipo_operacion === "IM";
  
  // Determinar si es operación aérea (IA, EA, CR, CO)
  const isAirOperation = data.tipo_operacion === "IA" || 
                         data.tipo_operacion === "EA" || 
                         data.tipo_operacion === "CR" || 
                         data.tipo_operacion === "CO";
  
  const isFCL = data.tipo_carga === "FCL";
  const isValid =
    (isFCL ? data.tipo_contenedor && data.cantidad_contenedores : true) &&
    data.validez_dias !== undefined &&
    data.tipo_carga !== undefined;

  // Efecto para establecer automáticamente el tipo de carga como "Aerea" para operaciones aéreas
  useEffect(() => {
    if (isAirOperation && data.tipo_carga !== "Aerea") {
      updateField("tipo_carga", "Aerea");
    }
  }, [data.tipo_operacion, data.tipo_carga]);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      await createQuotation(data);
      setSuccess(true);
    } catch (err: any) {
      setError("Error al guardar la cotización. Por favor, intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewQuotation = () => {
    setSuccess(false);
    resetForm();
  };

  // Estado de éxito
  if (success) {
    return (
      <div className={styles.step4Container}>
        <div className={styles.successContainer}>
          <div className={styles.successIcon}>✅</div>
          <h2 className={styles.successTitle}>¡Cotización creada con éxito!</h2>
          <p className={styles.successMessage}>
            La cotización ha sido guardada correctamente en el sistema. 
            Puedes revisarla en el listado de cotizaciones o crear una nueva.
          </p>
          <button
            onClick={handleNewQuotation}
            className={`${styles.button} ${styles.buttonSuccess}`}
          >
            Crear nueva cotización
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.step4Container}>
      {/* Header */}
      

      {/* Contenido principal */}
      <main className={styles.step4Main}>
        <div className={styles.contentWrapper}>
          {/* Panel izquierdo - Formulario */}
          <div className={styles.formPanel}>
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Tipo de carga</h2>
              
              {/* Solo mostrar selector de tipo de carga para operaciones marítimas */}
              {shouldShowCargoSection && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Tipo de carga</label>
                  <select
                    className={styles.formSelect}
                    value={data.tipo_carga || ""}
                    onChange={(e) => updateField("tipo_carga", e.target.value)}
                  >
                    <option value="">Seleccionar tipo de carga</option>
                    <option value="FCL">FCL (Full Container Load)</option>
                    <option value="LCL">LCL (Less than Container Load)</option>
                  </select>
                </div>
              )}
              
              {/* Mostrar tipo de carga fija para operaciones aéreas */}
              {isAirOperation && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Tipo de carga</label>
                  <div className={styles.fixedValue}>
                    Aérea
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>
                    Este valor se establece automáticamente para operaciones aéreas
                  </div>
                </div>
              )}

              {isFCL && (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Tipo de contenedor</label>
                    <select
                      className={styles.formSelect}
                      value={data.tipo_contenedor || ""}
                      onChange={(e) => updateField("tipo_contenedor", e.target.value)}
                    >
                      <option value="">Seleccionar tipo</option>
                      <option value="20ST">20' Standard</option>
                      <option value="40ST">40' Standard</option>
                      <option value="40HC">40' High Cube</option>
                      <option value="20RF">20' Reefer</option>
                      <option value="40RF">40' Reefer</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Cantidad de contenedores</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className={styles.formInput}
                      value={data.cantidad_contenedores || ""}
                      onChange={(e) =>
                        updateField("cantidad_contenedores", Number(e.target.value))
                      }
                      placeholder="Ej: 2"
                    />
                  </div>
                </>
              )}
            </div>

            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Documentación</h2>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Cantidad de B/L / AWB</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  className={styles.formInput}
                  value={data.cantidad_bls || ""}
                  onChange={(e) => updateField("cantidad_bls", Number(e.target.value))}
                  placeholder="Ej: 1"
                />
              </div>
            </div>

            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Especificaciones especiales</h2>
              
              <label className={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  className={styles.checkboxInput}
                  checked={data.apto_alimento || false}
                  onChange={(e) => updateField("apto_alimento", e.target.checked)}
                />
                <span className={styles.checkboxLabel}>Apto para alimento</span>
              </label>

              <label className={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  className={styles.checkboxInput}
                  checked={data.tiene_hielo_seco || false}
                  onChange={(e) => updateField("tiene_hielo_seco", e.target.checked)}
                />
                <span className={styles.checkboxLabel}>Requiere hielo seco</span>
              </label>
            </div>

            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Validez</h2>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Validez (días)</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  className={styles.formInput}
                  value={data.validez_dias || ""}
                  onChange={(e) => updateField("validez_dias", Number(e.target.value))}
                  placeholder="Ej: 30"
                />
                <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>
                  Número de días que la cotización será válida
                </div>
              </div>
            </div>
          </div>

          {/* Panel derecho - Resumen */}
<div className={styles.summaryPanel}>
  <h2 className={styles.summaryTitle}>Resumen de la cotización</h2>
  
  <div className={styles.summaryContent}>
    {data.referencia ? (
      <>
        <div className={styles.summarySection}>
          <h3 className={styles.summarySectionTitle}>Información básica</h3>
          <div className={styles.summaryItem}>
            <span className={styles.itemLabel}>Referencia:</span>
            <span className={styles.itemValue}>{data.referencia}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.itemLabel}>Tipo de operación:</span>
            <span className={styles.itemValue}>
              {data.tipo_operacion === "IM" && "Importación Marítima"}
              {data.tipo_operacion === "IA" && "Importación Aérea"}
              {data.tipo_operacion === "IT" && "Importación Terrestre"}
              {data.tipo_operacion === "EM" && "Exportación Marítima"}
              {data.tipo_operacion === "EA" && "Exportación Aérea"}
              {data.tipo_operacion === "ET" && "Exportación Terrestre"}
              {data.tipo_operacion === "CO" && "Cross Trade"}
              {data.tipo_operacion === "CR" && "Cross Trade"}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.itemLabel}>Tipo de carga:</span>
            <span className={styles.itemValue}>
              {isAirOperation ? "Aérea" : data.tipo_carga}
            </span>
          </div>
        </div>

        {/* Nueva sección: Rutas y términos */}
        <div className={styles.summarySection}>
          <h3 className={styles.summarySectionTitle}>Rutas y términos</h3>
          
          {/* Incoterm Origen */}
          {data.icoterm_origen && (
            <div className={styles.summaryItem}>
              <span className={styles.itemLabel}>Incoterm Origen:</span>
              <span className={styles.itemValue}>{data.icoterm_origen}</span>
            </div>
          )}
          
          {/* Días libres destino */}
          {data.dias_libres_destino !== undefined && (
            <div className={styles.summaryItem}>
              <span className={styles.itemLabel}>Días libres destino:</span>
              <span className={styles.itemValue}>{data.dias_libres_destino} días</span>
            </div>
          )}
          
          {/* POL (Port of Loading) */}
          {data.pol && (
            <div className={styles.summaryItem}>
              <span className={styles.itemLabel}>POL:</span>
              <span className={styles.itemValue}>{data.pol}</span>
            </div>
          )}
          
          {/* POD (Port of Discharge) */}
          {data.pod && (
            <div className={styles.summaryItem}>
              <span className={styles.itemLabel}>POD:</span>
              <span className={styles.itemValue}>{data.pod}</span>
            </div>
          )}
          
          {/* Naviera / Aerolínea */}
          {(data.linea_maritima || data.aerolinea) && (
            <div className={styles.summaryItem}>
              <span className={styles.itemLabel}>
                {shouldShowCargoSection ? "Naviera" : "Aerolínea"}:
              </span>
              <span className={styles.itemValue}>
                {shouldShowCargoSection ? data.linea_maritima : data.aerolinea}
              </span>
            </div>
          )}
          
          {/* Transit Time */}
          {data.transit_time && (
            <div className={styles.summaryItem}>
              <span className={styles.itemLabel}>Tiempo de tránsito:</span>
              <span className={styles.itemValue}>{data.transit_time} días</span>
            </div>
          )}
        </div>

        {/* Mostrar detalles de contenedores solo para operaciones marítimas FCL */}
        {shouldShowCargoSection && isFCL && (
          <div className={styles.summarySection}>
            <h3 className={styles.summarySectionTitle}>Equipo y carga</h3>
            {data.tipo_contenedor && (
              <div className={styles.summaryItem}>
                <span className={styles.itemLabel}>Tipo de contenedor:</span>
                <span className={styles.itemValue}>{data.tipo_contenedor}</span>
              </div>
            )}
            {data.cantidad_contenedores && (
              <div className={styles.summaryItem}>
                <span className={styles.itemLabel}>Cantidad de contenedores:</span>
                <span className={styles.itemValue}>{data.cantidad_contenedores}</span>
              </div>
            )}
          </div>
        )}

        <div className={styles.summarySection}>
          <h3 className={styles.summarySectionTitle}>Documentación</h3>
          {data.cantidad_bls && (
            <div className={styles.summaryItem}>
              <span className={styles.itemLabel}>Cantidad de B/L / AWB:</span>
              <span className={styles.itemValue}>{data.cantidad_bls}</span>
            </div>
          )}
        </div>

        <div className={styles.summarySection}>
          <h3 className={styles.summarySectionTitle}>Especificaciones</h3>
          <div className={styles.summaryItem}>
            <span className={styles.itemLabel}>Apto para alimento:</span>
            <span className={styles.itemValue}>
              {data.apto_alimento ? "Sí" : "No"}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.itemLabel}>Hielo seco:</span>
            <span className={styles.itemValue}>
              {data.tiene_hielo_seco ? "Sí" : "No"}
            </span>
          </div>
          {data.validez_dias && (
            <div className={styles.summaryItem}>
              <span className={styles.itemLabel}>Validez:</span>
              <span className={styles.itemValue}>{data.validez_dias} días</span>
            </div>
          )}
        </div>
      </>
    ) : (
      <div className={styles.emptyState}>
        <div className={styles.emptyStateIcon}>📋</div>
        <p className={styles.emptyStateText}>
          Completa el formulario para ver el resumen de la cotización
        </p>
      </div>
    )}
  </div>

  {/* Mensaje de error */}
  {error && (
    <div className={styles.errorMessage}>
      {error}
    </div>
  )}

  {/* Botones */}
  <div className={styles.footer}>
    <button
      onClick={onBack}
      className={`${styles.button} ${styles.buttonBack}`}
    >
      ← Anterior
    </button>
    
    <button
      disabled={!isValid || loading}
      onClick={handleSubmit}
      className={`${styles.button} ${styles.buttonSubmit}`}
    >
      {loading ? (
        <span className={styles.loadingText}>
          <span className={styles.loadingSpinner} />
          Guardando...
        </span>
      ) : (
        "Guardar Cotización"
      )}
    </button>
  </div>
</div>
        </div>
      </main>
    </div>
  );
}