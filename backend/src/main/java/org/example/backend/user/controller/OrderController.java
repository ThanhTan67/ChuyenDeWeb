package org.example.backend.user.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.user.dto.*;
import org.example.backend.user.entity.Order;
import org.example.backend.user.entity.User;
import org.example.backend.user.enums.OrderStatus;
import org.example.backend.user.repository.OrderRepository;
import org.example.backend.user.service.AuthService;
import org.example.backend.user.service.OrderService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;
    private final OrderRepository orderRepository;
    private final AuthService authService;

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody OrderDTO orderDTO) {
        Long userId = authService.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).body(createResponse(false, "Người dùng chưa được xác thực"));
        }
        try {
            Order order = orderService.createOrder(userId, orderDTO);
            OrderResponseDTO responseDTO = convertToOrderResponseDTO(order);
            return ResponseEntity.ok(createResponse(true, "Tạo đơn hàng thành công", responseDTO));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(createResponse(false, e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getUserOrders(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "5") int size) {
        Long userId = authService.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).body(createResponse(false, "Người dùng chưa được xác thực"));
        }
        Pageable pageable = PageRequest.of(page, size, Sort.by("bookingDate").descending());
        Page<Order> orderPage = orderService.getUserOrders(userId, pageable);
        List<OrderResponseDTO> responseDTOs = orderPage.getContent().stream()
                .map(this::convertToOrderResponseDTO)
                .collect(Collectors.toList());
        Map<String, Object> response = new HashMap<>();
        response.put("content", responseDTOs);
        response.put("totalPages", orderPage.getTotalPages());
        response.put("currentPage", orderPage.getNumber());
        response.put("totalItems", orderPage.getTotalElements());
        return ResponseEntity.ok(createResponse(true, "Lấy danh sách đơn hàng thành công", response));
    }



    @GetMapping("/status/{status}")
    public ResponseEntity<?> getUserOrdersByStatus(@PathVariable OrderStatus status, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "5") int size) {
        Long userId = authService.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).body(createResponse(false, "Người dùng chưa được xác thực"));
        }
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("bookingDate").descending());
            Page<Order> orderPage = orderService.getUserOrdersByStatus(userId, status, pageable);
            List<OrderResponseDTO> responseDTOs = orderPage.getContent().stream()
                    .map(this::convertToOrderResponseDTO)
                    .collect(Collectors.toList());
            Map<String, Object> response = new HashMap<>();
            response.put("content", responseDTOs);
            response.put("totalPages", orderPage.getTotalPages());
            response.put("currentPage", orderPage.getNumber());
            response.put("totalItems", orderPage.getTotalElements());
            return ResponseEntity.ok(createResponse(true, "Lấy danh sách đơn hàng thành công", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createResponse(false, "Lỗi khi lấy danh sách đơn hàng: " + e.getMessage()));
        }
    }



    @GetMapping("/{orderId}/details")
    public ResponseEntity<?> getOrderDetails(@PathVariable Long orderId) {
        try {
            List<OrderDetailResponseDTO> orderDetails = orderService.getOrderDetails(orderId);
            return ResponseEntity.ok(createResponse(true, "Lấy chi tiết đơn hàng thành công", orderDetails));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createResponse(false, "Lỗi khi lấy chi tiết đơn hàng: " + e.getMessage()));
        }
    }

    @GetMapping("/vnpay/{txnRef}")
    public ResponseEntity<?> getOrderByVnpTxnRef(@PathVariable String txnRef) {
        try {
            Order order = orderRepository.findByVnpTxnRef(Long.parseLong(txnRef))
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng với mã giao dịch: " + txnRef));
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
            Map<String, Object> data = new HashMap<>();
            data.put("order", convertToOrderResponseDTO(order));
            data.put("orderDateTime", order.getBookingDate().toString());
            data.put("selectedCartItems", selectedCartItems);
            return ResponseEntity.ok(createResponse(true, "Lấy thông tin đơn hàng thành công", data));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/total-sales")
    public ResponseEntity<?> getTotalSales() {
        try {
            BigDecimal totalSales = orderService.getTotalSales();
            Map<String, Object> data = new HashMap<>();
            data.put("totalSales", totalSales);
            data.put("growthPercentage", 72.8); // Giá trị giả lập
            return ResponseEntity.ok(createResponse(true, "Lấy tổng doanh số thành công", data));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createResponse(false, "Lỗi khi lấy tổng doanh số: " + e.getMessage()));
        }
    }

    @GetMapping("/sales-by-category")
    public ResponseEntity<?> getSalesByCategory() {
        try {
            Map<String, BigDecimal> salesByCategory = orderService.getSalesByCategory();
            List<Map<String, Object>> data = salesByCategory.entrySet().stream()
                    .map(entry -> {
                        Map<String, Object> item = new HashMap<>();
                        item.put("category", entry.getKey());
                        item.put("sales", entry.getValue());
                        return item;
                    })
                    .collect(Collectors.toList());
            return ResponseEntity.ok(createResponse(true, "Lấy doanh số theo danh mục thành công", data));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createResponse(false, "Lỗi khi lấy doanh số theo danh mục: " + e.getMessage()));
        }
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