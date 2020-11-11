const mysql = require('mysql')
const { promisify } = require('util')

const { database } =  require('./keys')

const pool = mysql.createPool(database)

pool.getConnection((err, connection) => {
    if(err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.');
        }
        else if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has to many connections');
        }
        else if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused');
        } else {
            console.error(err)
        }
    }

    if(connection) {
        connection.release()
        console.log('DB is connected')
    }
    return
})

// transformo de callbacks a promesas 
pool.query = promisify(pool.query)

module.exports = pool