CREATE DATABASE dabase_links;

USE dabase_links; 

CREATE TABLE users(
    id INT(11) NOT NULL,
    username VARCHAR(16) NOT NULL, 
    password VARCHAR(60) NOT NULL,
    fullname VARCHAR(100) NOT NULL
);

ALTER TABLE users 
    ADD PRIMARY KEY(id); 

ALTER TABLE users
    MODIFY id INT(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT = 2; 

DESCRIBE users; 


CREATE TABLE links (
    id INT(11) NOT NULL,
    title VARCHAR(150) NOT NULL,
    url VARCHAR(250) NOT NULL,
    description TEXT, 
    user_id INT(11),
    created_at timestamp NOT NULL DEFAULT current_timestamp,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)
);

ALTER TABLE links
    ADD PRIMARY KEY (id); 

ALTER TABLE links 
    MODIFY id INT(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2; 

DESCRIBE links; 

ALTER TABLE links
  ADD estado VARCHAR(50) NOT NULL DEFAULT 'Disponible';


CREATE TABLE rentados (
    id INT(11) NOT NULL,
    title VARCHAR(150) NOT NULL,
    url VARCHAR(250) NOT NULL,
    description TEXT, 
    nombre VARCHAR(150) NOT NULL,
    cc VARCHAR(15) NOT NULL,
    telefono VARCHAR(11) NOT NULL,
    fechaInicio date NOT NULL,
    fechaFin date NOT NULL,
    precio INT(10) NOT NULL 
);

ALTER TABLE rentados 
    ADD PRIMARY KEY(id),
    MODIFY id INT(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

ALTER TABLE rentados 
    ADD id_carro INT(11) NOT NULL; 



CREATE TABLE ingresos (
    id_ingreso INT(11) NOT NULL,
    id INT(11) NOT NULL,
    title VARCHAR(150) NOT NULL,
    url VARCHAR(250) NOT NULL,
    description TEXT,
    ingreso VARCHAR(150) NOT NULL,
    valor VARCHAR(150) NOT NULL,
    fecha date NOT NULL
);

ALTER TABLE ingresos 
    ADD PRIMARY KEY(id_ingreso),
    MODIFY id_ingreso INT(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

ALTER TABLE ingresos 
    ADD naturaleza VARCHAR(150) NOT NULL;
    
ALTER TABLE ingresos 
    MODIFY fecha timestamp NOT NULL DEFAULT current_timestamp;


CREATE TABLE mantenimientos (
    id_mantenimiento INT(11) NOT NULL,
    id INT(11) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    fecha date NOT NULL,
    km INT(17) NOT NULL
);

ALTER TABLE mantenimientos 
    ADD PRIMARY KEY(id_mantenimiento),
    MODIFY id_mantenimiento INT(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;


CREATE TABLE historial (
    id_historial INT(11) NOT NULL,
    id INT(11) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    cc VARCHAR(15) NOT NULL,
    telefono VARCHAR(11) NOT NULL,
    fechaInicio date NOT NULL,
    fechaFin date NOT NULL,
    precio INT(10) NOT NULL
);

ALTER TABLE historial
    ADD PRIMARY KEY(id_historial),
    MODIFY id_historial INT(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

ALTER TABLE historial
    ADD id_ingreso INT(11) NOT NULL;


CREATE TABLE porcentaje (
    id_porcentaje INT(11) NOT NULL,
    id INT(11) NOT NULL,
    descripcion VARCHAR(150) NOT NULL,
    valor INT(100) NOT NULL
);

ALTER TABLE porcentaje
    ADD PRIMARY KEY(id_porcentaje),
    MODIFY id_porcentaje INT(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
