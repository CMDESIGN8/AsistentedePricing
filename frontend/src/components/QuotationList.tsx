import React, { useEffect, useState } from 'react';
import { getQuotations, type QuotationItem, type QuotationsResponse } from '../api/quotation';
import { 
  calcularValidez, 
  getEstadoColor, 
  getEstadoTexto,
  type ValidezInfo 
} from '../utils/quotationUtils';
import styles from '../styles/QuotationList.module.css';

const QuotationList: React.FC = () => {
  const [quotations, setQuotations] = useState<QuotationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadQuotations();
  }, []);

  const loadQuotations = async () => {
    try {
      setLoading(true);
      const response: QuotationsResponse = await getQuotations();
      setQuotations(response.data);
      setTotal(response.total);
      setError(null);
    } catch (err: any) {
      setError('Error al cargar las cotizaciones');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const EstadoBadge = ({ estado }: { estado: string }) => {
    const color = getEstadoColor(estado);
    const texto = getEstadoTexto(estado);
    
    return (
      <span 
        className={styles.estadoBadge}
        style={{ 
          backgroundColor: `${color}20`, // 20% de opacidad
          color: color,
          borderColor: color
        }}
      >
        {texto}
      </span>
    );
  };

  // Componente para mostrar la validez
  const ValidezBadge = ({ quotation }: { quotation: QuotationItem }) => {
    const validezInfo = calcularValidez(
      quotation.created_at,
      quotation.validez_dias || 30,
      quotation.fecha_vencimiento
    );
    
    return (
      <span 
        className={styles.validezBadge}
        style={{ 
          backgroundColor: `${validezInfo.color}20`,
          color: validezInfo.color,
          borderColor: validezInfo.color
        }}
        title={`${validezInfo.dias_restantes > 0 ? `${validezInfo.dias_restantes} días restantes` : 'Vencida'}`}
      >
        {validezInfo.estado.toUpperCase()}
        {validezInfo.dias_restantes > 0 && (
          <span className={styles.diasRestantes}>
            ({validezInfo.dias_restantes}d)
          </span>
        )}
      </span>
    );
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para determinar la clase CSS según el tipo de operación
  const getOperationBadgeClass = (operationType: string) => {
    const op = operationType?.toUpperCase() || '';
    
    if (op.startsWith('IM') || op.startsWith('IA') || op.startsWith('IT')) {
      return styles.importBadge; // Amarillas
    } else if (op.startsWith('EM') || op.startsWith('EA') || op.startsWith('ET')) {
      return styles.exportBadge; // Verdes
    } else if (op.startsWith('CO')) {
      return styles.consolidationBadge; // Violetas - Consolidación
    } else if (op.startsWith('CR')) {
      return styles.crossDockBadge; // Violetas - Cross Dock
    }
    
    return styles.operationBadge; // Clase por defecto
  };

  const handleGenerateQuote = (quotationId: string) => {
  if (window.confirm('¿Estás seguro de que deseas generar una cotización para este registro?')) {
    window.location.href = `/quotations/${quotationId}/generate-quote`;
  }
};

  // Función para mostrar el texto del tipo de operación
  const getOperationText = (operationType: string) => {
    const op = operationType?.toUpperCase() || '';
    
    if (op.startsWith('IM')) return 'Importación Marítima';
    if (op.startsWith('IA')) return 'Importación Aérea';
    if (op.startsWith('IT')) return 'Importación Terrestre';
    if (op.startsWith('EM')) return 'Exportación Marítima';
    if (op.startsWith('EA')) return 'Exportación Aérea';
    if (op.startsWith('ET')) return 'Exportación Terrestre';
    if (op.startsWith('CO')) return 'Consolidación';
    if (op.startsWith('CR')) return 'Courier';
    
    return operationType || 'N/A';
  };

  const handleCreateNew = () => {
    window.location.href = '/new-quotation';
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>⚠️</div>
        <h3>Error al cargar las cotizaciones</h3>
        <p>{error}</p>
        <button 
          onClick={loadQuotations}
          className={styles.retryButton}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1>Lista de Cotizaciones</h1>
            <p style={{ color: '#a0aec0' }}>Gestiona y revisa todas tus cotizaciones</p>
          </div>
          
          <div className={styles.stats}>
            <div className={styles.totalBadge}>
              Total: {total} cotizaciones
            </div>
            <button 
              onClick={handleCreateNew}
              className={styles.createButton}
            >
              + Nueva Cotización
            </button>
          </div>
        </div>
      </header>

      {quotations.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📋</div>
          <h3>No hay cotizaciones registradas</h3>
          <p>Crea tu primera cotización para comenzar</p>
          <button 
            onClick={handleCreateNew}
            className={styles.createButton}
            style={{ 
              background: '#01053b', 
              color: 'white',
              borderColor: '#01053b'
            }}
          >
            Crear Primera Cotización
          </button>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th>Código</th>
                <th>Referencia</th>
                <th>Tipo Operación</th>
                <th>Origen - Destino</th>
                <th>Mercadería</th>
                <th>Creado</th>
                 <th>Estado</th>
                <th>Validez</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {quotations.map((quotation) => (
                <tr key={quotation.id}>
                  <td className={styles.codeCell}>
                    {quotation.codigo_tracking}
                  </td>
                  <td className={styles.referenceCell}>
                    {quotation.referencia}
                  </td>
                  <td>
                    <span className={`${styles.operationBadge} ${getOperationBadgeClass(quotation.tipo_operacion)}`}>
                      {getOperationText(quotation.tipo_operacion)}
                      {quotation.tipo_carga && (
                      <div className={styles.cargoType}  style={{ color: 'white' }}>
                        
                        {quotation.tipo_carga} 
                        {quotation.tipo_contenedor && ` - ${quotation.tipo_contenedor}`}
                      </div>
                    )}
                    </span>
                  </td>
                  <td className={styles.routeCell}>
                    <div>
                      <span className={styles.origin}>{quotation.pol || 'N/A'}</span>
                      <span> → </span>
                      <span className={styles.destination}>{quotation.pod || 'N/A'}</span>
                    </div>
                    <div className={styles.incoterms}>
                      {quotation.incoterm_origen} / {quotation.incoterm_destino}
                    </div>
                  </td>
                  <td className={styles.merchandiseCell}>
                    <div>{quotation.mercaderia || 'No especificado'}</div>
                    {quotation.tipo_carga && (
                      <div className={styles.cargoType} style={{ color: 'green' }}>
                        {` Valor USD${quotation.valor_comercial}`} 
                      </div>
                    )}
                  </td>
                  <td className={styles.dateCell}>
                    {formatDate(quotation.created_at)}
                  </td>
                  <td>
                    <EstadoBadge estado={quotation.estado || 'creada'} />
                  </td>
                  <td>
                    <ValidezBadge quotation={quotation} />
                  </td>
                  <td>
  <div className={styles.actionsCell}>
    <button
      onClick={() => window.location.href = `/quotations/${quotation.id}`}
      className={styles.viewButton}
    >
      Ver
    </button>
    <button
      onClick={() => window.location.href = `/quotations/${quotation.id}/quote`}
      className={styles.quoteButton}
      title="Generar cotización"
    >
      Cotizar
    </button>
    <button
      onClick={() => {
        navigator.clipboard.writeText(quotation.codigo_tracking);
        // Puedes agregar una notificación aquí
      }}
      className={styles.copyButton}
      title="Copiar código"
    >
      📋
    </button>
  </div>
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {quotations.length > 0 && (
        <div className={styles.footer}>
          <button
            onClick={loadQuotations}
            className={styles.refreshButton}
            style={{
              background: 'linear-gradient(135deg, #01053b 0%, #667eea 100%)'
            }}
          >
            🔄 Actualizar Lista
          </button>
        </div>
      )}
    </div>
  );
};

export default QuotationList;