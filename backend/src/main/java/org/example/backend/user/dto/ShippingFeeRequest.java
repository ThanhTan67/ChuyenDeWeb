package org.example.backend.user.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ShippingFeeRequest {
    @NotBlank(message = "Tỉnh/Thành phố không được để trống")
    @JsonProperty("city")
    private String city;

    @NotBlank(message = "Quận/Huyện không được để trống")
    @JsonProperty("district")
    private String district;

    @NotBlank(message = "Phường/Xã không được để trống")
    @JsonProperty("ward")
    private String ward;

    @NotBlank(message = "Địa chỉ chi tiết không được để trống")
    @JsonProperty("address")
    private String address;

    @Min(value = 1, message = "Khối lượng phải lớn hơn 0")
    @JsonProperty("weight")
    private int weight;

    @Min(value = 0, message = "Giá trị hàng hóa không được âm")
    @JsonProperty("value")
    private int value;
}

