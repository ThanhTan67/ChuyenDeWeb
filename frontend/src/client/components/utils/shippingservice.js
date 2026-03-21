import axios from 'axios';

const GHTK_API_URL = 'https://services.giaohangtietkiem.vn/services/shipment/fee';
const GHTK_TOKEN = 'ee42b44d5c4e4824e2f7d0d1cc74af58d328ccee';

const SHOP_INFO = {
    pick_province: 'Hồ Chí Minh',
    pick_district: 'Thủ Đức',
    pick_ward: 'Phường Linh Trung',
    pick_street: 'Khu phố 6'
};

export const calculateShippingFee = async (addressInfo, weight, value) => {
    try {
        const response = await axios.post(
            GHTK_API_URL,
            {
                ...SHOP_INFO,
                province: addressInfo.province,
                district: addressInfo.district,
                ward: addressInfo.ward,
                address: addressInfo.street,
                weight: Math.ceil(weight * 1000), // Chuyển kg thành gram
                value: value
            },
            {
                headers: {
                    'Token': GHTK_TOKEN,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data?.fee?.options?.shipMoney) {
            return response.data.fee.options.shipMoney;
        }
        throw new Error('Invalid response format');
    } catch (error) {
        console.error('Shipping calculation error:', error);
        throw error;
    }
};