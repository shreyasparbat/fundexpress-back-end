const getAge = (dateOfBirth) => {
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const m = today.getMonth() - dateOfBirth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dateOfBirth.getDate())) {
        age--;
    }
    return age;
};

const addMonths = (date, numberOfMonths) => {
    let calculatedDate = new Date();
    calculatedDate.setMonth(date.getMonth() + numberOfMonths);
    calculatedDate.setDate(date.getDate() - 1);
    return calculatedDate;
};

module.exports = {
    getAge,
    addMonths
};