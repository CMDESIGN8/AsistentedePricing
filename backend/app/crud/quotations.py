from sqlalchemy.orm import Session
from app import models, schemas
from typing import List, Optional

def create_cotizacion(db: Session, cotizacion: schemas.CotizacionCreate):
    db_cotizacion = models.Cotizacion(**cotizacion.dict())
    db.add(db_cotizacion)
    db.commit()
    db.refresh(db_cotizacion)
    return db_cotizacion

def get_cotizacion(db: Session, cotizacion_id: int):
    return db.query(models.Cotizacion).filter(models.Cotizacion.id == cotizacion_id).first()

def get_cotizacion_by_referencia(db: Session, referencia: str):
    return db.query(models.Cotizacion).filter(models.Cotizacion.referencia == referencia).first()

def get_cotizaciones(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Cotizacion).offset(skip).limit(limit).all()

def update_cotizacion(db: Session, cotizacion_id: int, cotizacion: schemas.CotizacionUpdate):
    db_cotizacion = get_cotizacion(db, cotizacion_id)
    if db_cotizacion:
        update_data = cotizacion.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_cotizacion, key, value)
        db.commit()
        db.refresh(db_cotizacion)
    return db_cotizacion

def delete_cotizacion(db: Session, cotizacion_id: int):
    db_cotizacion = get_cotizacion(db, cotizacion_id)
    if db_cotizacion:
        db.delete(db_cotizacion)
        db.commit()
    return db_cotizacion