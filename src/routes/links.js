const express = require('express');
const { NULL } = require('mysql/lib/protocol/constants/types');
const router = express.Router()

const pool = require('../database')
const { isLoggedIn, isSuperRoot, isNotLoggedIn } = require('../lib/auth');

router.get('/reservarAdmin/:id', isSuperRoot, isLoggedIn, async(req, res) => {
    const { id } = req.params
    const link = await pool.query('SELECT * FROM links WHERE id = ?', [id] )
    const busydays = await pool.query('SELECT * FROM rentados WHERE id_car = ?', [id])
    let datesDisabled = []
    busydays.forEach(element => {
        const init = new Date(element.start_date);
        const end = new Date(element.end_date);
        const day = 1000 * 60 * 60 * 24;
        for (let i = init; i <= end; i = new Date(i.getTime() + day)) {
            datesDisabled.push(`${i.getFullYear()}-${i.getMonth()+1}-${i.getDate()}`);
        }
    });
    const datepickerScript = `
        <script>
        $(document).ready(function(){
            $("#datepicker").datepicker({
            format: 'yyyy-mm-dd',
            datesDisabled: [${"'" + datesDisabled.join("', '") + "'"}]
            });
            $("#datepicker2").datepicker({
            format: 'yyyy-mm-dd',
            datesDisabled: [${"'" + datesDisabled.join("', '") + "'"}]
            });
        });
        </script>
    `;
    res.render('links/reservarAdmin',{links: link[0], datepickerScript})
})

router.post('/reservarAdmin/:id', isSuperRoot, async(req, res) => {
    const reservado = 'Comprobado'
    
    const { id } = req.params
    const car = await pool.query('SELECT * FROM links WHERE id = ?', [id])
    const {
        document_type,
        firstname,
        birth_date,
        email,
        start_date,
        document_number,
        lastname,
        phone_number,
        transit_license,
        end_date
    } = req.body

    const firstDate = new Date(start_date);
    const lastDate = new Date(end_date);

    const days = lastDate.getTime() - firstDate.getTime() 
    const totalPrice = Math.round(days/ (1000*60*60*24)) * car[0].price; 
    const today = new Date(Date.now);
    const newLink = { 
        id_car: id,
        document_type,
        firstname,
        birth_date,
        email,
        start_date,
        document_number,
        lastname,
        phone_number,
        transit_license,
        end_date, 
        status: reservado,
        price: totalPrice,
        deposit_slip: "Reserva por Admin",
        payment_date: today
    }
    
    
    await pool.query('INSERT INTO rentados set ?', [newLink] )
    req.flash('success', 'Reservado correctamente')
    res.redirect('/links/rentados')
})

router.get('/reservarCustomer/:id', isLoggedIn, async(req, res) => {
    const { id } = req.params
    const link = await pool.query('SELECT * FROM links WHERE id = ?', [id] )
    const busydays = await pool.query('SELECT * FROM rentados WHERE id_car = ?', [id])
    let datesDisabled = []
    busydays.forEach(element => {
        const init = new Date(element.start_date);
        const end = new Date(element.end_date);
        const day = 1000 * 60 * 60 * 24;
        for (let i = init; i <= end; i = new Date(i.getTime() + day)) {
            datesDisabled.push(`${i.getFullYear()}-${i.getMonth()+1}-${i.getDate()}`);
        }
    });
    console.log(datesDisabled);
    const datepickerScript = `
        <script>
        $(document).ready(function(){
            $("#datepicker").datepicker({
            format: 'yyyy-mm-dd',
            datesDisabled: [${"'" + datesDisabled.join("', '") + "'"}]
            });
            $("#datepicker2").datepicker({
            format: 'yyyy-mm-dd',
            datesDisabled: [${"'" + datesDisabled.join("', '") + "'"}]
            });
        });
        </script>
    `;
    res.render('links/reservarCustomer',{links: link[0], datepickerScript})
})

