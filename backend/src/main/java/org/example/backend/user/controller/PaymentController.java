package org.example.backend.user.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.example.backend.user.config.VNPayConfig;
import org.example.backend.user.dto.OrderDTO;
import org.example.backend.user.dto.OrderResponseDTO;
import org.example.backend.user.dto.RoleDTO;
import org.example.backend.user.dto.UserDTO;
import org.example.backend.user.entity.Order;
import org.example.backend.user.entity.User;
import org.example.backend.user.enums.OrderStatus;
import org.example.backend.user.repository.OrderDetailRepository;
import org.example.backend.user.repository.OrderRepository;
import org.example.backend.user.repository.UserRepository;
import org.example.backend.user.service.EmailService;
import org.example.backend.user.service.OrderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {
    private final OrderService orderService;
    private final OrderDetailRepository orderDetailRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final VNPayConfig vnpayConfig;
    private final EmailService emailService;
    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);

    @PostMapping("/create-vnpay")
    public ResponseEntity<?> createVNPayPayment(HttpServletRequest request, @RequestBody Map<String, Object> requestBody) throws UnsupportedEncodingException {
        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String orderType = "210000";
        long amount = Long.parseLong(requestBody.get("amount").toString()) * 100;
        String vnp_TxnRef = vnpayConfig.getRandomNumber(8);
        String vnp_IpAddr = vnpayConfig.getIpAddress(request);

        // Lưu dữ liệu đơn hàng tạm thời
        OrderDTO orderData = new ObjectMapper().convertValue(requestBody.get("orderData"), OrderDTO.class);

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnpayConfig.getVnpTmnCode());
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang: " + vnp_TxnRef);
        vnp_Params.put("vnp_OrderType", orderType);
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnpayConfig.getVnpReturnUrl());
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = (String) itr.next();
            String fieldValue = (String) vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }
        String queryUrl = query.toString();
        String vnp_SecureHash = vnpayConfig.hmacSHA512(vnpayConfig.getSecretKey(), hashData.toString());
        logger.info("createVNPayPayment - hashData: {}", hashData.toString());
        logger.info("createVNPayPayment - vnp_SecureHash: {}", vnp_SecureHash);
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        String paymentUrl = vnpayConfig.getVnpPayUrl() + "?" + queryUrl;

        // Lưu đơn hàng tạm thời với trạng thái PENDING
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).body(createResponse(false, "Người dùng chưa được xác thực"));
        }

        //tạo order
        Order order = orderService.createOrder(userId, orderData);
        order.setVnpTxnRef(Long.parseLong(vnp_TxnRef));
        order.setOrderStatus(OrderStatus.PENDING);
        orderRepository.save(order);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Tạo URL thanh toán VNPay thành công");
        response.put("data", Map.of("paymentUrl", paymentUrl, "txnRef", vnp_TxnRef));

        return ResponseEntity.ok(response);
    }

    @GetMapping("/vnpay-return")
    public RedirectView handleVNPayReturn(HttpServletRequest request) throws UnsupportedEncodingException {
        logger.info("===== Tham số trả về từ VNPay =====");
        Map<String, String> fields = new HashMap<>();
        for (Enumeration<String> params = request.getParameterNames(); params.hasMoreElements();) {
            String fieldName = params.nextElement();
            String fieldValue = request.getParameter(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                fields.put(fieldName, fieldValue);
                logger.info("{} = {}", fieldName, fieldValue);
            }
        }

        String vnp_SecureHash = request.getParameter("vnp_SecureHash");
        fields.remove("vnp_SecureHashType");
        fields.remove("vnp_SecureHash");

        String signData = vnpayConfig.hashAllFields(fields);
        logger.info("Dữ liệu chữ ký (signData): {}", signData);
        String calculatedHash = vnpayConfig.hmacSHA512(vnpayConfig.getSecretKey(), signData);
        logger.info("Chữ ký tính toán: {}", calculatedHash);
        logger.info("Chữ ký nhận được (vnp_SecureHash): {}", vnp_SecureHash);

        String vnp_TxnRef = request.getParameter("vnp_TxnRef");
        Order order = orderRepository.findByVnpTxnRefWithDetails(Long.parseLong(vnp_TxnRef))
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng với vnp_TxnRef: " + vnp_TxnRef));

        if (calculatedHash.equals(vnp_SecureHash)) {
            String vnp_ResponseCode = request.getParameter("vnp_ResponseCode");
            if ("00".equals(vnp_ResponseCode)) {
                order.setOrderStatus(OrderStatus.CONFIRMED);
                orderRepository.save(order);
            } else {
                order.setOrderStatus(OrderStatus.PENDING);
                orderRepository.save(order);
            }
        } else {
            order.setOrderStatus(OrderStatus.PENDING);
            orderRepository.save(order);
            logger.error("Chữ ký không hợp lệ. Kỳ vọng: {}, Nhận được: {}", calculatedHash, vnp_SecureHash);
        }

        // Chuyển hướng đến frontend
        String redirectUrl = "http://localhost:3000/confirm-order?txnRef=" + vnp_TxnRef;
        return new RedirectView(redirectUrl);
    }

    @GetMapping("/order-details")
    public ResponseEntity<?> getOrderDetails(@RequestParam("txnRef") String txnRef) {
        Order order = orderRepository.findByVnpTxnRefWithDetails(Long.parseLong(txnRef))
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng với vnp_TxnRef: " + txnRef));

        List<Map<String, Object>> selectedCartItems = order.getOrderDetails().stream()
                .map(detail -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("productVariantId", detail.getVariant().getId());
                    item.put("quantity", detail.getQuantity());
                    item.put("price", detail.getProductPrice());
                    item.put("productName", detail.getVariant().getProduct().getName());
                    item.put("attribute", detail.getVariant().getProductAttribute());
                    item.put("variant", detail.getVariant().getVariant());
                    return item;
                })
                .toList();

        OrderResponseDTO responseDTO = convertToOrderResponseDTO(order);
        Map<String, Object> data = new HashMap<>();
        data.put("order", responseDTO);
        data.put("orderDateTime", new Date().toInstant().toString());
        data.put("selectedCartItems", selectedCartItems);

        return ResponseEntity.ok(createResponse(true, "Lấy thông tin đơn hàng thành công", data));
    }

    private Long getCurrentUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            String username = ((UserDetails) principal).getUsername();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng: " + username));
            return user != null ? user.getId() : null;
        }
        return null;
    }

    private OrderResponseDTO convertToOrderResponseDTO(Order order) {
        OrderResponseDTO dto = new OrderResponseDTO();
        dto.setId(order.getId());
        dto.setUser(convertToUserDTO(order.getUser()));
        dto.setBookingDate(order.getBookingDate());
        dto.setDeliveryDate(order.getDeliveryDate());
        dto.setConsigneeName(order.getConsigneeName());
        dto.setConsigneePhone(order.getConsigneePhone());
        dto.setAddress(order.getAddress());
        dto.setOrderNotes(order.getOrderNotes());
        dto.setShip(order.getShip());
        dto.setDiscountValue(order.getDiscountValue());
        dto.setTotalMoney(order.getTotalMoney());
        dto.setOrderStatus(order.getOrderStatus());
        dto.setPaymentMethod(order.getPayment().getMethodName());
        return dto;
    }

    private UserDTO convertToUserDTO(User user) {
        if (user == null) {
            return null;
        }
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        if (user.getRole() != null) {
            RoleDTO roleDTO = new RoleDTO();
            roleDTO.setId(user.getRole().getId());
            roleDTO.setRoleName(user.getRole().getRoleName());
            dto.setRole(roleDTO);
        }
        dto.setFailed(user.getFailed());
        dto.setLocked(user.getLocked());
        dto.setLockTime(user.getLockTime());
        return dto;
    }

    private Map<String, Object> createResponse(boolean success, String message) {
        Map<String, Object> res = new HashMap<>();
        res.put("success", success);
        res.put("message", message);
        return res;
    }

    private Map<String, Object> createResponse(boolean success, String message, Object data) {
        Map<String, Object> res = createResponse(success, message);
        res.put("data", data);
        return res;
    }
}