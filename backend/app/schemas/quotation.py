from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class QuotationCreate(BaseModel):
    referencia: str
    tipo_operacion: str
    pol: Optional[str] = None
    transbordo_1: Optional[str] = None
    transbordo_2: Optional[str] = None
    transbordo_3: Optional[str] = None
    pod: Optional[str] = None
    linea_maritima: Optional[str] = None
    aerolinea: Optional[str] = None
    transit_time: Optional[float] = None
    dias_libres_destino: Optional[float] = None
    mercaderia: Optional[str] = None
    bultos: Optional[int] = 1
    peso_bruto_kg: Optional[float] = None
    toneladas: Optional[float] = None
    volumen_cbm: Optional[float] = None
    chargeable_weight: Optional[float] = None
    largo: Optional[float] = None
    ancho: Optional[float] = None
    alto: Optional[float] = None
    valor_comercial: Optional[float] = None
    tipo_carga: Optional[str] = None
    tipo_contenedor: Optional[str] = None
    cantidad_contenedores: Optional[int] = 1
    cantidad_bls: Optional[int] = 1
    apto_alimento: Optional[bool] = False
    tiene_hielo_seco: Optional[bool] = False
    validez_dias: Optional[int] = None
    
    # Añade estos campos que están en tu modelo pero faltan en el schema:
    incoterm_origen: Optional[str] = None
    incoterm_destino: Optional[str] = None
    lugar_pickup: Optional[str] = "N/A"
    lugar_delivery: Optional[str] = "N/A"

     # Nuevos campos
    incoterm_origen: Optional[str] = None
    incoterm_destino: Optional[str] = None
    lugar_pickup: Optional[str] = "N/A"
    lugar_delivery: Optional[str] = "N/A"
    dias_libres_origen: Optional[int] = None
    
    class Config:
        # Esto permite que campos extra no causen error
        extra = "ignore"


class QuotationResponse(BaseModel):
    id: str
    codigo_tracking: str
    referencia: str
    tipo_operacion: str
    pol: Optional[str]
    pod: Optional[str]
    incoterm_origen: Optional[str]
    incoterm_destino: Optional[str]
    mercaderia: Optional[str]
    bultos: Optional[int]
    peso_bruto_kg: Optional[float]
    volumen_cbm: Optional[float]
    tipo_carga: Optional[str]
    tipo_contenedor: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        orm_mode = True
        from_attributes = True