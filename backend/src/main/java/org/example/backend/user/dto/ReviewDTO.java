package org.example.backend.user.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
public class ReviewDTO {
    private Long id;

    @NotBlank(message = "Tên người bình luận không được để trống")
    @Size(max = 30, message = "Tên người bình luận không được vượt quá 30 ký tự")
    private String commenterName;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^\\d{10,15}$", message = "Số điện thoại phải có từ 10 đến 15 chữ số")
    private String phonenumberCommenter;

    @NotNull(message = "ID sản phẩm không được để trống")
    private Long productId;

    @NotNull(message = "Điểm đánh giá không được để trống")
    @Min(value = 1, message = "Điểm đánh giá phải từ 1 đến 5")
    @Max(value = 5, message = "Điểm đánh giá phải từ 1 đến 5")
    private Integer rating;

    @NotBlank(message = "Bình luận không được để trống")
    @Size(max = 500, message = "Bình luận không được vượt quá 500 ký tự")
    private String comment;

    private Instant dateCreated;
    private Instant dateReply;
    private String response;
    private Boolean isAccept;
    private List<String> imageIds;
}