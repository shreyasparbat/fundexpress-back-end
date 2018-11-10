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
    const PGOLDbid = parseFloat(rowsGold.value) / 28.3495;

    // Get silver bid value
    const [rowsSilver] = await retrieveMarketValue('PSILVERbid');
    const PSILVERbid = parseFloat(rowsSilver.value) / 28.3495;

    // Get platinum bid value
    const [rowsPlatinum] = await retrieveMarketValue('PPLATINUMbid');
    const PPLATINUMbid = parseFloat(rowsPlatinum.value) / 28.3495;

    // Get USD to SGD exchange rate (bid)
    const [rowsExchangeRate] = await retrieveMarketValue('USSGDbid');
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
        'select t2.type, t2.value, t2.date, t2.time'
        + ' from goldsilv_db.exc t2'
        + ' inner join'
        + ' ('
            + ' select type, max(date) as max_date'
            + ' FROM goldsilv_db.exc'
            + ' WHERE type = ?'
            + ' group by type'
        + ' )t1'
        + ' on t1.type = t2.type and t1.max_date = date'
        + ' order by t2.time desc'
        + ' limit 1',
        [type]
    );
    return rows;
};

module.exports = {
    getGoldSilverPrice
};