router.post('/reservarCustomer/:id', isLoggedIn, async(req, res) => {
    const reservado = 'Reservado'
    
    const { id } = req.params
    const car = await pool.query('SELECT * FROM links WHERE id = ?', [id])
    const {
        start_date,
        end_date
    } = req.body

    const id_user = req.user.id;

    const firstDate = new Date(start_date);
    const lastDate = new Date(end_date);

    const days = lastDate.getTime() - firstDate.getTime() 
    const totalPrice = Math.round(days/ (1000*60*60*24)) * car[0].price; 

    const value = await pool.query('SELECT * FROM users WHERE id = ?', [id_user]);

    const {
        document_type,
        first_name,
        birth_date,
        email,
        identity_document,
        last_name,
        cellphone_number,
        transit_license
    } = value[0]; 

    const newLink = { 
        id_car: id,
        id_user,
        document_type,
        firstname: first_name,
        birth_date,
        email,
        start_date,
        document_number: identity_document,
        lastname: last_name,
        phone_number: cellphone_number,
        transit_license,
        end_date, 
        status: reservado,
        price: totalPrice
    }
    
    await pool.query('INSERT INTO rentados set ?', [newLink] )
    req.flash('success', 'Vehículo reservado correctamente')
    res.redirect('/links/gestionarReservasCustomer')
})

router.get('/gestionarUsuarios', isSuperRoot, isLoggedIn, async(req, res) => {
    const user = await pool.query('SELECT * FROM users')
    res.render('links/gestionarUsuarios',{users: user})
})

router.get('/gestionarReservasAdmin', isSuperRoot, isLoggedIn, async(req, res) => {
    const renta = await pool.query('SELECT * FROM rentados d INNER JOIN links e ON d.id_car = e.id WHERE status = "Comprobado" or status = "Reservado"')
    await renta.forEach(element => {
        if(element.deposit_slip && element.status == "Reservado") element.reservado = true;
        if(element.status == "Comprobado") element.comprobado = true;
        if(element.status == "Cancelado") element.cancelado = true;
        if(element.status == "Rentado") element.rentado = true;
        if(element.status == "Finalizado") element.finalizado = true;
    });
    res.render('links/gestionarReservasAdmin', {rentas: renta})
})

router.get('/gestionarReservasCustomer', isLoggedIn, async(req, res) => {
    const renta = await pool.query('SELECT * FROM rentados d INNER JOIN links e ON d.id_car = e.id  WHERE d.id_user = ? and (d.status = "Reservado" or d.status = "Pendiente" or d.status = "Rentado")', [req.user.id])
    await renta.forEach(element => {
        if(element.status == "Reservado") element.reservado = true;
        if(element.status == "Comprobado") element.comprobado = true;
        if(element.status == "Cancelado") element.cancelado = true;
        if(element.status == "Rentado") element.rentado = true;
        if(element.status == "Finalizado") element.finalizado = true;
        if(element.status == "Reservado" && element.deposit_slip) element.pendiente = true;
    });
    res.render('links/gestionarReservasCustomer',{rentas: renta})
})

router.get('/pagarDeposito/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params
    const renta = await pool.query("SELECT * FROM rentados WHERE id_rent = ?", [id])
    res.render('links/pagarDeposito', {id_rent: id, renta: renta[0]})
})

router.post('/pagarDeposito/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params
    const { deposit_slip, payment_date, price } = req.body;
    const newPayment = {
        deposit_slip,
        payment_date,
        price
    }
    await pool.query('UPDATE rentados set ? WHERE id_rent = ?', [newPayment, id] )
    req.flash('success', 'El depósito fue pagado exitosamente.')
    res.redirect('/links/gestionarReservasCustomer')
})

router.get('/verRentas', isLoggedIn, async(req, res) => {
    const renta = await pool.query('SELECT * FROM rentados d INNER JOIN links e ON d.id_car = e.id  WHERE d.id_user = ? and (d.status = "Cancelado" or d.status = "Finalizado")', [req.user.id])
    res.render('links/verRentas', {rentas: renta})
})

router.get('/generarFactura/', isSuperRoot, isLoggedIn, async(req, res) => {
    const renta = await pool.query('SELECT * FROM rentados d INNER JOIN links e ON d.id_car = e.id  WHERE d.status = "Rentado" or d.status = "Finalizado"')
    res.render('links/generarFactura', {rentados: renta})
})

router.get('/factura/:id_rent', isSuperRoot, isLoggedIn, async(req, res) => {
    const { id_rent } = req.params
    const renta = await pool.query('SELECT * FROM rentados d INNER JOIN links e ON d.id_car = e.id WHERE d.id_rent = ?',[id_rent])
    renta.today = new Date (Date.now());

    res.render('links/factura', {rentas: renta[0]})
})

router.get('/historialRentas', isSuperRoot, isLoggedIn, async(req, res) => {
    const renta = await pool.query('SELECT * FROM rentados d INNER JOIN links e ON d.id_car = e.id WHERE d.status = "Finalizado" or d.status = "Cancelado"')
    res.render('links/historialRentas', {rentas: renta})
})

