package org.example.backend.user.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VoucherDTO implements Serializable {

    private Long id;

    @NotBlank(message = "Mã voucher không được để trống")
    private String code;

    @NotNull(message = "Loại giảm giá là bắt buộc")
    private DiscountTypeDTO discountType;

    @NotNull(message = "Phần trăm giảm giá là bắt buộc")
    @DecimalMin(value = "0.0", inclusive = false, message = "Phần trăm giảm phải lớn hơn 0")
    @DecimalMax(value = "100.0", message = "Phần trăm giảm không được lớn hơn 100")
    private BigDecimal discountPercentage;

    // Cho phép để trống nếu là áp dụng theo danh mục
    private ProductVariantDTO productVariantDTO;

    // Cho phép để trống nếu là áp dụng theo sản phẩm cụ thể
    private CategoryDTO category;

    @NotNull(message = "Số lượng là bắt buộc")
    @Min(value = 1, message = "Số lượng phải lớn hơn hoặc bằng 1")
    private Integer quantity;

    @NotNull(message = "Ngày bắt đầu là bắt buộc")
    @FutureOrPresent(message = "Ngày bắt đầu phải từ hôm nay trở đi")
    private LocalDate startDate;

    @NotNull(message = "Ngày kết thúc là bắt buộc")
    @Future(message = "Ngày kết thúc phải ở tương lai")
    private LocalDate endDate;

    @NotNull(message = "Giá trị đơn hàng tối thiểu là bắt buộc")
    @DecimalMin(value = "0.0", inclusive = true, message = "Giá trị đơn hàng tối thiểu phải >= 0")
    private Double minimumOrderValue;

    @NotNull(message = "Số tiền giảm tối đa là bắt buộc")
    @DecimalMin(value = "0.0", inclusive = false, message = "Số tiền giảm tối đa phải lớn hơn 0")
    private Double maximumDiscount;

    @NotNull(message = "Trạng thái kích hoạt là bắt buộc")
    private Boolean isActive;
}
