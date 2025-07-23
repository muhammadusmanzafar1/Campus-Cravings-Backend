const getGrowthPercentage = (current, previous) => {
    if (previous === 0) return current === 0 ? 0 : 100;
    return ((current - previous) / previous) * 100;
};
module.exports = {
    getGrowthPercentage
};