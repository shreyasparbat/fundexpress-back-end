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
    return new Date(date.setMonth(date.getMonth() + numberOfMonths));
};

module.exports = {
    getAge,
    addMonths
};