const express = require('express')
const router = express.Router()

const pool = require('../database')
const { isLoggedIn, isSuperRoot } = require('../lib/auth');

router.get('/gestionarUsuarios', isSuperRoot, isLoggedIn, async(req, res) => {
    const user = await pool.query('SELECT * FROM users')
    res.render('links/gestionarUsuarios',{users: user})
})

router.get('/editarPerfil/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params
    const user = await pool.query('SELECT * FROM users WHERE id = ?', [id])
    res.render('links/editarPerfil', { users: user[0] })
})

router.post('/editarPerfil/:id', isLoggedIn, async(req, res) => {
    const { id } = req.params
    const {username, password, email, cellphone_number} = req.body
    const updateProfile = {
        username,
        password,
        email,
        cellphone_number
    }
    await pool.query('UPDATE users set ? WHERE id = ?', [updateProfile, id])
    req.flash('success', 'Su perfil ha sido actualizado correctamente')
    res.redirect('/profile')
})


router.get('/add', isLoggedIn, (req, res) => {
    res.render('links/add')
})

router.post('/add', isLoggedIn, async (req, res) => {
    console.log(req.user.id);
    const { brand,
        plate,
        gearbox,
        url,
        model,
        transit_license,
        fuel, } = req.body;
        
    const newLink = {
        brand,
        plate,
        gearbox,
        url,
        model,
        transit_license,
        fuel,
        user_id : req.user.id
    }
    await pool.query('INSERT INTO links set ?', [newLink] )
    req.flash('success', 'Carro agregado exitosamente.')
    res.redirect('/links')
})

router.get('/ingresosCarro/:id', isLoggedIn, async(req, res) => {
    const totales = []
    var dict = {};
    const naturaleza = "Ingreso"
    const naturaleza2 = "Gastos"
    const { id } = req.params
    const link = await pool.query('SELECT * FROM historial WHERE id = ?', [id])
    const link2 = await pool.query('SELECT * FROM ingresos WHERE id = ? AND naturaleza = ?', [id, naturaleza2])
    const link4 = await pool.query('SELECT * FROM mantenimientos WHERE id = ? ', [id])
    const link5 = await pool.query('SELECT * FROM porcentaje WHERE id = ? ', [id])
    const links = await pool.query('SELECT * FROM links WHERE id = ?', [id])
    var totalIngresos = 0
    link.forEach(element => totalIngresos += parseInt(element.precio, 10))
    dict.ingreso = totalIngresos;
    totalIngresos = 0
    link2.forEach(element => totalIngresos += parseInt(element.valor, 10))
    dict.gasto = totalIngresos;
    totalIngresos = dict.ingreso - dict.gasto;  
    dict.ganacia = totalIngresos;
    link5.forEach(element => element.total = dict.ganacia*element.valor/100)
    totales.push(dict) 
    res.render('links/ingresosCarro', { links: link, links2: link2, link3: links[0], links4: link4, links5: link5 , totales: totales[0]})
})

router.post('/ingresosCarro/:id', isLoggedIn, async(req, res) => {
    const { id } = req.params
    const { title, description, url } = req.body
    const newLink = { 
        title, 
        description, 
        url
    }
    await pool.query('UPDATE links set ? WHERE id = ?', [newLink, id])
    req.flash('success', 'Datos de auto actualizados')
    res.redirect('/links')
})

router.get('/', isLoggedIn, async(req,res) => { 
    const Disponible = 'Disponible'
    if(req.user.username == 'root'){
        const links = await pool.query('SELECT * FROM links WHERE estado = ?', [Disponible])
        res.render('links/list', { links })
    } 
    else if (req.user.user_type == 'cliente') {
        const links = await pool.query('SELECT * FROM links WHERE estado = ?', [Disponible])
        res.render('links/listCustomer', { links })
    }
    else {
        const links = await pool.query('SELECT * FROM links WHERE estado = ? AND user_id = ?', [Disponible, req.user.id])
        res.render('links/listOwner', { links })
    }
})

router.get('/rentados', isLoggedIn, async(req,res) => { 
    const Disponible = 'Rentado'
    const links = await pool.query('SELECT * FROM rentados')
    res.render('links/rentados', { links })
})

