// API_DEBUG.js
export const debugFetch = async (url, options = {}) => {
    console.log(`🔍 Gửi yêu cầu đến: ${url}`);
    console.log('📤 Options:', options);

    try {
        const response = await fetch(url, options);
        console.log(`📥 Status code: ${response.status}`);

        // Kiểm tra header response
        const headers = {};
        response.headers.forEach((value, key) => {
            headers[key] = value;
        });
        console.log('📝 Headers:', headers);

        // Clone response để có thể đọc body
        const clonedResponse = response.clone();

        try {
            // Thử đọc response dưới dạng JSON
            const data = await clonedResponse.json();
            console.log('✅ Response JSON:', data);
            return response;
        } catch (jsonError) {
            // Nếu không phải JSON, đọc dưới dạng text
            const text = await response.text();
            console.log('⚠️ Response (không phải JSON):', text);

            // Tạo response mới để trả về cho ứng dụng
            return new Response(text, {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers
            });
        }
    } catch (error) {
        console.error('❌ Network error:', error);
        throw error;
    }
};
