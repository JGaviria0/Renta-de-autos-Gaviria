# RENTA DE AUTOS GAVIRIA, PROYECTO BASE DE DATOS UNIVERSIDAD TECNOLÓGICA DE PEREIRA

------------

https://renta-de-autos-gaviria.onrender.com/

Este proyecto fue construido para la materia de base de datos del profesor **Carlos Alberto Ocampo Sepúlveda**, en la cual se creó una aplicación para la renta de autos, la cual además del manejo *MySQL* como motor de base de datos, también utiliza la tecnología de *Nodejs*, y otros módulos que mejoran la seguridad y la experiencia al manejo de la aplicación.

Esta aplicación fue construida gracias al siguiente video de YouTube:

`FAZT` : <https://youtu.be/qJ5R9WTW0_E?t=1>

**¡Mucho ❤️ Para Fazt!**

------------

### Pre-requisitos 📋

Para poder ejecutar la aplicación necesitaremos dos aplicaciones muy importantes, **XAMPP** el cual es quien nos descarga MySQL y una interfaz gráfica para un fácil uso, también necesitaremos **Nodejs**. La instalación de estos es muy fácil, solo es ir a la pagina principal, y descargar la versión LTS para nuestro respectivo sistema operativo, y hacer la respectiva instalación.

`XAMPP` : <https://www.apachefriends.org/es/index.html>

`Nodejs` : <https://nodejs.org/es/>

Tambien añadir estas variables de entorno.

``` js
module.exports = {

    database: {
        host: '',
        user: '',
        password : '',
        database: ''
    }
}
```

------------


### Instalación de la base de datos 🔧


Clonamos el repositorio donde queramos.

```
git clone https://github.com/JGaviria0/Renta-de-autos-Gaviria.git
```
O solo descarga el zip y lo descomprime. 

A continuación abrimos el **XAMPP** y le damos *Start* en **MySQL** y **Apache**, si se hizo correctamente, los nombres se marcarán en verde.

[![imagen-2020-11-13-002002.png](https://i.postimg.cc/Dz0pKKQb/imagen-2020-11-13-002002.png)](https://postimg.cc/Y4cz1Zsp)

Procedemos a darle en el botón de administrar, y nos enviara a un localhost en nuestro navegador predeterminado, aquí veremos una interfaz gráfica, buscaremos la opción de **importar**. 

[![importar.png](https://i.postimg.cc/y8dyDyDM/importar.png)](https://postimg.cc/qzP3YnXw)

Veremos que nos pide seleccionar una archivo, seleccionamos el que esta en el proyecto, dentro de la carpeta **database**, el archivo **db.sql**.

[![tempsnip2.png](https://i.postimg.cc/gkv3rBct/tempsnip2.png)](https://postimg.cc/9rQDnb7y)

Solo resta darle continuar.

------------

### Instalación de los módulos  🔧

Debemos iniciar una terminal en donde tenemos el proyecto, luego de estar ahí, ejecutamos el simple comando:

```
npm i
```
Esto instalara todos los móulos necesarios. 

------------

## Ejecución ⚙️ 

Luego de seguir todos los pasos descritos, estamos listos para ejecutar el programa con el siguiente comando.

```
npm run dev
``` 

Esto nos mostrara por consola si la base de datos está funcionando correctamente, y el puerto en el que está corriendo, como último paso, vamos a nuestro navegador de preferencia y escribimos el siguiente enlace. 
```
localhost:3000
```
Recordemos que 3000 es el puerto donde está corriendo la aplicación.

keys.js
``` js

module.exports = {

    database: {
        host: 'localhost',
        user: 'root',
        passport: '',
        database: 'dabase_links'
    }
}
```

------------

## Justo despues de abrir la aplicación

Debemos crear un usuario el cual tiene todos los permisos, la única condición es que el *Username* sea **root** y la contraseña y el nombre pueden ser los que quieran. 

```
Username: root
```


------------

## Dudas

Si te quedo la inquietud o no te funciona la ejecución del proyecto, puedes escribirme a mi correo personal, o a mi instagram. 

<https://www.instagram.com/jgaviria0/>

<j.gaviria@utp.edu.co>



---
⌨️ con ❤️ por [JGaviria0](https://github.com/JGaviria0)
