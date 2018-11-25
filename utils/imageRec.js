const get_information = (front_text, back_text) => {
    // Define brand and purity lists
    const brandList = ['PAMP', 'CREDIT', 'PERTH', 'ARGOR', 'ROYAL', 'TALOR'];
    const brandTrueList = ['PAMP SUISSE', 'CREDIT SUISSE', 'PERTH MINT', 'ARGOR-HERAEUS', 'ROYAL CANADIAN MINT', 'METALOR'];
    const purityList = [999, 916, 835, 750, 585, 375];
    const purityTrueList = ['24k/999', '22k/916', '20k/835', '18k/750 (Yellow gold)', '14k/585', '9k/375'];

    // Create placeholder variables
    let brand = 'Generic';
    let weight = 5;
    let purity = '24k/999';

    // Create flags
    let brand_found = false;
    let weight_found = false;
    let purity_found = false;
    let ounce_found = false;

    // Loop through both array
    const combined_text = front_text.concat(back_text);
    console.log(combined_text);
    for (let i = 0; i < combined_text.length; i++) {
        // Make word lowercase
        const word = combined_text[i].toUpperCase();
        console.log(word);

        // Get numbers from  word
        const number = parseInt(word);
        console.log(number);

        // Search for brand
        for (let j = 0; j < brandList.length; j++) {
            if (!isNaN(number) || brand_found) {
                break;
            }
            if (word.includes(brandList[j]) && !brand_found) {
                brand = brandTrueList[j];
                brand_found = true;
            }
        }

        // Search for purity
        for (let j = 0; j < purityList.length; j++) {
            if (isNaN(number) || purity_found) {
                break;
            }
            if (number <= purityList[j] + 10 && number >= purityList[j] - 10 && !purity_found) {
                purity = purityTrueList[j];
                purity_found = true;
            }
        }

        // Search for weight
        if (!isNaN(number) && number <= 500 && !weight_found) {
            weight = number;
            weight_found = true;
        }

        // Search if ounce found
        if (word.includes('OUNCE')) {
            ounce_found = true;
        }
        if (ounce_found) {
            weight /= 31.1035;
        }

        // Break if everything found
        if (purity_found && weight_found && brand_found) {
            break;
        }
    } 
    
    // Return detected information
    return {
        brand,
        weight,
        purity,
        err: 'None'
    };
};

module.exports = {
    get_information
};