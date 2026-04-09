from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.quotation import QuotationCreate
from app.models.quotation import Quotation
from app.database import get_db
import logging
from datetime import datetime, timedelta

router = APIRouter(prefix="/quotations", tags=["quotations"])

logger = logging.getLogger(__name__)

@router.post("/")
async def create_quotation(quotation: QuotationCreate, db: Session = Depends(get_db)):
    try:
        # Debug: Ver qué datos llegan
        logger.info(f"Datos recibidos del frontend: {quotation.dict()}")
        print("=== DATOS RECIBIDOS DEL FRONTEND ===")
        for key, value in quotation.dict().items():
            print(f"{key}: {value} (type: {type(value)})")
        
        # Buscar la última cotización para generar código secuencial
        last = db.query(Quotation).order_by(Quotation.created_at.desc()).first()
        
        # Generar código de tracking secuencial
        codigo_tracking = "TKR-000001"
        if last and last.codigo_tracking:
            import re
            match = re.search(r'(\d+)$', last.codigo_tracking)
            if match:
                next_num = int(match.group(1)) + 1
                codigo_tracking = f"TKR-{next_num:06d}"
        
        # Crear nueva cotización con TODOS los campos
        # Convierte el schema Pydantic a dict y añade el código tracking
        quotation_data = quotation.dict()
        quotation_data['codigo_tracking'] = codigo_tracking
        
        # Crear instancia del modelo con todos los campos
        db_quotation = Quotation(**quotation_data)
        
        db.add(db_quotation)
        db.commit()
        db.refresh(db_quotation)
        
        return {
            "success": True,
            "message": "Cotización creada exitosamente",
            "data": {
                "id": str(db_quotation.id),
                "codigo_tracking": db_quotation.codigo_tracking,
                "referencia": db_quotation.referencia,
                "tipo_operacion": db_quotation.tipo_operacion,
                "pol": db_quotation.pol,
                "pod": db_quotation.pod
            }
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error creando cotización: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")
    
@router.get("/")
async def get_quotations(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Obtener todas las cotizaciones con paginación"""
    try:
        quotations = db.query(Quotation).order_by(Quotation.created_at.desc()).offset(skip).limit(limit).all()
        total = db.query(Quotation).count()
        
        return {
            "success": True,
            "data": quotations,
            "total": total,
            "skip": skip,
            "limit": limit
        }
    except Exception as e:
        logger.error(f"Error obteniendo cotizaciones: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router.get("/{quotation_id}")
async def get_quotation(
    quotation_id: str,
    db: Session = Depends(get_db)
):
    """Obtener una cotización específica por ID"""
    try:
        quotation = db.query(Quotation).filter(Quotation.id == quotation_id).first()
        
        if not quotation:
            raise HTTPException(status_code=404, detail="Cotización no encontrada")
        
        return {
            "success": True,
            "data": quotation
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error obteniendo cotización: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")
# Agrega este endpoint a tu quotations.py
@router.patch("/{quotation_id}/estado")
async def update_quotation_status(
    quotation_id: str,
    estado_data: dict,
    db: Session = Depends(get_db)
):
    """Actualizar el estado de una cotización"""
    try:
        # Buscar la cotización
        quotation = db.query(Quotation).filter(Quotation.id == quotation_id).first()
        
        if not quotation:
            raise HTTPException(status_code=404, detail="Cotización no encontrada")
        
        # Actualizar el estado
        nuevo_estado = estado_data.get("estado")
        if nuevo_estado:
            quotation.estado = nuevo_estado
        
        # Actualizar fechas según el estado
        if nuevo_estado == "enviada" and estado_data.get("fecha_envio"):
            quotation.fecha_envio = estado_data["fecha_envio"]
        elif nuevo_estado in ["aceptada", "rechazada"] and estado_data.get("fecha_respuesta"):
            quotation.fecha_respuesta = estado_data["fecha_respuesta"]
        
        quotation.updated_at = datetime.now()
        
        db.commit()
        db.refresh(quotation)
        
        return {
            "success": True,
            "message": "Estado actualizado correctamente",
            "data": quotation
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error actualizando estado: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")
        
    