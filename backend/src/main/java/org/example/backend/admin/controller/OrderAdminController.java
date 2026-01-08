package org.example.backend.admin.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.user.dto.OrderDetailResponseDTO;
import org.example.backend.user.dto.OrderResponseDTO;
import org.example.backend.user.dto.RoleDTO;
import org.example.backend.user.dto.UserDTO;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class OrderAdminController {
    private final OrderService orderService;
    private final OrderRepository orderRepository;
    private final AuthService authService;

    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long orderId, @RequestBody Map<String, String> request) {
        try {
            String newStatus = request.get("status");
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng"));

            OrderStatus current = order.getOrderStatus();
            OrderStatus next = OrderStatus.valueOf(newStatus);

            if (current == OrderStatus.CANCELLED || current == OrderStatus.DELIVERED || current == OrderStatus.REFUSED) {
                throw new IllegalStateException("Không thể cập nhật trạng thái của đơn hàng đã hoàn thành hoặc đã hủy.");
            }
            if (current == OrderStatus.PENDING && next != OrderStatus.CONFIRMED && next != OrderStatus.CANCELLED && next != OrderStatus.REFUSED) {
                throw new IllegalStateException("Chỉ có thể xác nhận, từ chối hoặc hủy đơn hàng ở trạng thái chờ xác nhận.");
            }
            if (current == OrderStatus.CONFIRMED && next != OrderStatus.ON_DELIVERY && next != OrderStatus.CANCELLED && next != OrderStatus.REFUSED) {
                throw new IllegalStateException("Chỉ có thể chuyển sang giao hàng, từ chối hoặc hủy ở trạng thái đã xác nhận.");
            }
            if (current == OrderStatus.ON_DELIVERY && next != OrderStatus.DELIVERED && next != OrderStatus.CANCELLED) {
                throw new IllegalStateException("Chỉ có thể chuyển sang giao thành công hoặc hủy ở trạng thái đang giao.");
            }

            // Nếu chuyển sang DELIVERED thì cập nhật ngày giao hàng
            if (next == OrderStatus.DELIVERED) {
                order.setDeliveryDate(java.time.Instant.now());
            }
            order.setOrderStatus(next);
            orderRepository.save(order);
            return ResponseEntity.ok(createResponse(true, "Cập nhật trạng thái đơn hàng thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createResponse(false, "Lỗi khi cập nhật trạng thái: " + e.getMessage()));
        }
    }


    @GetMapping("/{orderId}/details")
    public ResponseEntity<?> getOrderDetailAdmin(@PathVariable Long orderId) {
        try {
            List<OrderDetailResponseDTO> orderDetails = orderService.getOrderDetails(orderId);
            return ResponseEntity.ok(createResponse(true, "Lấy chi tiết đơn hàng thành công", orderDetails));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createResponse(false, "Lỗi khi lấy chi tiết đơn hàng: " + e.getMessage()));
        }
    } @GetMapping("/all")
    public ResponseEntity<?> getAllOrders(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "5") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("bookingDate").descending());
            Page<Order> orderPage = orderService.getAllOrders(pageable);
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

    @GetMapping("/status/{status}")
    public ResponseEntity<?> getAllOrdersByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size
    ) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("bookingDate").descending());
            Page<Order> orderPage = orderService.getOrdersByStatus(OrderStatus.valueOf(status), pageable);
            List<OrderResponseDTO> responseDTOs = orderPage.getContent().stream()
                    .map(this::convertToOrderResponseDTO)
                    .collect(Collectors.toList());
            Map<String, Object> response = new HashMap<>();
            response.put("content", responseDTOs);
            response.put("totalPages", orderPage.getTotalPages());
            response.put("currentPage", orderPage.getNumber());
            response.put("totalItems", orderPage.getTotalElements());
            return ResponseEntity.ok(createResponse(true, "Lấy danh sách đơn hàng theo trạng thái thành công", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createResponse(false, "Lỗi khi lấy danh sách đơn hàng: " + e.getMessage()));
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
