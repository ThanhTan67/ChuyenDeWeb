export const convertToKg = (value, unit) => {
    if (!value || !unit) return 0;

    const normalizedUnit = unit.toLowerCase();

    switch (normalizedUnit) {
        case 'kg':
            return value;
        case 'g':
            return value / 1000;
        case 'mg':
            return value / 1000000;
        case 'ml':
            // Giả định mật độ trung bình của mỹ phẩm là 1g/ml
            return value / 1000;
        default:
            console.warn(`Unknown unit: ${unit}`);
            return 0;
    }
};

export const extractWeightAndUnit = (variantString) => {
    if (!variantString) return null;
    const match = variantString.match(/(\d+)\s*(ml|g|kg|mg)/i);
    return match ? {
        value: parseFloat(match[1]),
        unit: match[2].toLowerCase()
    } : null;
};