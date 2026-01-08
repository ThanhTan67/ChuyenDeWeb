package org.example.backend.user.service;

import org.example.backend.user.dto.ReviewDTO;
import org.example.backend.user.entity.Product;
import org.example.backend.user.entity.Review;
import org.example.backend.user.entity.ReviewImage;
import org.example.backend.user.repository.ProductRepository;
import org.example.backend.user.repository.ReviewImageRepsitory;
import org.example.backend.user.repository.ReviewRepository;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ReviewImageRepsitory reviewImageRepsitory;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Transactional
    public ReviewDTO createReview(ReviewDTO reviewDTO, List<MultipartFile> images) {
        Product product = productRepository.findById(reviewDTO.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Sản phẩm không tồn tại"));

        Review review = new Review();
        review.setCommenterName(reviewDTO.getCommenterName());
        review.setPhonenumberCommenter(reviewDTO.getPhonenumberCommenter());
        review.setProduct(product);
        review.setRating(reviewDTO.getRating());
        review.setComment(reviewDTO.getComment());
        review.setDateCreated(Instant.now());
        review.setIsAccept(false);

        review = reviewRepository.save(review);

        List<String> imageIds = new ArrayList<>();
        if (images != null && !images.isEmpty()) {
            for (MultipartFile image : images) {
                try {
                    String uploadResult = cloudinaryService.upLoadImage(image);
                    JSONObject jsonResult = new JSONObject(uploadResult);
                    String publicId = jsonResult.getString("publicId");

                    ReviewImage reviewimage = new ReviewImage();
                    reviewimage.setImgAssetId(publicId);
                    reviewimage.setReview(review);
                    reviewImageRepsitory.save(reviewimage);
                    imageIds.add(publicId);
                } catch (Exception e) {
                    throw new RuntimeException("Lỗi khi upload ảnh: " + e.getMessage());
                }
            }
        }

        reviewDTO.setId(review.getId());
        reviewDTO.setDateCreated(review.getDateCreated());
        reviewDTO.setIsAccept(review.getIsAccept());
        reviewDTO.setImageIds(imageIds);
        return reviewDTO;
    }

    public List<ReviewDTO> getReviewsByProduct(Long productId) {
        return reviewRepository.findByProductIdAndIsAcceptTrue(productId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ReviewDTO> getAllReviews() {
        return reviewRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReviewDTO acceptReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review không tồn tại"));
        review.setIsAccept(true);
        review = reviewRepository.save(review);
        return convertToDTO(review);
    }

    @Transactional
    public ReviewDTO replyToReview(Long reviewId, String response) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review không tồn tại"));
        review.setResponse(response);
        review.setDateReply(Instant.now());
        review = reviewRepository.save(review);
        return convertToDTO(review);
    }

    private ReviewDTO convertToDTO(Review review) {
        ReviewDTO dto = new ReviewDTO();
        dto.setId(review.getId());
        dto.setCommenterName(review.getCommenterName());
        dto.setPhonenumberCommenter(review.getPhonenumberCommenter());
        dto.setProductId(review.getProduct().getId());
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setDateCreated(review.getDateCreated());
        dto.setDateReply(review.getDateReply());
        dto.setResponse(review.getResponse());
        dto.setIsAccept(review.getIsAccept());
        List<String> imageIds = review.getImages().stream()
                .map(ReviewImage::getImgAssetId)
                .collect(Collectors.toList());
        dto.setImageIds(imageIds);
        return dto;
    }
}