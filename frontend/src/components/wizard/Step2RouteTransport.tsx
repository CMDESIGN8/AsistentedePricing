import type { QuotationForm } from "../../types/quotation";
import styles from "../../styles/Step2RouteTransport.module.css";

interface Props {
  data: QuotationForm;
  updateField: (field: keyof QuotationForm, value: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step2RouteTransport({ data, updateField, onNext, onBack }: Props) {
  const { tipo_operacion } = data;

  const isMaritimo = tipo_operacion === "EM" || tipo_operacion === "IM";
  const isAereo = tipo_operacion === "EA" || tipo_operacion === "IA";
  const isTerrestre = tipo_operacion === "ET" || tipo_operacion === "IT";

  // Opciones de INCOTERMS organizadas por grupos
  const incotermsOptions = [
    { value: "EXW", label: "EXW - En fábrica" },
    { value: "FCA", label: "FCA - Franco transportista" },
    { value: "FAS", label: "FAS - Franco al costado del buque" },
    { value: "FOB", label: "FOB - Franco a bordo" },
    { value: "CFR", label: "CFR - Costo y flete" },
    { value: "CIF", label: "CIF - Costo, seguro y flete" },
    { value: "CPT", label: "CPT - Transporte pagado hasta" },
    { value: "CIP", label: "CIP - Transporte y seguro pagados hasta" },
    { value: "DPU", label: "DPU - Entregada en lugar descargado" },
    { value: "DAP", label: "DAP - Entregada en lugar" },
    { value: "DDP", label: "DDP - Entregada derechos pagados" }
  ];

  // SIN VALIDACIÓN - Todos los campos son opcionales
  const isValid = true;

  return (
    <div className={styles.step2Container}>
      {/* Header */}

      {/* Contenido principal */}
      <main className={styles.step2Main}>
        {/* Sección 1: INCOTERMS - Siempre visible */}
        <section className={`${styles.section} ${styles.incotermsSection}`}>
          <h2 className={`${styles.sectionTitle} ${styles.incotermsTitle}`}>
            📋 Términos de Entrega (INCOTERMS 2020)
            <span className={styles.optionalBadge}>opcional</span>
          </h2>
          
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                INCOTERM Origen
              </label>
              <select
                className={`${styles.formSelect} ${styles.incotermsSection}`}
                value={data.incoterm_origen || ""}
                onChange={(e) => updateField("incoterm_origen", e.target.value)}
              >
                <option value="">-- Seleccionar INCOTERM (opcional) --</option>
                {incotermsOptions.map((incoterm) => (
                  <option key={`origen-${incoterm.value}`} value={incoterm.value}>
                    {incoterm.label}
                  </option>
                ))}
              </select>
              <small className={styles.helpText}>
                Punto donde el vendedor entrega la mercadería
              </small>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                INCOTERM Destino
              </label>
              <select
                className={`${styles.formSelect} ${styles.incotermsSection}`}
                value={data.incoterm_destino || ""}
                onChange={(e) => updateField("incoterm_destino", e.target.value)}
              >
                <option value="">-- Seleccionar INCOTERM (opcional) --</option>
                {incotermsOptions.map((incoterm) => (
                  <option key={`destino-${incoterm.value}`} value={incoterm.value}>
                    {incoterm.label}
                  </option>
                ))}
              </select>
              <small className={styles.helpText}>
                Punto donde finaliza la responsabilidad del vendedor
              </small>
            </div>
          </div>

          {/* Días Libres */}
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Días Libres en Origen
              </label>
              <input
                type="number"
                min="0"
                max="30"
                className={`${styles.formInput} ${styles.incotermsSection}`}
                value={data.dias_libres_origen || ""}
                onChange={(e) => updateField("dias_libres_origen", Number(e.target.value) || null)}
                placeholder="Ej: 5 (opcional)"
              />
              <small className={styles.helpText}>
                Tiempo gratuito en origen para carga/descarga
              </small>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Días Libres en Destino
              </label>
              <input
                type="number"
                min="0"
                max="30"
                className={`${styles.formInput} ${styles.incotermsSection}`}
                value={data.dias_libres_destino || ""}
                onChange={(e) => updateField("dias_libres_destino", Number(e.target.value) || null)}
                placeholder="Ej: 7 (opcional)"
              />
              <small className={styles.helpText}>
                Tiempo gratuito en destino para recoger mercadería
              </small>
            </div>
          </div>
        </section>

        {/* Sección 2: Campos específicos por tipo de transporte */}
        
        {/* Transporte Marítimo */}
        {isMaritimo && (
          <section className={`${styles.section} ${styles.maritimoSection}`}>
            <h2 className={`${styles.sectionTitle} ${styles.maritimoTitle}`}>
              🚢 Transporte Marítimo
              <span className={styles.optionalBadge}>opcional</span>
            </h2>
            
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Puerto de Origen (POL)
                </label>
                <input
                  type="text"
                  className={`${styles.formInput} ${styles.maritimoInput}`}
                  value={data.pol || ""}
                  onChange={(e) => updateField("pol", e.target.value)}
                  placeholder="Ej: Shanghai, China"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Puerto de Destino (POD)
                </label>
                <input
                  type="text"
                  className={`${styles.formInput} ${styles.maritimoInput}`}
                  value={data.pod || ""}
                  onChange={(e) => updateField("pod", e.target.value)}
                  placeholder="Ej: Buenos Aires, Argentina"
                />
              </div>
            </div>

            {/* Lugar Pickup/Delivery para Marítimo */}
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Lugar de Pickup
                </label>
                <input
                  type="text"
                  className={`${styles.formInput} ${styles.maritimoInput}`}
                  value={data.lugar_pickup || ""}
                  onChange={(e) => updateField("lugar_pickup", e.target.value)}
                  placeholder="Ej: Almacén del exportador"
                />
                <small className={styles.helpText}>
                  Punto donde se recoge la mercadería para llevarla al puerto
                </small>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Lugar de Delivery
                </label>
                <input
                  type="text"
                  className={`${styles.formInput} ${styles.maritimoInput}`}
                  value={data.lugar_delivery || ""}
                  onChange={(e) => updateField("lugar_delivery", e.target.value)}
                  placeholder="Ej: Almacén del importador"
                />
                <small className={styles.helpText}>
                  Punto final de entrega después del puerto
                </small>
              </div>
            </div>

            {/* Transbordos */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Transbordos
              </label>
              <div className={styles.transbordosGrid}>
                <input
                  type="text"
                  className={`${styles.formInput} ${styles.maritimoInput}`}
                  value={data.transbordo_1 || ""}
                  onChange={(e) => updateField("transbordo_1", e.target.value)}
                  placeholder="Transbordo 1"
                />
                <input
                  type="text"
                  className={`${styles.formInput} ${styles.maritimoInput}`}
                  value={data.transbordo_2 || ""}
                  onChange={(e) => updateField("transbordo_2", e.target.value)}
                  placeholder="Transbordo 2"
                />
                <input
                  type="text"
                  className={`${styles.formInput} ${styles.maritimoInput}`}
                  value={data.transbordo_3 || ""}
                  onChange={(e) => updateField("transbordo_3", e.target.value)}
                  placeholder="Transbordo 3"
                />
              </div>
            </div>

            {/* Línea marítima y transit time */}
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Línea Marítima
                </label>
                <input
                  type="text"
                  className={`${styles.formInput} ${styles.maritimoInput}`}
                  value={data.linea_maritima || ""}
                  onChange={(e) => updateField("linea_maritima", e.target.value)}
                  placeholder="Ej: Maersk Line, MSC"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Transit Time (días)
                </label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  className={`${styles.formInput} ${styles.maritimoInput}`}
                  value={data.transit_time || ""}
                  onChange={(e) => updateField("transit_time", Number(e.target.value) || null)}
                  placeholder="Ej: 35"
                />
                <small className={styles.helpText}>
                  Tiempo estimado de tránsito marítimo
                </small>
              </div>
            </div>
          </section>
        )}

        {/* Transporte Aéreo */}
        {isAereo && (
          <section className={`${styles.section} ${styles.aereoSection}`}>
            <h2 className={`${styles.sectionTitle} ${styles.aereoTitle}`}>
              ✈️ Transporte Aéreo
              <span className={styles.optionalBadge}>opcional</span>
            </h2>
            
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Aeropuerto Origen (AOL)
                </label>
                <input
                  type="text"
                  className={`${styles.formInput} ${styles.aereoInput}`}
                  value={data.pol || ""}
                  onChange={(e) => updateField("pol", e.target.value)}
                  placeholder="Ej: MIA - Miami International"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Aeropuerto Destino (AOD)
                </label>
                <input
                  type="text"
                  className={`${styles.formInput} ${styles.aereoInput}`}
                  value={data.pod || ""}
                  onChange={(e) => updateField("pod", e.target.value)}
                  placeholder="Ej: EZE - Buenos Aires"
                />
              </div>
            </div>

            {/* Lugar Pickup/Delivery para Aéreo */}
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Lugar de Pickup
                </label>
                <input
                  type="text"
                  className={`${styles.formInput} ${styles.aereoInput}`}
                  value={data.lugar_pickup || ""}
                  onChange={(e) => updateField("lugar_pickup", e.target.value)}
                  placeholder="Ej: CEDIS del exportador"
                />
                <small className={styles.helpText}>
                  Punto donde se recoge para llevar al aeropuerto
                </small>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Lugar de Delivery
                </label>
                <input
                  type="text"
                  className={`${styles.formInput} ${styles.aereoInput}`}
                  value={data.lugar_delivery || ""}
                  onChange={(e) => updateField("lugar_delivery", e.target.value)}
                  placeholder="Ej: Bodega del importador"
                />
                <small className={styles.helpText}>
                  Punto final después del aeropuerto
                </small>
              </div>
            </div>

            {/* Transbordos */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Transbordos
              </label>
              <div className={styles.transbordosGrid}>
                <input
                  type="text"
                  className={`${styles.formInput} ${styles.aereoInput}`}
                  value={data.transbordo_1 || ""}
                  onChange={(e) => updateField("transbordo_1", e.target.value)}
                  placeholder="Transbordo 1"
                />
                <input
                  type="text"
                  className={`${styles.formInput} ${styles.aereoInput}`}
                  value={data.transbordo_2 || ""}
                  onChange={(e) => updateField("transbordo_2", e.target.value)}
                  placeholder="Transbordo 2"
                />
                <input
                  type="text"
                  className={`${styles.formInput} ${styles.aereoInput}`}
                  value={data.transbordo_3 || ""}
                  onChange={(e) => updateField("transbordo_3", e.target.value)}
                  placeholder="Transbordo 3"
                />
              </div>
            </div>

            {/* Aerolínea y transit time */}
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Aerolínea
                </label>
                <input
                  type="text"
                  className={`${styles.formInput} ${styles.aereoInput}`}
                  value={data.aerolinea || ""}
                  onChange={(e) => updateField("aerolinea", e.target.value)}
                  placeholder="Ej: American Airlines"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Transit Time (días)
                </label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  className={`${styles.formInput} ${styles.aereoInput}`}
                  value={data.transit_time || ""}
                  onChange={(e) => updateField("transit_time", Number(e.target.value) || null)}
                  placeholder="Ej: 5"
                />
                <small className={styles.helpText}>
                  Tiempo estimado de tránsito aéreo
                </small>
              </div>
            </div>
          </section>
        )}

        {/* Transporte Terrestre */}
        {isTerrestre && (
          <section className={`${styles.section} ${styles.terrestreSection}`}>
            <h2 className={`${styles.sectionTitle} ${styles.terrestreTitle}`}>
              🚚 Transporte Terrestre
              <span className={styles.optionalBadge}>opcional</span>
            </h2>
            
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Lugar de Pickup
                </label>
                <input
                  type="text"
                  className={`${styles.formInput} ${styles.terrestreInput}`}
                  value={data.lugar_pickup || ""}
                  onChange={(e) => updateField("lugar_pickup", e.target.value)}
                  placeholder="Ej: Planta industrial, Calle 123"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Lugar de Delivery
                </label>
                <input
                  type="text"
                  className={`${styles.formInput} ${styles.terrestreInput}`}
                  value={data.lugar_delivery || ""}
                  onChange={(e) => updateField("lugar_delivery", e.target.value)}
                  placeholder="Ej: Almacén del cliente, Av. Principal 456"
                />
              </div>
            </div>

            {/* Ciudad Origen/Destino para Terrestre */}
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Ciudad Origen
                </label>
                <input
                  type="text"
                  className={`${styles.formInput} ${styles.terrestreInput}`}
                  value={data.pol || ""}
                  onChange={(e) => updateField("pol", e.target.value)}
                  placeholder="Ej: Ciudad de México"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Ciudad Destino
                </label>
                <input
                  type="text"
                  className={`${styles.formInput} ${styles.terrestreInput}`}
                  value={data.pod || ""}
                  onChange={(e) => updateField("pod", e.target.value)}
                  placeholder="Ej: Monterrey"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Transit Time (días estimados)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                className={`${styles.formInput} ${styles.terrestreInput}`}
                value={data.transit_time || ""}
                onChange={(e) => updateField("transit_time", Number(e.target.value) || null)}
                placeholder="Ej: 3"
              />
            </div>
          </section>
        )}

        {/* Botones de navegación */}
        <div className={styles.navigation}>
          <button 
            onClick={onBack}
            className={`${styles.button} ${styles.buttonBack}`}
          >
            ← Anterior
          </button>
          
          <button 
            onClick={onNext}
            className={`${styles.button} ${styles.buttonNext}`}
          >
            Siguiente →
          </button>
        </div>
      </main>
    </div>
  );
}