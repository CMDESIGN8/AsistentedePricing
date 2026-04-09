from sqlalchemy import Column, Integer, String, Float, Boolean
from app.database import Base

class Quotation(Base):
    __tablename__ = "quotations"

    id = Column(Integer, primary_key=True, index=True)

    # Tracking
    codigo_tracking = Column(String, unique=True, index=True)
    
    # Sección 1
    referencia = Column(String, nullable=False)
    tipo_operacion = Column(String, nullable=False)

    # Sección 2
    pol = Column(String, nullable=True)
    transbordo_1 = Column(String, nullable=True)
    transbordo_2 = Column(String, nullable=True)
    transbordo_3 = Column(String, nullable=True)
    pod = Column(String, nullable=True)
    linea_maritima = Column(String, nullable=True)
    aerolinea = Column(String, nullable=True)
    transit_time = Column(Float, nullable=True)
    dias_libres_destino = Column(Float, nullable=True)

    # Sección 3
    mercaderia = Column(String, nullable=True)
    bultos = Column(Integer, default=1)
    peso_bruto_kg = Column(Float, nullable=True)
    toneladas = Column(Float, nullable=True)
    volumen_cbm = Column(Float, nullable=True)
    chargeable_weight = Column(Float, nullable=True)
    largo = Column(Float, nullable=True)
    ancho = Column(Float, nullable=True)
    alto = Column(Float, nullable=True)
    valor_comercial = Column(Float, nullable=True)

    # Sección 4
    tipo_carga = Column(String, nullable=True)
    tipo_contenedor = Column(String, nullable=True)
    cantidad_contenedores = Column(Integer, default=1)
    cantidad_bls = Column(Integer, default=1)
    apto_alimento = Column(Boolean, default=False)
    tiene_hielo_seco = Column(Boolean, default=False)
    validez_dias = Column(Integer, nullable=True)