router.get('/devuelto/:id', isSuperRoot, async (req, res) => {
    const Rentado = 'Disponible'
    const { id } = req.params
    await pool.query('UPDATE links SET estado = ? WHERE id = ?', [Rentado, id])
    await pool.query('DELETE FROM rentados WHERE id = ?', [id])
    req.flash('success', 'Auto devuelto exitosamente')
    res.redirect('/links')
})


router.get('/edit/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params 
    const links = await pool.query('SELECT * FROM links WHERE id = ?', [id])
    res.render('links/edit', { link: links[0] })
})

router.post('/edit/:id', isLoggedIn, async(req, res) => {
    const { id } = req.params
    const { brand,
        plate,
        gearbox,
        url,
        model,
        transit_license,
        fuel, } = req.body;
        
    const newLink = {
        brand,
        plate,
        gearbox,
        url,
        model,
        transit_license,
        fuel
    }
    await pool.query('UPDATE links set ? WHERE id = ?', [newLink, id])
    req.flash('success', 'Datos de auto actualizados')
    res.redirect('/links')
})

router.get('/editGastos/:id_ingreso', isSuperRoot, async (req, res) => {
    const { id_ingreso } = req.params 
    const links = await pool.query('SELECT * FROM ingresos WHERE id_ingreso = ?', [id_ingreso])
    
    res.render('links/editGastos', { link: links[0] })
})

router.post('/editGastos/:id_ingreso', isSuperRoot, async(req, res) => {
    const { id_ingreso } = req.params
    const naturaleza = 'Gastos'
    const { id, title, url ,description, ingreso, valor, fecha } = req.body
    const newLink = {
        id,
        title,
        url,
        description,
        ingreso,
        valor,
        fecha,
        naturaleza
    }
    
    await pool.query('UPDATE ingresos set ? WHERE id_ingreso = ?', [newLink, id_ingreso])
    req.flash('success', 'Gasto Editado con exito')
    res.redirect('../ingresosCarro/' + id)
})

router.get('/rentadoPor/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params 
    const links = await pool.query('SELECT * FROM rentados WHERE id = ?', [id])
    res.render('links/rentadoPor', { link: links[0] })
})

router.post('/rentadoPor/:id', isLoggedIn, async(req, res) => {
    const { id } = req.params
    const { title, url, description, nombre, cc, telefono, fechaInicio, fechaFin, precio} = req.body
    const newLink = { 
        title,
        url,
        description,
        nombre,
        cc,
        telefono,
        fechaInicio,
        fechaFin,
        precio
    }
    res.redirect('/links/rentados')
})

router.get('/detalles/:id_historial', isLoggedIn, async (req, res) => {
    const { id_historial } = req.params 
    const links = await pool.query('SELECT * FROM historial WHERE id_historial = ?', [id_historial])
    console.log(links)
    const links2 = await pool.query('SELECT * FROM links WHERE id = ?', [links[0].id])
    res.render('links/detalles', { link: links[0], link2: links2[0] })
})

router.post('/detalles/:id_historial', isLoggedIn, async(req, res) => {
    const { id_historial } = req.params
    const { title, url, description, nombre, cc, telefono, fechaInicio, fechaFin, precio} = req.body
    const newLink = { 
        title,
        url,
        description,
        nombre,
        cc,
        telefono,
        fechaInicio,
        fechaFin,
        precio
    }
    res.redirect('/links/rentados')
})

router.get('/formularioRenta/:id', isSuperRoot, async (req, res) => {
    const { id } = req.params 
    const links = await pool.query('SELECT * FROM links WHERE id = ?', [id])
    res.render('links/formularioRenta', { link: links[0] })
})

router.post('/formularioRenta/:id', isSuperRoot, async(req, res) => {
    const Rentado = 'Rentado'
    const { id } = req.params
    const { title, url, description, nombre, cc, telefono, fechaInicio, fechaFin, precio} = req.body
    const newLink = { 
        title,
        url,
        description, 
        nombre,
        cc,
        telefono,
        fechaInicio,
        fechaFin,
        precio,
        id
    }
    const ingreso = "Renta"
    const naturaleza = "Ingreso"
    const valor = precio
    const ingresoNuevo = {
        id,
        title,
        url,
        description,
        ingreso,
        valor,
        naturaleza
    }
    
    await pool.query('UPDATE links SET estado = ? WHERE id = ?', [Rentado, id] )
    await pool.query('INSERT INTO rentados set ?', [newLink] )
    await pool.query('INSERT INTO ingresos set ?', [ingresoNuevo] )
    const links = await pool.query('SELECT id_ingreso FROM ingresos ORDER BY ID DESC LIMIT 1 ')
    const id_ingreso = links[0].id_ingreso
    const nuevoRegistro = { 
        id,
        nombre,
        cc,
        telefono,
        fechaInicio,
        fechaFin,
        precio,
        id_ingreso
    }
    await pool.query('INSERT INTO historial set ?', [nuevoRegistro] )

    req.flash('success', 'Rentado correctamente')
    res.redirect('/links/rentados')
})

