package org.example.backend.user.controller;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.user.dto.ShippingFeeRequest;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/shipping")
public class ShippingFeeController {

    private static final String GHTK_API_URL = "https://services.giaohangtietkiem.vn/services/shipment/fee";
    private final String ghtkToken;
    private final String shopProvince;
    private final String shopDistrict;
    private final String shopWard;
    private final String shopStreet;
    private final HttpClient httpClient;

    /**
     * Constructor để inject các giá trị cấu hình và khởi tạo HttpClient.
     */
    public ShippingFeeController(
            @Value("${ghtk.api.token}") String ghtkToken,
            @Value("${ghtk.shop.province}") String shopProvince,
            @Value("${ghtk.shop.district}") String shopDistrict,
            @Value("${ghtk.shop.ward}") String shopWard,
            @Value("${ghtk.shop.street}") String shopStreet) {
        this.ghtkToken = ghtkToken;
        this.shopProvince = shopProvince;
        this.shopDistrict = shopDistrict;
        this.shopWard = shopWard;
        this.shopStreet = shopStreet;
        this.httpClient = HttpClient.newBuilder().build();
    }
    /**
     * Tính phí vận chuyển dựa trên thông tin địa chỉ và hàng hóa.
     *
     * @param request Thông tin yêu cầu tính phí vận chuyển
     * @return ResponseEntity chứa phí vận chuyển hoặc thông báo lỗi
     */
    @PostMapping("/fee")
    public ResponseEntity<?> getShippingFee(@Valid @RequestBody ShippingFeeRequest request) {
        log.info("Received request: {}", request);
        try {
            // Tạo payload JSON cho GHTK API
            JSONObject requestBodyJson = buildGhtkRequestPayload(request);
            log.info("GHTK Request Body: {}", requestBodyJson);

            // Gửi yêu cầu đến GHTK API
            HttpResponse<String> response = sendGhtkRequest(requestBodyJson);
            log.info("GHTK Response Status: {}", response.statusCode());
            log.info("GHTK Response Body: {}", response.body());

            // Xử lý phản hồi từ GHTK
            return processGhtkResponse(response);

        } catch (IllegalArgumentException e) {
            log.error("Validation error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(createErrorResponse("Tham số không hợp lệ", e.getMessage()));
        } catch (Exception e) {
            log.error("Server error while processing shipping fee request", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Lỗi server", "Không thể xử lý yêu cầu: " + e.getMessage()));
        }
    }

    /**
     * Tạo payload JSON cho yêu cầu GHTK API.
     */
    private JSONObject buildGhtkRequestPayload(ShippingFeeRequest request) {
        JSONObject json = new JSONObject();
        json.put("pick_province", shopProvince);
        json.put("pick_district", shopDistrict);
        json.put("pick_ward", shopWard);
        json.put("pick_street", shopStreet);
        json.put("province", normalizeAddressField(request.getCity()));
        json.put("district", normalizeAddressField(request.getDistrict()));
        json.put("ward", normalizeAddressField(request.getWard()));
        json.put("address", request.getAddress());
        json.put("weight", Math.ceil(request.getWeight())); // Chuyển sang kg
        json.put("value", request.getValue());
        json.put("transport_type", "road"); // Mặc định, có thể cấu hình
        log.info("Token: {}, Province: {}, District: {}, Ward: {}, Street: {}", ghtkToken, shopProvince, shopDistrict, shopWard, shopStreet);
        return json;
    }

    /**
     * Chuẩn hóa trường địa chỉ để khớp với định dạng GHTK (ví dụ: thêm tiền tố TP).
     */
    private String normalizeAddressField(String field) {
        if (field == null) return null;
        if (field.equalsIgnoreCase("Hà Nội") || field.equalsIgnoreCase("TP Hà Nội")) {
            return "TP Hà Nội";
        }
        if (field.equalsIgnoreCase("Hồ Chí Minh") || field.equalsIgnoreCase("TP Hồ Chí Minh")) {
            return "TP Hồ Chí Minh";
        }
        if (field.startsWith("Phường ")) {
            return field.replace("Phường ", "");
        }
        if (field.startsWith("Quận ")) {
            return field.replace("Quận ", "");
        }
        return field;
    }

    /**
     * Gửi yêu cầu HTTP đến GHTK API với retry logic.
     */
    private HttpResponse<String> sendGhtkRequest(JSONObject requestBodyJson) throws Exception {
        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(new URI(GHTK_API_URL))
                .header("Token", ghtkToken)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBodyJson.toString(), StandardCharsets.UTF_8))
                .build();

        int maxRetries = 3;
        int retryCount = 0;
        while (retryCount < maxRetries) {
            try {
                return httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            } catch (Exception e) {
                retryCount++;
                if (retryCount == maxRetries) {
                    throw new Exception("Không thể kết nối GHTK API sau " + maxRetries + " lần thử: " + e.getMessage());
                }
                Thread.sleep(1000); // Chờ 1 giây trước khi thử lại
            }
        }
        throw new Exception("Không thể gửi yêu cầu đến GHTK API");
    }

    /**
     * Xử lý phản hồi từ GHTK API.
     */
    private ResponseEntity<?> processGhtkResponse(HttpResponse<String> response) {
        if (response.statusCode() == 200) {
            JSONObject json = new JSONObject(response.body());
            if (json.getBoolean("success")) {
                double shipMoney = json.getJSONObject("fee").getDouble("fee");
                Map<String, Object> responseBody = new HashMap<>();
                responseBody.put("shipping_fee", shipMoney);
                responseBody.put("currency", "VND");
                return ResponseEntity.ok(responseBody);
            } else {
                String errorMessage = json.optString("message", "Lỗi không xác định từ GHTK");
                log.warn("GHTK API error: {}", errorMessage);
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Lỗi từ GHTK API", errorMessage));
            }
        } else {
            log.warn("GHTK API returned status: {}", response.statusCode());
            return ResponseEntity.status(response.statusCode())
                    .body(createErrorResponse("Lỗi từ GHTK", "Mã trạng thái: " + response.statusCode() + ", Body: " + response.body()));
        }
    }

    /**
     * Tạo phản hồi lỗi với định dạng chuẩn.
     */
    private Map<String, Object> createErrorResponse(String error, String message) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", error);
        errorResponse.put("message", message);
        errorResponse.put("timestamp", System.currentTimeMillis());
        return errorResponse;
    }
}