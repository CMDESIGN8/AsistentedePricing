# app/models/quotation.py
import uuid
from sqlalchemy import Column, String, Integer, Boolean, Numeric, DateTime, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base

class Quotation(Base):
    __tablename__ = "quotations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    referencia = Column(String, nullable=False)
    tipo_operacion = Column(String(2), nullable=False)
    codigo_tracking = Column(String)

    incoterm_origen = Column(String)
    incoterm_destino = Column(String)
    lugar_pickup = Column(String, default="N/A")
    lugar_delivery = Column(String, default="N/A")

    pol = Column(String)
    transbordo_1 = Column(String)
    transbordo_2 = Column(String)
    transbordo_3 = Column(String)
    pod = Column(String)

    linea_maritima = Column(String)
    aerolinea = Column(String)
    transit_time = Column(Integer)
    dias_libres_origen = Column(Integer)  # <-- AÑADE ESTE CAMPO
    dias_libres_destino = Column(Integer)

    mercaderia = Column(String)
    bultos = Column(Integer, default=1)
    peso_bruto_kg = Column(Float)  # Cambié de Numeric a Float
    toneladas = Column(Float)
    volumen_cbm = Column(Float)
    chargeable_weight = Column(Float)

    largo = Column(Float)
    ancho = Column(Float)
    alto = Column(Float)
    valor_comercial = Column(Float)

    tipo_carga = Column(String)
    tipo_contenedor = Column(String)
    cantidad_contenedores = Column(Integer, default=1)
    cantidad_bls = Column(Integer)

    apto_alimento = Column(Boolean, default=False)
    tiene_hielo_seco = Column(Boolean, default=False)
    validez_dias = Column(Integer)

    created_at = Column(DateTime(timezone=True), server_default=func.now())