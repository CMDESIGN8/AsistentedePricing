import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuotationById, type QuotationItem, updateQuotation } from '../../api/quotation';
import styles from '../../styles/GenerateQuote.module.css';
import {
  SECCIONES_POR_INCOTERM,
  SECCIONES_POR_OPERACION,
  CONCEPTOS_POR_SECCION,
  OPERACION_TIPOS
} from '../../constants/constants';


const GenerateQuotePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState<QuotationItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para los costos por concepto
  const [costos, setCostos] = useState<Record<string, Record<string, number>>>({});
  
  // Secciones habilitadas
  const [seccionesHabilitadas, setSeccionesHabilitadas] = useState<string[]>([]);
  
  // Estados para cálculos
  const [calculos, setCalculos] = useState({
    peso_cargable: 0,
    total_costos: 0,
    margen_ganancia: 20,
    precio_final: 0,
    cif_value: 0,
  });

  useEffect(() => {
    loadQuotationData();
  }, [id]);

  useEffect(() => {
    if (quotation) {
      calcularSeccionesHabilitadas();
      calcularPesoCargable();
      inicializarCostos();
    }
  }, [quotation]);

  useEffect(() => {
    calcularTotales();
  }, [costos]);

  const loadQuotationData = async () => {
    try {
      setLoading(true);
      const data = await getQuotationById(id!);
      setQuotation(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar la cotización');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Función para determinar el tipo de operación base (primeros 2 caracteres)
  const getTipoOperacionBase = (): string => {
    if (!quotation?.tipo_operacion) return '';
    return quotation.tipo_operacion.substring(0, 2).toUpperCase();
  };

  // Calcular secciones habilitadas basadas en Incoterm y tipo de operación
  const calcularSeccionesHabilitadas = () => {
    if (!quotation) return;
    
    const incoterm = quotation.incoterm_origen?.toUpperCase() || '';
    const tipoOperacionBase = getTipoOperacionBase();
    
    let secciones: string[] = [];
    
    // Obtener secciones por Incoterm
    if (incoterm in SECCIONES_POR_INCOTERM) {
      secciones = [...SECCIONES_POR_INCOTERM[incoterm]];
    }
    
    // Filtrar por tipo de operación
    if (tipoOperacionBase in SECCIONES_POR_OPERACION) {
      const seccionesOperacion = SECCIONES_POR_OPERACION[tipoOperacionBase];
      // Intersectar las secciones (solo las que están en ambos)
      secciones = secciones.filter(seccion => 
        seccionesOperacion.includes(seccion)
      );
    }
    
    setSeccionesHabilitadas(secciones);
  };

  // Función para calcular peso cargable
  const calcularPesoCargable = () => {
    if (!quotation) return;
    
    const pesoBruto = quotation.peso_bruto_kg || 0;
    const volumen = quotation.volumen_cbm || 0;
    const tipoOperacionBase = getTipoOperacionBase();
    
    let pesoCargable = pesoBruto;
    
    if (OPERACION_TIPOS.AEREO.includes(tipoOperacionBase)) {
      // Aéreo: peso volumétrico (volumen * 167)
      const pesoVolumetrico = volumen * 167;
      pesoCargable = Math.max(pesoBruto, pesoVolumetrico);
    } else if (OPERACION_TIPOS.MARITIMO.includes(tipoOperacionBase)) {
      // Marítimo: peso bruto o volumen * 1000 (lo que sea mayor)
      const pesoVolumetricoMaritimo = volumen * 1000;
      pesoCargable = Math.max(pesoBruto, pesoVolumetricoMaritimo);
    }
    
    setCalculos(prev => ({
      ...prev,
      peso_cargable: pesoCargable
    }));
  };

  // Inicializar estructura de costos basada en secciones habilitadas
  const inicializarCostos = () => {
    const nuevosCostos: Record<string, Record<string, number>> = {};
    
    seccionesHabilitadas.forEach(seccion => {
      if (CONCEPTOS_POR_SECCION[seccion]) {
        nuevosCostos[seccion] = {};
        CONCEPTOS_POR_SECCION[seccion].forEach(concepto => {
          nuevosCostos[seccion][concepto] = 0;
        });
      }
    });
    
    setCostos(nuevosCostos);
  };

  // Calcular totales
  const calcularTotales = () => {
    let total = 0;
    
    Object.values(costos).forEach(seccion => {
      Object.values(seccion).forEach(valor => {
        total += valor;
      });
    });
    
    // Calcular CIF Value (Flete + Seguro + Valor Comercial)
    const valorComercial = quotation?.valor_comercial || 0;
    const flete = calcularTotalSeccion('FLETE INTERNACIONAL') + 
                  calcularTotalSeccion('FLETE INTERNACIONAL AÉREO');
    const seguro = calcularTotalSeccion('SEGURO INTERNACIONAL');
    const cifValue = valorComercial + flete + seguro;
    
    const margen = calculos.margen_ganancia / 100;
    const precioFinal = total * (1 + margen);
    
    setCalculos(prev => ({
      ...prev,
      total_costos: total,
      precio_final: precioFinal,
      cif_value: cifValue
    }));
  };

  // Calcular total por sección
  const calcularTotalSeccion = (seccion: string): number => {
    if (!costos[seccion]) return 0;
    return Object.values(costos[seccion]).reduce((sum, val) => sum + val, 0);
  };

  // Calcular total por concepto específico
  const calcularTotalConcepto = (seccion: string, concepto: string): number => {
    return costos[seccion]?.[concepto] || 0;
  };

  // Manejar cambio en costo
  const handleCostoChange = (seccion: string, concepto: string, value: string) => {
    const valorNumerico = parseFloat(value) || 0;
    
    setCostos(prev => ({
      ...prev,
      [seccion]: {
        ...prev[seccion],
        [concepto]: valorNumerico
      }
    }));
  };

  // Funciones de cálculo automático
  const calcularSeguroAutomático = () => {
    if (!quotation?.valor_comercial) return;
    
    const valorSeguro = quotation.valor_comercial * 0.02; // 2% del valor comercial
    handleCostoChange('SEGURO INTERNACIONAL', 'Prima de Seguro Internacional', valorSeguro.toString());
  };

  const calcularFleteMaritimo = () => {
    if (!quotation) return;
    
    let flete = 0;
    const tipoCarga = quotation.tipo_carga;
    
    if (tipoCarga === 'CONTENEDOR') {
      // Tarifa por contenedor
      const tarifaPorContenedor = 1500; // USD
      const cantidadContenedores = quotation.cantidad_contenedores || 1;
      flete = cantidadContenedores * tarifaPorContenedor;
    } else if (tipoCarga === 'LCL') {
      // Tarifa por W/M (Weight/Measurement)
      const pesoVolumetrico = (quotation.volumen_cbm || 0) * 1000;
      const pesoReal = quotation.peso_bruto_kg || 0;
      const pesoCobrable = Math.max(pesoVolumetrico, pesoReal);
      const tarifaPorW = 100; // USD por tonelada W
      const tarifaPorM = 120; // USD por CBM M
      flete = Math.max(pesoCobrable * tarifaPorW / 1000, (quotation.volumen_cbm || 0) * tarifaPorM);
    }
    
    handleCostoChange('FLETE INTERNACIONAL', 'FLETE INTERNACIONAL Marítimo (CONTENEDOR)', flete.toString());
  };

  const calcularFleteAereo = () => {
    const pesoCargable = calculos.peso_cargable;
    const tarifaPorKg = 5; // USD por kg
    const flete = pesoCargable * tarifaPorKg;
    
    handleCostoChange('FLETE INTERNACIONAL AÉREO', 'FLETE INTERNACIONAL Aéreo (por Cargable)', flete.toString());
  };

  // Verificar si una sección está habilitada
  const isSeccionHabilitada = (seccion: string): boolean => {
    return seccionesHabilitadas.includes(seccion);
  };

  const handleGuardarCotizacion = async () => {
    try {
      if (!quotation) return;
      
      const cotizacionCompleta = {
        ...quotation,
        costos_detallados: costos,
        calculos,
        fecha_cotizacion: new Date().toISOString(),
        estado: 'COTIZADO',
        total_cotizacion: calculos.precio_final
      };
      
      await updateQuotation(quotation.id, cotizacionCompleta);
      alert('Cotización guardada exitosamente');
      navigate(`/quotations/${quotation.id}`);
      
    } catch (err) {
      alert('Error al guardar la cotización');
      console.error(err);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Cargando...</div>;
  }

  if (error || !quotation) {
    return <div className={styles.error}>{error || 'Cotización no encontrada'}</div>;
  }

  const incoterm = quotation.incoterm_origen?.toUpperCase() || '';
  const tipoOperacionBase = getTipoOperacionBase();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button 
          onClick={() => navigate(`/quotations/${quotation.id}`)}
          className={styles.backButton}
        >
          ← Volver
        </button>
        <div>
          <h1>Generar Cotización</h1>
          <div className={styles.headerSubtitle}>
            <span>Código: {quotation.codigo_tracking}</span>
            <span>|</span>
            <span>Incoterm: {incoterm}</span>
            <span>|</span>
            <span>Operación: {quotation.tipo_operacion}</span>
          </div>
        </div>
      </header>

      <div className={styles.content}>
        {/* Información Detallada de la Operación */}
<div className={styles.infoCard}>
  <h2 className={styles.sectionTitle}>Información Detallada de la Operación</h2>
  
  <div className={styles.compactGrid}>
    {/* Columna 1: Ruta e Incoterm */}
    <div className={styles.compactColumn}>
      <div className={styles.compactRow}>
        <div className={styles.compactItem}>
          <span className={styles.compactLabel}>Ruta Completa:</span>
          <span className={styles.compactValue}>
            {quotation.pol || 'N/A'} → {quotation.pod || 'N/A'}
          </span>
        </div>
        <div className={styles.compactItem}>
          <span className={styles.compactLabel}>Incoterm:</span>
          <span className={`${styles.compactValue} ${styles.badge}`}>
            {quotation.incoterm_origen || 'N/A'}
          </span>
        </div>
      </div>
      
      <div className={styles.compactRow}>
        <div className={styles.compactItem}>
          <span className={styles.compactLabel}>Línea/Aerolínea:</span>
          <span className={styles.compactValue}>
            {quotation.linea_maritima || quotation.aerolinea || 'No especificada'}
          </span>
        </div>
        <div className={styles.compactItem}>
          <span className={styles.compactLabel}>Días Libres Destino:</span>
          <span className={styles.compactValue}>
            {quotation.dias_libres_destino ? `${quotation.dias_libres_destino} días` : 'N/A'}
          </span>
        </div>
      </div>
      
      <div className={styles.compactRow}>
        <div className={styles.compactItem}>
          <span className={styles.compactLabel}>Tiempo de Tránsito:</span>
          <span className={styles.compactValue}>
            {quotation.transit_time ? `${quotation.transit_time} días` : 'N/A'}
          </span>
        </div>
        <div className={styles.compactItem}>
          <span className={styles.compactLabel}>Validez Oferta:</span>
          <span className={styles.compactValue}>
            {quotation.validez_dias ? `${quotation.validez_dias} días` : 'N/A'}
          </span>
        </div>
      </div>
    </div>
    
    {/* Columna 2: Mercadería y Peso */}
    <div className={styles.compactColumn}>
      <div className={styles.compactRow}>
        <div className={styles.compactItem}>
          <span className={styles.compactLabel}>Mercadería:</span>
          <span className={`${styles.compactValue} ${styles.highlight}`}>
            {quotation.mercaderia || 'No especificada'}
          </span>
        </div>
        <div className={styles.compactItem}>
          <span className={styles.compactLabel}>Peso Bruto:</span>
          <div className={styles.compactValue}>
            <span>{quotation.peso_bruto_kg ? `${quotation.peso_bruto_kg.toLocaleString()} kg` : 'N/A'}</span>
            {quotation.toneladas && (
              <span className={styles.subValue}>({quotation.toneladas.toFixed(2)} TN)</span>
            )}
          </div>
        </div>
      </div>
      
      <div className={styles.compactRow}>
        <div className={styles.compactItem}>
          <span className={styles.compactLabel}>Tipo de Carga:</span>
          <span className={`${styles.compactValue} ${styles.badge}`}>
            {quotation.tipo_carga || 'N/A'}
          </span>
        </div>
        <div className={styles.compactItem}>
          <span className={styles.compactLabel}>Volumen:</span>
          <span className={styles.compactValue}>
            {quotation.volumen_cbm ? `${quotation.volumen_cbm.toLocaleString()} CBM` : 'N/A'}
          </span>
        </div>
      </div>
      
      <div className={styles.compactRow}>
        {quotation.tipo_contenedor && (
          <div className={styles.compactItem}>
            <span className={styles.compactLabel}>Tipo Contenedor:</span>
            <span className={styles.compactValue}>
              {quotation.tipo_contenedor}
              {quotation.cantidad_contenedores && (
                <span className={styles.quantityBadge}> x{quotation.cantidad_contenedores}</span>
              )}
            </span>
          </div>
        )}
        <div className={styles.compactItem}>
          <span className={styles.compactLabel}>Bultos:</span>
          <span className={styles.compactValue}>
            {quotation.bultos || 1}
            {quotation.cantidad_bls && quotation.cantidad_bls > 1 && (
              <span className={styles.subValue}> ({quotation.cantidad_bls} BLS)</span>
            )}
          </span>
        </div>
      </div>
    </div>
    
    {/* Columna 3: Valores y Requisitos */}
    <div className={styles.compactColumn}>
      <div className={styles.compactRow}>
        <div className={styles.compactItem}>
          <span className={styles.compactLabel}>Valor Comercial:</span>
          <span className={`${styles.compactValue} ${styles.currency}`}>
            USD {quotation.valor_comercial?.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }) || '0.00'}
          </span>
        </div>
        <div className={styles.compactItem}>
          <span className={styles.compactLabel}>Peso Cargable:</span>
          <div className={styles.compactValue}>
            <span className={styles.calculatedValue}>
              {calculos.peso_cargable.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })} kg
            </span>
            {quotation.chargeable_weight && (
              <span className={styles.subValue}>(Manual: {quotation.chargeable_weight} kg)</span>
            )}
          </div>
        </div>
      </div>
      
      <div className={styles.compactRow}>
        <div className={styles.compactItem}>
          <span className={styles.compactLabel}>CIF Value:</span>
          <span className={`${styles.compactValue} ${styles.currency}`}>
            USD {calculos.cif_value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </span>
        </div>
        <div className={styles.compactItem}>
          <span className={styles.compactLabel}>Requisitos Especiales:</span>
          <div className={styles.compactValue}>
            <div className={styles.requirementBadges}>
              {quotation.apto_alimento && (
                <span className={styles.requirementBadge}>🍎 Apto Alimento</span>
              )}
              {quotation.tiene_hielo_seco && (
                <span className={styles.requirementBadge}>❄️ Hielo Seco</span>
              )}
              {!quotation.apto_alimento && !quotation.tiene_hielo_seco && (
                <span className={styles.noRequirements}>Ninguno</span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className={styles.compactRow}>
        <div className={styles.compactItem}>
          <span className={styles.compactLabel}>Lugar de Pickup:</span>
          <span className={`${styles.compactValue} ${styles.highlight}`}>
            {quotation.lugar_pickup || 'N/A'}
          </span>
        </div>
        <div className={styles.compactItem}>
          <span className={styles.compactLabel}>Lugar de Delivery:</span>
          <span className={`${styles.compactValue} ${styles.highlight}`}>
            {quotation.lugar_delivery || 'N/A'}
          </span>
        </div>
      </div>
    </div>
  </div>
</div>

        {/* Secciones de costos */}
        <div className={styles.costSections}>
          {Object.keys(CONCEPTOS_POR_SECCION).map(seccion => {
            const habilitada = isSeccionHabilitada(seccion);
            
            return (
              <div 
                key={seccion} 
                className={`${styles.section} ${!habilitada ? styles.disabledSection : ''}`}
              >
                <div className={styles.sectionHeader}>
                  <h3>{seccion}</h3>
                  {habilitada && (
                    <span className={styles.sectionTotal}>
                      Total: USD {calcularTotalSeccion(seccion).toFixed(2)}
                    </span>
                  )}
                </div>
                
                {habilitada ? (
                  <div className={styles.conceptosGrid}>
                    {CONCEPTOS_POR_SECCION[seccion].map(concepto => (
                      <div key={concepto} className={styles.conceptoItem}>
                        <label>{concepto}</label>
                        <div className={styles.conceptoInputGroup}>
                          <input
                            type="number"
                            value={calcularTotalConcepto(seccion, concepto) || 0}
                            onChange={(e) => handleCostoChange(seccion, concepto, e.target.value)}
                            placeholder="0.00"
                            step="0.01"
                          />
                          <span className={styles.currencySymbol}>USD</span>
                        </div>
                        
                        {/* Botones de cálculo automático específicos */}
                        {seccion === 'SEGURO INTERNACIONAL' && concepto === 'Prima de Seguro Internacional' && (
                          <button 
                            onClick={calcularSeguroAutomático}
                            className={styles.autoCalcButton}
                          >
                            Calcular 2%
                          </button>
                        )}
                        
                        {seccion === 'FLETE INTERNACIONAL' && concepto === 'FLETE INTERNACIONAL Marítimo (CONTENEDOR)' && (
                          <button 
                            onClick={calcularFleteMaritimo}
                            className={styles.autoCalcButton}
                          >
                            Calcular Flete
                          </button>
                        )}
                        
                        {seccion === 'FLETE INTERNACIONAL AÉREO' && concepto === 'FLETE INTERNACIONAL Aéreo (por Cargable)' && (
                          <button 
                            onClick={calcularFleteAereo}
                            className={styles.autoCalcButton}
                          >
                            Calcular por Kg
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.sectionDisabled}>
                    <p>Esta sección no está habilitada para {incoterm} - {tipoOperacionBase}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Resumen */}
        <div className={styles.summaryCard}>
          <h2>Resumen de Cotización</h2>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <label>Total Costos:</label>
              <span className={styles.totalCost}>USD {calculos.total_costos.toFixed(2)}</span>
            </div>
            
            <div className={styles.summaryItem}>
              <label>Margen de Ganancia:</label>
              <div className={styles.marginControl}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={calculos.margen_ganancia}
                  onChange={(e) => setCalculos(prev => ({
                    ...prev,
                    margen_ganancia: parseFloat(e.target.value)
                  }))}
                  className={styles.marginSlider}
                />
                <span className={styles.marginValue}>{calculos.margen_ganancia}%</span>
              </div>
            </div>
            
            <div className={styles.summaryItem}>
              <label>Precio Final al Cliente:</label>
              <span className={styles.finalPrice}>USD {calculos.precio_final.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className={styles.actions}>
          <button
            onClick={handleGuardarCotizacion}
            className={styles.saveButton}
          >
            💾 Guardar Cotización
          </button>
          
          <button
            onClick={() => {/* Lógica para PDF */}}
            className={styles.pdfButton}
          >
            📄 Generar PDF
          </button>
          
          <button
            onClick={() => navigate(`/quotations/${quotation.id}`)}
            className={styles.cancelButton}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerateQuotePage;