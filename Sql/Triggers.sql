CREATE OR REPLACE FUNCTION actualizar_auditoria()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    -- Asegúrate de que la variable de usuario se defina en tu sistema o aplicación
    NEW.usuario_actualizacion = COALESCE(CURRENT_SETTING('app.current_user')::INTEGER, 1);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auditoria_comerciante
BEFORE INSERT OR UPDATE ON Comerciante
FOR EACH ROW
EXECUTE FUNCTION actualizar_auditoria();

CREATE TRIGGER trg_auditoria_establecimiento
BEFORE INSERT OR UPDATE ON Establecimiento
FOR EACH ROW
EXECUTE FUNCTION actualizar_auditoria();



