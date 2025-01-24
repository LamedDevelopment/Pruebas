-- Tabla: Usuario
CREATE TABLE Usuario (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo_electronico VARCHAR(150) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('Administrador', 'Auxiliar de Registro'))
);

-- Tabla: Comerciante
CREATE TABLE Comerciante (
    id_comerciante SERIAL PRIMARY KEY,
    nombre_razon_social VARCHAR(150) NOT NULL,
    municipio VARCHAR(100) NOT NULL,
    telefono VARCHAR(15),
    correo_electronico VARCHAR(150),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    estado VARCHAR(10) NOT NULL CHECK (estado IN ('Activo', 'Inactivo')),
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usuario_actualizacion INTEGER NOT NULL REFERENCES Usuario(id_usuario)
);

-- Tabla: Establecimiento
CREATE TABLE Establecimiento (
    id_establecimiento SERIAL PRIMARY KEY,
    nombre_establecimiento VARCHAR(150) NOT NULL,
    ingresos NUMERIC(15, 2) NOT NULL,
    numero_empleados INTEGER NOT NULL,
    id_comerciante INTEGER NOT NULL REFERENCES Comerciante(id_comerciante) ON DELETE CASCADE,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usuario_actualizacion INTEGER NOT NULL REFERENCES Usuario(id_usuario)
);

CREATE TABLE municipios (
    id SERIAL PRIMARY KEY,
    departamento VARCHAR(100) NOT NULL,
    provincia VARCHAR(100) NOT NULL,
    cod_muni VARCHAR(10) NOT NULL UNIQUE,
    nombre_muni VARCHAR(100) NOT NULL,
    nombre VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_cod_muni ON municipios(cod_muni);



