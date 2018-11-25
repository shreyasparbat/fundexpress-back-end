// Library imports
const mysql = require('mysql2/promise');

// Custom imports
const keys = require('../keys');

// Create the connection pool. The pool-specific settings are the defaults
const pool = mysql.createPool({
    host: '52.76.216.100',
    user: keys.legacyDbUser,
    password: keys.legacyDbPassword
});

const getGoldSilverPrice = async () => {
    // Get gold bid value
    const [rowsGold] = await retrieveMarketValue('PGOLDbid');
    const PGOLDbid = parseFloat(rowsGold.value) / 31.1035;

    // Get silver bid value
    const [rowsSilver] = await retrieveMarketValue('PSILVERbid');
    const PSILVERbid = parseFloat(rowsSilver.value) / 31.1035;

    // Get platinum bid value
    const [rowsPlatinum] = await retrieveMarketValue('PPLATINUMbid');
    const PPLATINUMbid = parseFloat(rowsPlatinum.value) / 31.1035;

    // Get USD to SGD exchange rate (bid)
    const [rowsExchangeRate] = await retrieveMarketValue('USSGD');
    const USSGD = parseFloat(rowsExchangeRate.value);

    // Calculate and return final values
    return {
        gold: PGOLDbid * USSGD,
        silver: PSILVERbid * USSGD,
        platinum: PPLATINUMbid * USSGD
    };
};

const retrieveMarketValue = async (type) => {
    const [rows] = await pool.query(
        'select type, value, date, time'
        + ' from goldsilv_db.exc t1'
        + ' where date = ('
        +     ' select max(date)'
        +     ' from goldsilv_db.exc'
        +     ' )'
        + ' and type = ?'
        + ' order by time desc'
        + ' limit 1',
        [type]
    );
    return rows;
};

module.exports = {
    getGoldSilverPrice
};