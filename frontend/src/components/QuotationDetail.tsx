import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuotationById, type QuotationItem } from '../api/quotation';
import styles from '../styles/QuotationDetail.module.css';

const QuotationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState<QuotationItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadQuotation(id);
    } else {
      setError('ID de cotización no proporcionado');
      setLoading(false);
    }
  }, [id]);

  const loadQuotation = async (quotationId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Cargando cotización con ID:', quotationId);
      
      const response = await getQuotationById(quotationId);
      
      if (response && response.data) {
        setQuotation(response.data);
        console.log('Cotización cargada:', response.data);
      } else {
        setError('No se encontraron datos para esta cotización');
      }
    } catch (err: any) {
      console.error('Error detallado:', err);
      setError(`Error al cargar la cotización: ${err.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  // Función para calcular validez basada en tu modelo
  const calcularValidez = (fechaCreacion: string, validezDias?: number) => {
    if (!validezDias) validezDias = 30; // Por defecto 30 días
    
    const fechaCreacionDate = new Date(fechaCreacion);
    const fechaVencimiento = new Date(fechaCreacionDate.getTime() + validezDias * 24 * 60 * 60 * 1000);
    const hoy = new Date();
    
    const diffTiempo = fechaVencimiento.getTime() - hoy.getTime();
    const diasRestantes = Math.ceil(diffTiempo / (1000 * 60 * 60 * 24));
    
    if (diasRestantes <= 0) {
      return { estado: 'vencida', color: '#94a3b8', dias_restantes: 0 };
    } else if (diasRestantes <= 3) {
      return { estado: 'por vencer', color: '#d29922', dias_restantes: diasRestantes };
    } else {
      return { estado: 'válida', color: '#06d6a0', dias_restantes: diasRestantes };
    }
  };

  // Función para obtener color según estado
  const getEstadoColor = (estado?: string) => {
    if (!estado) return '#ff6b35'; // Por defecto naranja (creada)
    
    const estadoLower = estado.toLowerCase();
    if (estadoLower.includes('creada') || estadoLower.includes('creado')) {
      return '#ff6b35'; // Naranja
    } else if (estadoLower.includes('enviada') || estadoLower.includes('enviado')) {
      return '#3a86ff'; // Azul
    } else if (estadoLower.includes('aceptada') || estadoLower.includes('aceptado')) {
      return '#06d6a0'; // Verde
    } else if (estadoLower.includes('rechazada') || estadoLower.includes('rechazado')) {
      return '#94a3b8'; // Gris
    }
    return '#ff6b35'; // Por defecto naranja
  };

  // Función para cambiar estado
  const handleCambiarEstado = async (nuevoEstado: 'enviada' | 'aceptada' | 'rechazada') => {
    if (!quotation) return;
    
    try {
      const confirmacion = window.confirm(
        `¿Estás seguro de cambiar el estado a "${nuevoEstado.toUpperCase()}"?`
      );
      
      if (!confirmacion) return;
      
      // Agregar endpoint para actualizar estado en tu backend
      const response = await fetch(`http://localhost:8000/quotations/${quotation.id}/estado`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estado: nuevoEstado,
          fecha_envio: nuevoEstado === 'enviada' ? new Date().toISOString() : quotation.fecha_envio,
          fecha_respuesta: (nuevoEstado === 'aceptada' || nuevoEstado === 'rechazada') 
            ? new Date().toISOString() 
            : quotation.fecha_respuesta
        }),
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar el estado');
      }
      
      // Recargar la cotización
      await loadQuotation(quotation.id);
      
      alert(`Estado cambiado a "${nuevoEstado}" correctamente`);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar el estado');
    }
  };

  // Función para formatear fecha
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={styles.detailContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Cargando cotización...</p>
        </div>
        <button 
          onClick={() => navigate(-1)}
          className={styles.backButton}
        >
          ← Volver
        </button>
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className={styles.detailContainer}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>❌</div>
          <h3>Error</h3>
          <p>{error || 'Cotización no encontrada'}</p>
          <p>ID de búsqueda: {id || 'No proporcionado'}</p>
        </div>
        <button 
          onClick={() => navigate(-1)}
          className={styles.backButton}
        >
          ← Volver al listado
        </button>
      </div>
    );
  }

  // Calcular información de validez
  const validezInfo = calcularValidez(quotation.created_at, quotation.validez_dias);
  const estadoColor = getEstadoColor(quotation.estado || 'creada');
  
  // Calcular fecha de vencimiento
  const fechaVencimiento = new Date(
    new Date(quotation.created_at).getTime() + (quotation.validez_dias || 30) * 24 * 60 * 60 * 1000
  );

  return (
    <div className={styles.detailContainer}>
      <button 
        onClick={() => navigate(-1)}
        className={styles.backButton}
      >
        ← Volver
      </button>

      <div className={styles.quotationCard}>
        {/* Encabezado con estados */}
        <div className={styles.headerSection}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <h1>{quotation.referencia || 'Sin referencia'}</h1>
              <span className={styles.trackingCode}>
                Código: {quotation.codigo_tracking || 'N/A'}
              </span>
            </div>
            <div className={styles.headerRight}>
              <div className={styles.estadosContainer}>
                {/* Badge de estado principal */}
                <div 
                  className={styles.estadoPrincipal}
                  style={{ 
                    backgroundColor: `${estadoColor}20`,
                    color: estadoColor,
                    borderColor: estadoColor
                  }}
                >
                  {quotation.estado?.toUpperCase() || 'CREADA'}
                </div>
                
                {/* Badge de validez */}
                <div 
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
                </div>
                
                <span className={styles.operationType}>
                  {quotation.tipo_operacion || 'N/A'}
                </span>
              </div>
              
              <div className={styles.fechasContainer}>
                <p className={styles.creationDate}>
                  <strong>Creada:</strong> {formatDate(quotation.created_at)}
                </p>
                {quotation.updated_at && (
                  <p className={styles.fechaActualizacion}>
                    <strong>Actualizada:</strong> {formatDate(quotation.updated_at)}
                  </p>
                )}
                <p className={styles.fechaVencimiento}>
                  <strong>Vence:</strong> {fechaVencimiento.toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Secciones de información */}
        <div className={styles.sectionsGrid}>
          
          {/* Sección 1: Ruta y Logística */}
          <div className={styles.section}>
            <h3>Ruta y Logística</h3>
            <div className={styles.fieldGroup}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>POL (Origen):</span>
                <span className={styles.fieldValue}>{quotation.pol || <span className={styles.emptyData}>N/A</span>}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>POD (Destino):</span>
                <span className={styles.fieldValue}>{quotation.pod || <span className={styles.emptyData}>N/A</span>}</span>
              </div>
              {quotation.transbordo_1 && (
                <div className={styles.transbordosList}>
                  <span className={styles.fieldLabel}>Transbordos:</span>
                  <ul>
                    <li className={styles.transbordoItem}>{quotation.transbordo_1}</li>
                    {quotation.transbordo_2 && <li className={styles.transbordoItem}>{quotation.transbordo_2}</li>}
                    {quotation.transbordo_3 && <li className={styles.transbordoItem}>{quotation.transbordo_3}</li>}
                  </ul>
                </div>
              )}
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Lugar Pickup:</span>
                <span className={styles.fieldValue}>{quotation.lugar_pickup || <span className={styles.emptyData}>N/A</span>}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Lugar Delivery:</span>
                <span className={styles.fieldValue}>{quotation.lugar_delivery || <span className={styles.emptyData}>N/A</span>}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Transit Time:</span>
                <span className={styles.fieldValue}>
                  {quotation.transit_time ? `${quotation.transit_time} días` : <span className={styles.emptyData}>N/A</span>}
                </span>
              </div>
            </div>
          </div>

          {/* Sección 2: Términos Comerciales */}
          <div className={styles.section}>
            <h3>Términos Comerciales</h3>
            <div className={styles.fieldGroup}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Incoterm Origen:</span>
                <span className={styles.fieldValue}>{quotation.incoterm_origen || <span className={styles.emptyData}>N/A</span>}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Incoterm Destino:</span>
                <span className={styles.fieldValue}>{quotation.incoterm_destino || <span className={styles.emptyData}>N/A</span>}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Días Libres Origen:</span>
                <span className={styles.fieldValue}>
                  {quotation.dias_libres_origen || quotation.dias_libres_origen === 0 ? 
                    `${quotation.dias_libres_origen} días` : 
                    <span className={styles.emptyData}>N/A</span>}
                </span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Días Libres Destino:</span>
                <span className={styles.fieldValue}>
                  {quotation.dias_libres_destino || quotation.dias_libres_destino === 0 ? 
                    `${quotation.dias_libres_destino} días` : 
                    <span className={styles.emptyData}>N/A</span>}
                </span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Valor Comercial:</span>
                <span className={styles.fieldValue}>
                  {quotation.valor_comercial ? 
                    `$${quotation.valor_comercial.toLocaleString()}` : 
                    <span className={styles.emptyData}>N/A</span>}
                </span>
              </div>
            </div>
          </div>

          {/* Sección 3: Transporte */}
          <div className={styles.section}>
            <h3>Transporte</h3>
            <div className={styles.fieldGroup}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Línea Marítima:</span>
                <span className={styles.fieldValue}>{quotation.linea_maritima || <span className={styles.emptyData}>N/A</span>}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Aerolínea:</span>
                <span className={styles.fieldValue}>{quotation.aerolinea || <span className={styles.emptyData}>N/A</span>}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Tipo de Carga:</span>
                <span className={styles.fieldValue}>{quotation.tipo_carga || <span className={styles.emptyData}>N/A</span>}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Tipo de Contenedor:</span>
                <span className={styles.fieldValue}>{quotation.tipo_contenedor || <span className={styles.emptyData}>N/A</span>}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Cant. Contenedores:</span>
                <span className={styles.fieldValue}>{quotation.cantidad_contenedores || 1}</span>
              </div>
            </div>
          </div>

          {/* Sección 4: Mercadería */}
          <div className={styles.section}>
            <h3>Mercadería</h3>
            <div className={styles.fieldGroup}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Descripción:</span>
                <span className={styles.fieldValue}>{quotation.mercaderia || <span className={styles.emptyData}>No especificado</span>}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Bultos:</span>
                <span className={styles.fieldValue}>{quotation.bultos || 1}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Peso Bruto:</span>
                <span className={styles.fieldValue}>
                  {quotation.peso_bruto_kg ? `${quotation.peso_bruto_kg} kg` : <span className={styles.emptyData}>N/A</span>}
                </span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Toneladas:</span>
                <span className={styles.fieldValue}>
                  {quotation.toneladas ? `${quotation.toneladas} t` : <span className={styles.emptyData}>N/A</span>}
                </span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Volumen (CBM):</span>
                <span className={styles.fieldValue}>
                  {quotation.volumen_cbm ? `${quotation.volumen_cbm} m³` : <span className={styles.emptyData}>N/A</span>}
                </span>
              </div>
            </div>
          </div>

          {/* Sección 5: Dimensiones */}
          <div className={styles.section}>
            <h3>Dimensiones</h3>
            <div className={styles.fieldGroup}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Chargeable Weight:</span>
                <span className={styles.fieldValue}>
                  {quotation.chargeable_weight ? `${quotation.chargeable_weight} kg` : <span className={styles.emptyData}>N/A</span>}
                </span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Largo:</span>
                <span className={styles.fieldValue}>
                  {quotation.largo ? `${quotation.largo} cm` : <span className={styles.emptyData}>N/A</span>}
                </span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Ancho:</span>
                <span className={styles.fieldValue}>
                  {quotation.ancho ? `${quotation.ancho} cm` : <span className={styles.emptyData}>N/A</span>}
                </span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Alto:</span>
                <span className={styles.fieldValue}>
                  {quotation.alto ? `${quotation.alto} cm` : <span className={styles.emptyData}>N/A</span>}
                </span>
              </div>
            </div>
          </div>

          {/* Sección 6: Documentación y Especificaciones */}
          <div className={styles.section}>
            <h3>Documentación y Especificaciones</h3>
            <div className={styles.fieldGroup}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Cant. B/L / AWB:</span>
                <span className={styles.fieldValue}>{quotation.cantidad_bls || 1}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Validez:</span>
                <span className={styles.fieldValue}>
                  {quotation.validez_dias ? `${quotation.validez_dias} días` : <span className={styles.emptyData}>N/A</span>}
                </span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Especificaciones:</span>
                <div className={styles.fieldValue}>
                  {quotation.apto_alimento && (
                    <span className={styles.specsBadge}>Apto Alimento</span>
                  )}
                  {quotation.tiene_hielo_seco && (
                    <span className={`${styles.specsBadge} ${styles.specsBadgeWarning}`}>Hielo Seco</span>
                  )}
                  {!quotation.apto_alimento && !quotation.tiene_hielo_seco && (
                    <span className={styles.emptyData}>Ninguna</span>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Acciones con estados */}
        <div className={styles.footer}>
          <div className={styles.accionesEstado}>
            <button
              onClick={() => handleCambiarEstado('enviada')}
              className={`${styles.estadoButton} ${styles.enviarButton}`}
              disabled={quotation.estado !== 'creada' && quotation.estado !== undefined}
            >
              📤 Enviar Cotización
            </button>
            <button
              onClick={() => handleCambiarEstado('aceptada')}
              className={`${styles.estadoButton} ${styles.aceptarButton}`}
              disabled={quotation.estado !== 'enviada'}
            >
              ✅ Marcar como Aceptada
            </button>
            <button
              onClick={() => handleCambiarEstado('rechazada')}
              className={`${styles.estadoButton} ${styles.rechazarButton}`}
              disabled={quotation.estado !== 'enviada'}
            >
              ❌ Marcar como Rechazada
            </button>
          </div>
          
          <div className={styles.accionesUtiles}>
            <button
              onClick={() => {
                navigator.clipboard.writeText(quotation.codigo_tracking || '');
                alert('Código copiado al portapapeles');
              }}
              className={`${styles.actionButton} ${styles.copyButton}`}
            >
              📋 Copiar código
            </button>
            <button
              onClick={() => window.print()}
              className={`${styles.actionButton} ${styles.printButton}`}
            >
              🖨️ Imprimir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationDetail;