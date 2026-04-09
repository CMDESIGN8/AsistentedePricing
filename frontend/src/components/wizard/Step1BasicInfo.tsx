import type { QuotationForm, TipoOperacion } from "../../types/quotation";
import styles from "../../styles/Step1BasicInfo.module.css";

interface Props {
  data: QuotationForm;
  updateField: (field: keyof QuotationForm, value: any) => void;
  onNext: () => void;
}

export default function Step1BasicInfo({ data, updateField, onNext }: Props) {
  const isValid = data.referencia && data.tipo_operacion;

  const operations = {
    importacion: [
      { value: "IM", label: "Importación Marítima", icon: "🚢" },
      { value: "IA", label: "Importación Aérea", icon: "✈️" },
      { value: "IT", label: "Importación Terrestre", icon: "🚚" }
    ],
    exportacion: [
      { value: "EM", label: "Exportación Marítima", icon: "🚢" },
      { value: "EA", label: "Exportación Aérea", icon: "✈️" },
      { value: "ET", label: "Exportación Terrestre", icon: "🚚" }
    ],
    courier: [
      { value: "CR", label: "Courier", icon: "📦" }
    ],
    otros: [
      { value: "CO", label: "Cross Trade", icon: "🌐" }
    ]
  };

  const handleSelect = (value: TipoOperacion) => {
    updateField("tipo_operacion", value);
  };

  const getSelectedLabel = () => {
    if (!data.tipo_operacion) return "";
    
    const labels: Record<TipoOperacion, string> = {
      "IM": "Importación Marítima",
      "IA": "Importación Aérea", 
      "IT": "Importación Terrestre",
      "EM": "Exportación Marítima",
      "EA": "Exportación Aérea",
      "ET": "Exportación Terrestre",
      "CR": "Courier",
      "CO": "Cross Trade"
    };
    
    return labels[data.tipo_operacion];
  };

  const getIconForOperation = (operation: TipoOperacion) => {
    const iconMap: Record<TipoOperacion, string> = {
      "IM": "🚢",
      "IA": "✈️", 
      "IT": "🚚",
      "EM": "🚢",
      "EA": "✈️",
      "ET": "🚚",
      "CR": "📦",
      "CO": "🌐"
    };
    return iconMap[operation] || "";
  };

  const getOperationColor = (operation: TipoOperacion) => {
    if (["IM", "IA", "IT"].includes(operation)) return styles.importBadge;
    if (["EM", "EA", "ET"].includes(operation)) return styles.exportBadge;
    if (operation === "CR") return styles.courierBadge;
    if (operation === "CO") return styles.otherBadge;
    return "";
  };

  return (
    <div className={styles.step1Container}>
      <main className={styles.mainContent}>
        {/* Referencia y tipo seleccionado */}
        <div className={styles.referenceSection}>
          <div className={styles.referenceRow}>
            <div className={styles.referenceColumn}>
              <label className={styles.label}>
                Referencia de la cotización
              </label>
              <input
                type="text"
                value={data.referencia}
                onChange={(e) => updateField("referencia", e.target.value)}
                className={styles.referenceInput}
                placeholder="Ej: COT-2024-001"
              />
            </div>
            
            {data.tipo_operacion && (
              <div className={styles.selectedOperationColumn}>
                <label className={styles.label}>
                  Tipo de cotización seleccionado
                </label>
                <div className={`${styles.selectedOperationBadge} ${getOperationColor(data.tipo_operacion)}`}>
                  <span className={styles.operationIconSmall}>
                    {getIconForOperation(data.tipo_operacion)}
                  </span>
                  <span className={styles.operationLabelSmall}>
                    {getSelectedLabel()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contenedor principal de operaciones */}
        <div className={styles.operationsContainer}>
          
          {/* Sección de Importación */}
          <div className={styles.importSection}>
            <h2 className={styles.sectionTitle}>Importación</h2>
            <div className={styles.operationsGrid}>
              {operations.importacion.map((op) => (
                <button
                  key={op.value}
                  type="button"
                  onClick={() => handleSelect(op.value as TipoOperacion)}
                  className={`${styles.operationButton} ${styles.importButton} ${
                    data.tipo_operacion === op.value ? styles.selectedImport : ''
                  }`}
                >
                  <div className={styles.operationIcon}>{op.icon}</div>
                  <div className={styles.operationLabel}>
                    {op.label.split(' ')[1]}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sección de Exportación */}
          <div className={styles.exportSection}>
            <h2 className={styles.sectionTitle}>Exportación</h2>
            <div className={styles.operationsGrid}>
              {operations.exportacion.map((op) => (
                <button
                  key={op.value}
                  type="button"
                  onClick={() => handleSelect(op.value as TipoOperacion)}
                  className={`${styles.operationButton} ${styles.exportButton} ${
                    data.tipo_operacion === op.value ? styles.selectedExport : ''
                  }`}
                >
                  <div className={styles.operationIcon}>{op.icon}</div>
                  <div className={styles.operationLabel}>
                    {op.label.split(' ')[1]}
                  </div>
                </button>
                
              ))}
            </div>
          </div>

        </div>

        {/* Sección Courier - debajo de Importación/Exportación */}
        <div className={styles.courierSection}>
          <div className={styles.courierGrid}>
            {operations.courier.map((op) => (
              <button
                key={op.value}
                type="button"
                onClick={() => handleSelect(op.value as TipoOperacion)}
                className={`${styles.courierButton} ${
                  data.tipo_operacion === op.value ? styles.selectedCourier : ''
                }`}
              >
                <div className={styles.courierIcon}>{op.icon}</div>
                <div className={styles.courierLabel}>{op.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer con botón */}
        <div className={styles.footer}>
          <div>
            {isValid && (
              <div className={styles.validationMessage}>
                <svg 
                  className={styles.validationIcon} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="3" 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
                Campos completados
              </div>
            )}
          </div>
          
          <button
            type="button"
            disabled={!isValid}
            onClick={onNext}
            className={`${styles.nextButton} ${
              isValid ? styles.nextButtonEnabled : ''
            }`}
          >
            Siguiente paso
          </button>
        </div>
      </main>
    </div>
  );
}