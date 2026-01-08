package org.example.backend.user.service;

import org.example.backend.user.dto.CategoryDTO;
import org.example.backend.user.dto.DiscountTypeDTO;
import org.example.backend.user.dto.ProductVariantDTO;
import org.example.backend.user.dto.VoucherDTO;
import org.example.backend.user.entity.*;
import org.example.backend.user.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VoucherService {

    @Autowired
    private VoucherRepository voucherRepository;

    @Autowired
    private DiscountTypeRepository discountTypeRepository;

    @Autowired
    private ProductVariantRepository productVariantRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private EVoucherRepository eVoucherRepository;

    @Autowired
    private UserRepository userRepository;

    public VoucherDTO createVoucher(VoucherDTO voucherDTO) {
        if (voucherDTO.getEndDate().isBefore(voucherDTO.getStartDate())) {
            throw new IllegalArgumentException("Ngày kết thúc phải sau ngày bắt đầu");
        }
        if (voucherRepository.existsByCode(voucherDTO.getCode())) {
            throw new IllegalArgumentException("Mã voucher đã tồn tại");
        }
        if (voucherDTO.getDiscountType().getId() == 2 && voucherDTO.getCategory() == null) {
            throw new IllegalArgumentException("Phải chọn danh mục khi loại giảm giá là 'Category'");
        }
        if (voucherDTO.getDiscountType().getId() == 3 && voucherDTO.getProductVariantDTO() == null) {
            throw new IllegalArgumentException("Phải chọn sản phẩm khi loại giảm giá là 'Product'");
        }
        if (voucherDTO.getDiscountType().getId() == 1 && (voucherDTO.getCategory() != null || voucherDTO.getProductVariantDTO() != null)) {
            throw new IllegalArgumentException("Không được chọn danh mục hoặc sản phẩm khi loại giảm giá là 'All'");
        }

        Voucher voucher = new Voucher();
        mapVoucherDTOToEntity(voucherDTO, voucher);
        Voucher savedVoucher = voucherRepository.save(voucher);
        return mapVoucherToDTO(savedVoucher);
    }

    public Page<VoucherDTO> getAllVouchersForAdmin(Pageable pageable) {
        return voucherRepository.findAllByOrderByIdDesc(pageable)
                .map(this::mapVoucherToDTO);
    }

    public List<VoucherDTO> getActiveVouchersForUser() {
        return voucherRepository.findAll().stream()
                .filter(voucher -> voucher.getIsActive() &&
                        !voucher.getEndDate().isBefore(LocalDate.now()) &&
                        !voucher.getStartDate().isAfter(LocalDate.now()) &&
                        voucher.getQuantity() > 0)
                .map(this::mapVoucherToDTO)
                .collect(Collectors.toList());
    }

    public List<VoucherDTO> getUserSavedVouchers(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));
        return eVoucherRepository.findByUser(user).stream()
                .filter(eVoucher ->
                        eVoucher.getVoucher().getIsActive() &&
                        !eVoucher.getVoucher().getEndDate().isBefore(LocalDate.now()) &&
                        !eVoucher.getVoucher().getStartDate().isAfter(LocalDate.now()) &&
                        eVoucher.getVoucher().getQuantity() > 0
                )
                .map(eVoucher -> mapVoucherToDTO(eVoucher.getVoucher()))
                .collect(Collectors.toList());
    }

    @Transactional
    public void saveVoucherForUser(String username, Long voucherId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new IllegalArgumentException("Voucher không tồn tại"));

        if (!voucher.getIsActive()) {
            throw new IllegalArgumentException("Voucher không hoạt động");
        }
        if (voucher.getQuantity() <= 0) {
            throw new IllegalArgumentException("Voucher đã hết số lượng");
        }
        if (voucher.getStartDate().isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("Voucher chưa bắt đầu");
        }
        if (voucher.getEndDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Voucher đã hết hạn");
        }
        if (eVoucherRepository.findByUserAndVoucher(user, voucher).isPresent()) {
            throw new IllegalArgumentException("Bạn đã lưu voucher này rồi");
        }

        EVoucher eVoucher = new EVoucher();
        eVoucher.setUser(user);
        eVoucher.setVoucher(voucher);
        eVoucher.setUsage_limit(1);
        eVoucherRepository.save(eVoucher);

        voucher.setQuantity(voucher.getQuantity() - 1);
        voucherRepository.save(voucher);
    }

    public boolean checkUserSavedVoucher(String username, Long voucherId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new IllegalArgumentException("Voucher không tồn tại"));
        return eVoucherRepository.findByUserAndVoucher(user, voucher).isPresent();
    }

    private void mapVoucherDTOToEntity(VoucherDTO dto, Voucher voucher) {
        voucher.setCode(dto.getCode());
        DiscountType discountType = discountTypeRepository.findById(dto.getDiscountType().getId())
                .orElseThrow(() -> new IllegalArgumentException("Loại giảm giá không tồn tại"));
        voucher.setDiscountType(discountType);
        voucher.setDiscountPercentage(dto.getDiscountPercentage());
        if (dto.getProductVariantDTO() != null) {
            ProductVariant productVariant = productVariantRepository.findById(dto.getProductVariantDTO().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Biến thể sản phẩm không tồn tại"));
            voucher.setProductVariant(productVariant);
        }
        if (dto.getCategory() != null) {
            Category category = categoryRepository.findById(dto.getCategory().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Danh mục không tồn tại"));
            voucher.setCategory(category);
        }
        voucher.setQuantity(dto.getQuantity());
        voucher.setStartDate(dto.getStartDate());
        voucher.setEndDate(dto.getEndDate());
        voucher.setMinimumOrderValue(dto.getMinimumOrderValue());
        voucher.setMaximumDiscount(dto.getMaximumDiscount());
        voucher.setIsActive(dto.getIsActive());
    }

    private VoucherDTO mapVoucherToDTO(Voucher voucher) {
        VoucherDTO dto = new VoucherDTO();
        dto.setId(voucher.getId());
        dto.setCode(voucher.getCode());
        dto.setDiscountType(new DiscountTypeDTO(voucher.getDiscountType().getId(), voucher.getDiscountType().getType()));
        dto.setDiscountPercentage(voucher.getDiscountPercentage());
        if (voucher.getProductVariant() != null) {
            ProductVariantDTO productVariantDTO = new ProductVariantDTO();
            productVariantDTO.setId(voucher.getProductVariant().getId());
            productVariantDTO.setAttribute(voucher.getProductVariant().getProductAttribute());
            productVariantDTO.setVariant(voucher.getProductVariant().getVariant());
            productVariantDTO.setPrice(voucher.getProductVariant().getPrice());
            productVariantDTO.setQuantity(voucher.getProductVariant().getQuantity());
            dto.setProductVariantDTO(productVariantDTO);
        }
        if (voucher.getCategory() != null) {
            dto.setCategory(new CategoryDTO(voucher.getCategory().getId(), voucher.getCategory().getName()));
        }
        dto.setQuantity(voucher.getQuantity());
        dto.setStartDate(voucher.getStartDate());
        dto.setEndDate(voucher.getEndDate());
        dto.setMinimumOrderValue(voucher.getMinimumOrderValue());
        dto.setMaximumDiscount(voucher.getMaximumDiscount());
        dto.setIsActive(voucher.getIsActive());
        return dto;
    }
}