router.get('/gastos/:id', isSuperRoot, async (req, res) => {
    const { id } = req.params 
    const links = await pool.query('SELECT * FROM links WHERE id = ?', [id])
    res.render('links/gastos', { link: links[0] })
})

router.post('/gastos/:id', isSuperRoot, async(req, res) => {
    const Rentado = 'Rentado'
    const naturaleza = 'Gastos'
    const { id } = req.params
    const { title, url, description, ingreso, valor} = req.body
    const nuevoGasto = {
        id,
        title,
        url,
        description,
        ingreso,
        valor,
        naturaleza
    }
    await pool.query('INSERT INTO ingresos set ?', [nuevoGasto] )

    req.flash('success', 'Gasto ingresado correctamente')
    res.redirect('../ingresosCarro/' + id)
})

router.get('/gastoRealizado/:id_mantenimiento', isSuperRoot, async (req, res) => {
    const { id_mantenimiento } = req.params 
    const links2 = await pool.query('SELECT * FROM mantenimientos WHERE id_mantenimiento = ?', [id_mantenimiento])
    const link = await pool.query('SELECT id FROM mantenimientos WHERE id_mantenimiento = ?', [id_mantenimiento])
    const links = await pool.query('SELECT * FROM links WHERE id = ?', [link[0].id])
    res.render('links/gastoRealizado', { link: links[0], link2: links2[0] })
    await pool.query('DELETE FROM mantenimientos WHERE id_mantenimiento = ? ', [id_mantenimiento])

})

router.get('/mantenimiento/:id', isSuperRoot, async (req, res) => { 
    const { id } = req.params 
    const links = await pool.query('SELECT * FROM links WHERE id = ?', [id])
    res.render('links/mantenimiento', { link: links[0] })
})

router.post('/mantenimiento/:id', isSuperRoot, async(req, res) => {
   
    const { id } = req.params
    const { nombre, fecha, km} = req.body
    const nuevoMantenimiento = {
        id,
        nombre, 
        fecha,
        km
    }
    await pool.query('INSERT INTO mantenimientos set ?', [nuevoMantenimiento] )
    req.flash('success', 'Mantenimiento ingresado correctamente')
    res.redirect('../ingresosCarro/' + id)
})

router.get('/porcentaje/:id', isSuperRoot, async (req, res) => { 
    const { id } = req.params 
    const links = await pool.query('SELECT * FROM links WHERE id = ?', [id])
    res.render('links/porcentaje', { link: links[0] })
})

router.post('/porcentaje/:id', isSuperRoot, async(req, res) => {
   
    const { id } = req.params
    const { descripcion, valor } = req.body
    const nuevoPorcentaje = {
        id,
        descripcion,
        valor
    }
    await pool.query('INSERT INTO porcentaje SET ?', [nuevoPorcentaje])
    req.flash('success', 'Porcentaje ingresado correctamente')
    res.redirect('../ingresosCarro/' + id)
})

router.get('/editPorcentaje/:id_porcentaje', isSuperRoot, async (req, res) => {
    const { id_porcentaje } = req.params 
    const links = await pool.query('SELECT * FROM porcentaje WHERE id_porcentaje = ?', [id_porcentaje])
    const links2 = await pool.query('SELECT * FROM links WHERE id = ?', [links[0].id])
    
    res.render('links/editPorcentaje', { link: links[0], link2: links2[0] })
})

router.post('/editPorcentaje/:id_porcentaje', isSuperRoot, async(req, res) => {
    const { id_porcentaje } = req.params
    const { id, descripcion, valor } = req.body
    const newPorcentaje = {
        descripcion,
        valor
    }
    
    await pool.query('UPDATE porcentaje set ? WHERE id_porcentaje = ?', [newPorcentaje, id_porcentaje])
    req.flash('success', 'Porcentaje Editado con exito')
    res.redirect('../ingresosCarro/' + id)
})

module.exports = router