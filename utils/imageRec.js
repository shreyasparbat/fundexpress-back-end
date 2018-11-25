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

    // Loop through both array
    const combined_text = front_text.concat(back_text);
    console.log(combined_text);
    for (let wordIndex = 0; wordIndex < combined_text.length; wordIndex++) {
        // Make word lowercase
        const word = combined_text[wordIndex].toUpperCase();
        console.log(word);

        // Get numbers from  word
        const number = parseInt(word);
        console.log(number);

        // Search for brand
        for (let brandIndex = 0; brandIndex < brand_list.length; brandIndex++) {
            if (brand_found) {
                break;
            }
            let given_brand = brand_list[brandIndex];
            if (word.includes(given_brand) && !brand_found) {
                brand = given_brand;
                brand_found = true;
            }
        }

        // Search for purity
        for (let purityIndex) {
            if (purity_found) {
                break;
            }
            if (number <= given_purity + 10 && number >= given_purity - 10 && !purity_found) {
                purity = given_purity;
                purity_found = true;
            }
        }

        // Search for weight
        if (number <= 500 && !weight_found) {
            weight = number;
            weight_found = true;
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