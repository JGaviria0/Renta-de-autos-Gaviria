CREATE DATABASE dabase_links;

USE dabase_links; 

CREATE TABLE users(
    id INT(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(16) NOT NULL, 
    password VARCHAR(60) NOT NULL,
    document_type VARCHAR(100) NOT NULL, 
    first_name VARCHAR(100) NOT NULL, 
    last_name VARCHAR(100) NOT NULL, 
    email VARCHAR(100) NOT NULL, 
    identity_document VARCHAR(100) NOT NULL, 
    cellphone_number VARCHAR(100) NOT NULL, 
    user_type VARCHAR(100) NOT NULL,
    birth_date timestamp NOT NULL,
    price int(22) NOT NULL
);

ALTER TABLE users 
    ADD price int(22) NOT NULL;

-- ALTER TABLE users
--     MODIFY id INT(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT = 2; 

-- DESCRIBE users; 

CREATE TABLE links (
    id INT(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    brand VARCHAR(100) NOT NULL,
    plate VARCHAR(100) NOT NULL,
    gearbox VARCHAR(100) NOT NULL,
    url VARCHAR(600) NOT NULL,
    model VARCHAR(100) NOT NULL,
    transit_license VARCHAR(100) NOT NULL,
    fuel VARCHAR(100) NOT NULL,
    user_id INT(11),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id),
    created_at timestamp NOT NULL DEFAULT current_timestamp,
    estado VARCHAR(50) NOT NULL DEFAULT 'Disponible'
);
    -- title VARCHAR(150) NOT NULL,
    -- url VARCHAR(250) NOT NULL,
    -- description TEXT, 

-- ALTER TABLE links

-- ALTER TABLE links 
--     MODIFY id INT(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2; 

-- DESCRIBE links; 

CREATE TABLE rentados (
    id_rent INT(11) PRIMARY KEY NOT NULL AUTO_INCREMENT,
    id_user INT(11),
    CONSTRAINT fk_user2 FOREIGN KEY (id_user) REFERENCES users(id),
    id_car INT(11) NOT NULL,
    CONSTRAINT fk_car2 FOREIGN KEY (id_car) REFERENCES links(id),
    document_type VARCHAR(150) NOT NULL,
    document_number VARCHAR(150) NOT NULL,
    firstname VARCHAR(150) NOT NULL,
    lastname VARCHAR(150) NOT NULL,
    birth_date timestamp NOT NULL,
    phone_number VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    transit_license VARCHAR(150) NOT NULL,
    start_date timestamp NOT NULL,
    end_date timestamp NOT NULL,
    deposit_slip VARCHAR(150),
    totalprice INT(20) NOT NULL,
    status VARCHAR(150) NOT NULL,
    payment_date timestamp
);

-- ALTER TABLE rentados 
--     ADD PRIMARY KEY(id),
--     MODIFY id INT(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

-- ALTER TABLE rentados 
--     ADD id_carro INT(11) NOT NULL; 



CREATE TABLE ingresos (
    id INT(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    id_car INT(11) NOT NULL ,
    CONSTRAINT fk_car FOREIGN KEY (id_car) REFERENCES links(id),
    ingreso VARCHAR(150) NOT NULL,
    valor VARCHAR(150) NOT NULL,
    fecha timestamp NOT NULL DEFAULT current_timestamp,
    naturaleza VARCHAR(150) NOT NULL
);

-- ALTER TABLE ingresos 
--     ADD PRIMARY KEY(id),
--     MODIFY id INT(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

-- ALTER TABLE ingresos 
--     ADD naturaleza VARCHAR(150) NOT NULL;
    
-- ALTER TABLE ingresos 
--     MODIFY fecha timestamp NOT NULL DEFAULT current_timestamp;


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
    ADD id INT(11) NOT NULL;


CREATE TABLE porcentaje (
    id_porcentaje INT(11) NOT NULL,
    id INT(11) NOT NULL,
    descripcion VARCHAR(150) NOT NULL,
    valor INT(100) NOT NULL
);

ALTER TABLE porcentaje
    ADD PRIMARY KEY(id_porcentaje),
    MODIFY id_porcentaje INT(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
