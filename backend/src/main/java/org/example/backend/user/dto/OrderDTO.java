package org.example.backend.user.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Data
public class OrderDTO {
    @NotBlank(message = "Tên người nhận không được để trống")
    private String consigneeName;

    @NotBlank(message = "Số điện thoại người nhận không được để trống")
    @Pattern(regexp = "^\\d{10,11}$", message = "Số điện thoại phải có 10 hoặc 11 chữ số")
    private String consigneePhone;

    @NotBlank(message = "Địa chỉ không được để trống")
    private String address;

    private String orderNotes;

    @NotEmpty(message = "Danh sách sản phẩm không được để trống")
    @Valid
    private List<@Valid OrderDetailDTO> orderDetails;

    @NotNull(message = "Phí vận chuyển không được để null")
    @DecimalMin(value = "0.0", inclusive = true, message = "Phí vận chuyển phải >= 0")
    private BigDecimal ship;

    @DecimalMin(value = "0.0", inclusive = true, message = "Giá trị giảm giá phải >= 0")
    private BigDecimal discountValue;

    @NotNull(message = "Thông tin thanh toán không được để trống")
    @Valid
    private Long paymentId;
    private Long voucherId;
}