router.get('/editarPerfil/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params
    const user = await pool.query('SELECT * FROM users WHERE id = ?', [id])
    res.render('links/editarPerfil', { users: user[0] })
})

router.post('/editarPerfil/:id', isLoggedIn, async(req, res) => {
    const { id } = req.params
    const {username, password, email, cellphone_number, birth_date} = req.body
    const updateProfile = {
        username,
        password,
        email,
        cellphone_number,
        birth_date
    }
    await pool.query('UPDATE users set ? WHERE id = ?', [updateProfile, id])
    req.flash('success', 'Su perfil ha sido actualizado correctamente')
    res.redirect('/profile')
})

router.get('/gestionarCarro/:id', isLoggedIn, async(req, res) => {
    const { id } = req.params
    const links = await pool.query('SELECT * FROM links WHERE id = ?', [id])
    if (links[0].estado == 'Disponible'){
        links[0].disponible = true
    }
    else {
        links[0].disponible = false
    }
    res.render('links/gestionarCarro', {link: links[0]})
})

router.get('/add', isLoggedIn, (req, res) => {
    res.render('links/add')
})

router.post('/add', isLoggedIn, async (req, res) => {
    const { brand,
        plate,
        gearbox,
        url,
        model,
        transit_license,
        fuel, 
        price } = req.body;
        
    const newLink = {
        brand,
        plate,
        gearbox,
        url,
        model,
        transit_license,
        fuel,
        price,
        user_id : req.user.id
    }
    await pool.query('INSERT INTO links set ?', [newLink] )
    req.flash('success', 'El vehículo fue registrado correctamente.')
    res.redirect('/links')
})

router.get('/ingresosCarro/:id', isLoggedIn, async(req, res) => {
    const totales = []
    var dict = {};
    const naturaleza = "Ingreso"
    const naturaleza2 = "Gastos"
    const { id } = req.params
    const link = await pool.query('SELECT * FROM historial WHERE id = ?', [id])
    const link2 = await pool.query('SELECT * FROM ingresos WHERE id_car = ? AND naturaleza = ?', [id, naturaleza2])
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

    if (totales[0].ganacia >= 0){
        totales[0].utilidad = true
    }

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
        const links = await pool.query('SELECT * FROM links WHERE user_id = ?', [req.user.id])
        res.render('links/listOwner', { links })
    }
})

router.get('/rentados', isLoggedIn, async(req,res) => { 
    const Disponible = 'Rentado'
    const links = await pool.query('SELECT * FROM rentados d INNER JOIN links e ON d.id_car = e.id WHERE d.status = "Rentado"')

    res.render('links/rentados', { links: links })
})

router.get('/rentar/:id', isLoggedIn, async(req,res) => { 
    const { id } = req.params 
    await pool.query('UPDATE rentados SET status = "Rentado" WHERE id_rent = ?', [id]);
    const rent = await pool.query('SELECT * FROM rentados d INNER JOIN links e ON d.id_car = e.id WHERE d.id_rent = ?', [id]);
    const nuevoRegistro = { 
        id: rent[0].id_car,
        nombre: `${rent[0].firstname} ${rent[0].lastname}`,
        cc: rent[0].document_number,
        telefono: rent[0].phone_number,
        fechaInicio: rent[0].start_date,
        fechaFin: rent[0].end_date,
        precio: rent[0].price,
        id_ingreso: 0
    }
    await pool.query('INSERT INTO historial set ?', [nuevoRegistro] )

    console.log(nuevoRegistro);   
    res.redirect('/links/rentados')
})

router.get('/cancelar/:id', isLoggedIn, async(req,res) => { 
    const { id } = req.params 
    await pool.query('UPDATE rentados SET status = "Cancelado" WHERE id_rent = ?', [id]);
    res.redirect('/links/gestionarReservasAdmin')
})  

router.get('/cancelarCustomer/:id', isLoggedIn, async(req,res) => { 
    const { id } = req.params 
    await pool.query('UPDATE rentados SET status = "Cancelado" WHERE id_rent = ?', [id]);
    res.redirect('/links/gestionarReservasCustomer')
})  

router.get('/finalizar/:id', isLoggedIn, async(req,res) => { 
    const { id } = req.params 
    await pool.query('UPDATE rentados SET status = "Finalizado" WHERE id_rent = ?', [id]);
    res.redirect('/links/gestionarReservasAdmin')
})

