import { useEffect } from "react";
import Step1BasicInfo from "../components/wizard/Step1BasicInfo";
import Step2RouteTransport from "../components/wizard/Step2RouteTransport";
import Step3CargoDetails from "../components/wizard/Step3CargoDetails";
import Step4Equipment from "../components/wizard/Step4Equipment";
import { useQuotationForm } from "../hooks/useQuotationForm";
import styles from "../styles/QuotationWizard.module.css";
import { motion, AnimatePresence } from "framer-motion";

export default function QuotationWizard() {
  const { step, data, updateField, updateMultipleFields, setStep, resetForm } = useQuotationForm();

  // Efecto para hacer scroll al inicio cada vez que cambie el paso
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const getProgressPercentage = () => {
    return ((step - 1) / 3) * 100;
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return "Información básica";
      case 2: return "Ruta y transporte";
      case 3: return "Detalles de carga";
      case 4: return "Equipamiento y resumen";
      default: return "";
    }
  };

  // Función para navegar a la lista de cotizaciones
  const handleGoToList = () => {
    window.location.href = "/quotations";
  };

  const variants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className={styles.wizardContainer}>
      {/* Header con título y progreso */}
      <header className={styles.wizardHeader}>
    <div className={styles.headerContent}>
      {/* Primera fila: Título y subtítulo */}
      <div className={styles.titleRow}>
        <div>
          <h1 className={styles.wizardTitle}>Nueva Cotización</h1>
          <p className={styles.wizardSubtitle}>{getStepTitle()}</p>
        </div>
      </div>
      
      {/* Segunda fila: Botón en el centro */}
      <div className={styles.buttonRow}>
        <button 
          className={styles.listButton}
          onClick={handleGoToList}
          type="button"
        >
          Ver Lista de Cotizaciones
        </button>
      </div>
      
      {/* Tercera fila: Barra de progreso */}
      <div className={styles.progressContainer}>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
        
        <div className={styles.stepCounter}>
          <span className={styles.currentStep}>{step}</span>
          <span className={styles.totalSteps}>de 4 pasos</span>
        </div>
      </div>
    </div>
  </header>

      {/* Contenido principal */}
      <main className={styles.wizardContent}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className={styles.stepContainer}
          >
            {step === 1 && (
              <Step1BasicInfo 
                data={data} 
                updateField={updateField} 
                onNext={() => setStep(2)} 
              />
            )}

            {step === 2 && (
              <Step2RouteTransport
                data={data}
                updateField={updateField}
                onNext={() => setStep(3)}
                onBack={() => setStep(1)}
              />
            )}

            {step === 3 && (
              <Step3CargoDetails
                data={data}
                updateField={updateField}
                updateMultipleFields={updateMultipleFields}
                onNext={() => setStep(4)}
                onBack={() => setStep(2)}
              />
            )}

            {step === 4 && (
              <Step4Equipment
                data={data}
                updateField={updateField}
                onBack={() => setStep(3)}
                resetForm={resetForm}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}