router.get('/comprobar/:id', isLoggedIn, async(req,res) => { 
    const { id } = req.params 
    await pool.query('UPDATE rentados SET status = "Comprobado" WHERE id_rent = ?', [id]);
    res.redirect('/links/gestionarReservasAdmin')
})


// router.get('/devuelto/:id', isSuperRoot, async (req, res) => {
//     const Rentado = 'Disponible'
//     const { id } = req.params
//     await pool.query('UPDATE links SET estado = ? WHERE id = ?', [Rentado, id])
//     await pool.query('DELETE FROM rentados WHERE id = ?', [id])
//     req.flash('success', 'Auto devuelto exitosamente')
//     res.redirect('/links')
// })


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
        fuel, 
        price} = req.body;
        
    const newLink = {
        brand,
        plate,
        gearbox,
        url,
        model,
        transit_license,
        fuel,
        price
    }
    await pool.query('UPDATE links set ? WHERE id = ?', [newLink, id])
    req.flash('success', 'Los datos de su vehículo han sido actualizados correctamente')
    res.redirect('/links/gestionarCarro/' + id)
})

router.get('/editGastos/:id_ingreso', isSuperRoot, async (req, res) => {
    const { id_ingreso } = req.params 
    const links = await pool.query('SELECT * FROM ingresos WHERE id = ?', [id_ingreso])
    res.render('links/editGastos', { link: links[0] })
})

router.post('/editGastos/:id_gasto', isSuperRoot, async(req, res) => {
    const { id_gasto } = req.params
    const naturaleza = 'Gastos'
    const {ingreso, valor, fecha } = req.body
    
    const newLink = {
        ingreso,
        valor,
        fecha,
        naturaleza
    }
    
    await pool.query('UPDATE ingresos set ? WHERE id = ?', [newLink, id_gasto])
    req.flash('success', 'Gasto editado con exito')
    const id = await pool.query('SELECT * FROM ingresos WHERE id = ?', [id_gasto]);
    res.redirect('../ingresosCarro/' + id[0].id_car)
})

router.get('/rentadoPor/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params 
    const links = await pool.query('SELECT * FROM rentados d INNER JOIN links e ON d.id_car = e.id WHERE d.id_rent = ?', [id])
    
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

router.post('/gastos/:id_car', isSuperRoot, async(req, res) => {
    const naturaleza = 'Gastos'
    const { id_car } = req.params
    const {ingreso, valor, fecha} = req.body
    const nuevoGasto = {
        id_car,
        ingreso,
        valor,
        naturaleza,
        fecha
    }
    await pool.query('INSERT INTO ingresos set ?', [nuevoGasto] )

    req.flash('success', 'Gasto ingresado correctamente')
    res.redirect('../ingresosCarro/' + id_car)
})

router.get('/gastoRealizado/:id_mantenimiento', isSuperRoot, async (req, res) => {
    const { id_mantenimiento } = req.params 
    const links2 = await pool.query('SELECT * FROM mantenimientos WHERE id_mantenimiento = ?', [id_mantenimiento])
    const link = await pool.query('SELECT id FROM mantenimientos WHERE id_mantenimiento = ?', [id_mantenimiento])
    const links = await pool.query('SELECT * FROM links WHERE id = ?', [link[0].id])
    res.render('links/gastoRealizado', { link: links[0], link2: links2[0] })
    await pool.query('DELETE FROM mantenimientos WHERE id_mantenimiento = ? ', [id_mantenimiento])

})

router.get('/deshabilitarCar/:id_car', isLoggedIn, async (req, res) => {
    const { id_car } = req.params;
    await pool.query('UPDATE links SET estado = "Deshabilitado" WHERE id = ?;', [id_car]);
    res.redirect('/links/gestionarCarro/' + id_car);
})

router.get('/habilitarCar/:id_car', isLoggedIn, async (req, res) => {
    const { id_car } = req.params;
    await pool.query('UPDATE links SET estado = "Disponible" WHERE id = ?;', [id_car]);
    res.redirect('/links/gestionarCarro/' + id_car);
})

router.get('/deshabilitarUser/:id_user', isLoggedIn, async (req, res) => {
    const { id_user } = req.params;
    await pool.query('DELETE FROM users WHERE id = ?;', [id_user]);
    if (req.user.username == 'root'){
        res.redirect('links/gestionarUsuarios')
    }
    else{
        res.redirect('/logout');
    }
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