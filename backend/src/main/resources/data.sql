-- Insert vào bảng role
INSERT INTO role (id, role_name)
VALUES (1, 'ROLE_CLIENT');
INSERT INTO role (id, role_name)
VALUES (2, 'ROLE_ADMIN');
INSERT INTO role (id, role_name)
VALUES (3, 'ROLE_MANAGE_USER');
INSERT INTO role (id, role_name)
VALUES (4, 'ROLE_MANAGE_ORDER');

UPDATE user set role_id = 2 where id =2;
-- Insert Into DiscountType --
Insert into DiscountType(id, type) values (1,'All'),(2,'Category'),(3,'Product');

-- Insert into payment --
INSERT INTO payment(id,method_name) VALUES (1,'Thanh toán khi nhận hàng(COD)'),
                                           (2,'VN Pay'),
                                           (3,'PayPal'),
                                           (4,'QR CODE');

-- Insert vào bảng category
INSERT
INTO category (id, name)
VALUES (1, 'Tẩy trang'),
       (2, 'Toner'),
       (3, 'Sữa rửa mặt'),
       (4, 'Kem chống nắng'),
       (5, 'Bông tẩy trang'),
       (6, 'Kem dưỡng'),
       (7, 'Mặt nạ'),
       (8, 'Serum'),
       (9, 'Kem nền');

-- Insert vào bảng brand
INSERT INTO brand (id, name)
VALUES (1, 'KOKIMI'),
       (2, 'SUN BLOCK'),
       (3, 'Sunplay'),
       (4, 'CENTELLA'),
       (5, 'POND S'),
       (6, 'LA ROCHE-POSAY'),
       (7, 'MAYBELLINE'),
       (8, 'Vedette'),
       (9, 'klairs'),
       (10, 'Cetaphil'),
       (11, 'CeraVe'),
       (12, 'Cosrx'),
       (13, 'SVR'),
       (14, 'Eucerin'),
       (15, 'LOREAL'),
       (16, 'BIODERMA'),
       (17, 'cocoon'),
       (18, 'Good Skin'),
       (19, 'COLORKEY');

-- Insert vào bảng images
INSERT INTO images (public_id) VALUES
                                   -- Bông tẩy trang
                                   ('bongtaytrang_2_lfnt20'),

                                   -- Kem chống nắng
                                   ('kemchongnang_1_bp0nn2'),
                                   ('kemchongnang_3_hokixh'),

                                   -- Kem dưỡng
                                   ('kemduong_2_ihc8k9'),
                                   ('kemduong_3_fsad8v'),

                                   -- Kem nền
                                   ('kemnen_1_hx31s3'),
                                   ('kemnen_2_cqauno'),
                                   ('kemnen_3_dixgtf'),

                                   -- Mặt nạ
                                   ('matna_6_ksq1v8'),
                                   ('matna_7_a8xpoa'),
                                   ('matna_8_ppxwv6'),
                                   ('matna_8_ppxwv6'),

                                   -- Serum
                                   ('serum_1_oqbjgm'),
                                   ('serum_2_czide8'),

                                   -- Sữa rửa mặt
                                   ('Suaruamat_1_tfufiu'),
                                   ('suaruamat_2_wjc1lo'),
                                   ('suaruamat_3_vyzhey'),
                                   ('suaruamat_4_d3tud0'),
                                   ('suaruamat_5_fnugul'),
                                   ('suaruamat_6_lu4q4u'),

                                   -- Toner
                                   ('toner_1_z6cly2'),
                                   ('toner_2_mtb6fa'),
                                   ('toner_3_ighub3'),
                                   ('toner_4_vsuxev'),

                                   -- Tẩy trang
                                   ('taytrang_1_uyqph1'),
                                   ('taytrang_2_rd7jan'),
                                   ('taytrang_3_mdcx6w'),
                                   ('taytrang_4_xx0afb'),
                                   ('taytrang_5_vkth95'),
                                   ('taytrang_6_am111n');

INSERT INTO product (id, name, description, brand_id, category_id, view_count)
VALUES
    (1, 'Nước tẩy trang L\'Oreal Paris Micellar Water 3-in-1', 'Nước tẩy trang dịu nhẹ với công nghệ Micellar, làm sạch lớp trang điểm và bụi bẩn hiệu quả, không gây khô da, phù hợp mọi loại da.', 15, 1, 0),
    (2, 'Nước tẩy trang Bioderma Sensibio H2O', 'Nước tẩy trang không cồn dành cho da nhạy cảm, làm sạch sâu mà vẫn giữ độ ẩm tự nhiên, được bác sĩ da liễu khuyên dùng.', 16, 1, 0),
    (3, 'Nước tẩy trang Cocoon', 'Nước tẩy trang thiên nhiên với chiết xuất hữu cơ, làm sạch da nhẹ nhàng, giảm dầu thừa mà không gây căng khô.', 17, 1, 0),
    (4, 'Nước tẩy trang hoa hồng Cocoon', 'Nước tẩy trang chứa chiết xuất hoa hồng hữu cơ, mang lại làn da sạch sẽ, tươi mát và thư giãn sau mỗi lần sử dụng.', 17, 1, 0),
    (5, 'Toner La-Roche Posay', 'Toner không cồn giúp cân bằng độ pH, làm dịu da nhạy cảm và chuẩn bị da sẵn sàng cho các bước dưỡng tiếp theo.', 6, 2, 0),
    (6, 'Toner Good Skins', 'Toner dịu nhẹ không paraben, dưỡng ẩm và làm sạch da, mang lại làn da mềm mại, rạng rỡ suốt cả ngày.', 18, 2, 0),
    (7, 'Toner Klairs', 'Toner không cồn với chiết xuất thực vật, làm dịu và cấp ẩm tức thì, lý tưởng cho da nhạy cảm cần phục hồi.', 9, 2, 0),
    (8, 'Sữa rửa mặt Cetaphil', 'Sữa rửa mặt không tạo bọt, làm sạch dịu nhẹ mà không làm mất độ ẩm, phù hợp cho da nhạy cảm và dễ kích ứng.', 10, 3, 0),
    (9, 'Sữa rửa mặt CeraVe', 'Sữa rửa mặt chứa ceramides, làm sạch da và hỗ trợ phục hồi hàng rào bảo vệ, lý tưởng cho da thường đến da khô.', 11, 3, 0),
    (10, 'Sữa rửa mặt SVR', 'Sữa rửa mặt không xà phòng, làm sạch sâu và kiểm soát dầu thừa, giúp da dầu luôn thông thoáng mà không khô ráp.', 13, 3, 0),
    (11, 'Cosrx Good Morning Gel', 'Gel rửa mặt chứa 0.5% BHA, làm sạch lỗ chân lông và ngăn ngừa mụn, hoàn hảo cho da dầu và da hỗn hợp.', 12, 3, 0),
    (12, 'Sữa rửa mặt La Roche-Posay', 'Sữa rửa mặt dành cho da dầu, làm sạch và giảm bóng nhờn hiệu quả, giữ da mịn màng mà không gây kích ứng.', 6, 3, 0),
    (13, 'Gel Rửa mặt Eucerin', 'Gel rửa mặt cho da dầu và mụn, làm sạch sâu, kiểm soát dầu và hỗ trợ giảm mụn với công thức không gây khô da.', 14, 3, 0),
    (14, 'Kem nền Maybelline', 'Kem nền che phủ tự nhiên, mịn nhẹ với đa dạng tông màu, mang lại lớp nền hoàn hảo cho makeup hàng ngày.', 7, 9, 0),
    (15, 'Mặt nạ Colorkey', 'Mặt nạ dưỡng ẩm chiết xuất thiên nhiên, cấp nước tức thì và làm dịu da, phù hợp cho mọi loại da cần tươi mới.', 19, 7, 0),
    (16, 'Kem chống nắng Centella', 'Kem chống nắng SPF 50+ chứa chiết xuất rau má, bảo vệ da khỏi tia UV và làm dịu da nhạy cảm hiệu quả.', 4, 4, 0),
    (17, 'KCN Pekah', 'Kem chống nắng vật lý SPF cao, bảo vệ da khỏi tia UV mà không gây kích ứng, lý tưởng cho da nhạy cảm và da dầu.', 2, 4, 0),
    (18, 'Bông tẩy trang Kokimi', 'Bông tẩy trang mềm mại, không xơ, hỗ trợ làm sạch da hiệu quả với thiết kế tiện lợi 240 miếng/túi.', 1, 5, 0),
    (19, 'Kem dưỡng La Roche-Posay', 'Kem dưỡng chứa niacinamide và vitamin C, giúp giảm thâm nám, dưỡng sáng da và cải thiện sắc tố rõ rệt.', 6, 6, 0),
    (20, 'Kem dưỡng La Roche-Posay đa công dụng', 'Kem dưỡng phục hồi đa năng, làm dịu và tái tạo da nhanh chóng, hoàn hảo cho da nhạy cảm sau điều trị.', 6, 6, 0);

-- Insert vào bảng productvariant
INSERT INTO productvariant (id, product_id, product_attribute, variant, price, quantity)
VALUES
    (1, 1, 'Tươi mát', '400ml', 171000, 300), -- Tẩy trang Loreal
    (2, 1, 'Làm sạch sâu', '400ml', 200000, 400), -- Tẩy trang Loreal
    (3, 2, 'Dành cho da nhạy cảm', '500ml', 335000, 500), -- Tẩy trang Bioderma
    (4, 2, 'Dành cho da hỗn hợp', '500ml', 335000, 100), -- Tẩy trang Bioderma
    (5, 3, 'Làm sạch & Giảm dầu', '500ml', 262000, 200), -- Tẩy trang cocoon
    (6, 4, 'Nước tẩy trang hoa hồng', '500ml', 250000, 150), -- Tẩy trang cocoon
    (7, 5, 'Dành cho da thường', '200ml', 404000, 400), -- Toner La-Roche Posay
    (8, 5, 'Dành cho da nhạy cảm', '200ml', 420000, 300), -- Toner La-Roche Posay
    (9, 6, 'Dịu nhẹ', '350ml', 145000, 250), -- Toner Good Skins
    (10, 7, 'Dành cho da nhạy cảm', '180ml', 218000, 500), -- Toner klairs
    (11, 8, 'Dành cho da nhạy cảm', '500ml', 289000, 600), -- SRM Cetaphil
    (12, 9, 'Dành cho da thường', '473ml', 326000, 420), -- SRM CeraVe
    (13, 10, 'Không chứa xà phòng cho da dầu', '400ml', 408000, 340), -- SRM SVR
    (14, 11, '0.5% BHA', '150ml', 117000, 200), -- Gel RM Cosrx Good Morning Gel
    (15, 12, 'Dành cho da dầu', '400ml', 394000, 520), -- SRM La Roche-Posay
    (16, 13, 'Dành cho da nhờn mụn', '400ml', 402000, 300), -- Gel RM Eucerin
    (17, 14, '110', '30ml', 158000, 300), -- Kem nền Maybelline 110
    (18, 14, '115', '30ml', 158000, 300), -- Kem nền Maybelline 115
    (19, 14, '125', '30ml', 158000, 300), -- Kem nền Maybelline 125
    (20, 15, 'Dưỡng ẩm sáng', '25ml', 10000, 300), -- Mặt nạ Colorkey
    (21, 15, 'Dưỡng ẩm căng bóng', '25ml', 12000, 300), -- Mặt nạ Colorkey
    (22, 15, 'Dưỡng ẩm dịu da thảo dược', '25ml', 12000, 300), -- Mặt nạ Colorkey
    (23, 15, 'Dưỡng ẩm ngừa mụn chiết xuất cây phỉ', '25ml', 11000, 300), -- Mặt nạ Colorkey
    (24, 16, 'Cho da nhạy cảm SPF 50+', '50ml', 236000, 300), -- KCN Centella
    (25, 17, 'Bảo vệ khỏi tia UV', '70ml', 249000, 300), -- KCN Pekah
    (26, 18, 'Túi vuông', '240 miếng', 52000, 300), -- BTT Kokimi
    (27, 19, 'Giảm thâm nám & dưỡng sáng', '40ml', 837000, 300), -- Kem dưỡng La Roche-Posay
    (28, 20, 'Phục hồi da đa công dụng', '100ml', 462000, 300); -- Kem dưỡng

-- Insert vào bảng productimage
INSERT INTO productimage (product_variant_id, image_id, main_image)
VALUES
    -- Tẩy trang (category_id=1, product_id=1,2,3,4)
    (1, 25, TRUE),   -- Tẩy trang Loreal - Tươi mát (product_id=1) -> taytrang_1_uyqph1
    (2, 26, FALSE),  -- Tẩy trang Loreal - Làm sạch sâu (product_id=1) -> taytrang_2_rd7jan
    (3, 27, TRUE),   -- Tẩy trang Bioderma - Da nhạy cảm (product_id=2) -> taytrang_3_mdcx6w
    (4, 28, FALSE),  -- Tẩy trang Bioderma - Da hỗn hợp (product_id=2) -> taytrang_4_xx0afb
    (5, 29, TRUE),   -- Tẩy trang Cocoon - Làm sạch & Giảm dầu (product_id=3) -> taytrang_5_vkth95
    (6, 30, TRUE),   -- Nước tẩy trang hoa hồng Cocoon (product_id=4) -> taytrang_6_am111n

    -- Toner (category_id=2, product_id=5,6,7)
    (7, 21, TRUE),   -- Toner La-Roche Posay - Da thường (product_id=5) -> toner_1_z6cly2
    (8, 23, FALSE),  -- Toner La-Roche Posay - Da nhạy cảm (product_id=5) -> toner_2_mtb6fa
    (9, 22, TRUE),   -- Toner Good Skins - Dịu nhẹ (product_id=6) -> toner_3_ighub3
    (10, 24, TRUE),  -- Toner Klairs - Da nhạy cảm (product_id=7) -> toner_4_vsuxev

    -- Sữa rửa mặt (category_id=3, product_id=8,9,10,11,12,13)
    (11, 15, TRUE),  -- SRM Cetaphil - Da nhạy cảm (product_id=8) -> Suaruamat_1_tfufiu
    (12, 16, TRUE),  -- SRM CeraVe - Da thường (product_id=9) -> suaruamat_2_wjc1lo
    (13, 19, TRUE),  -- SRM SVR - Da dầu (product_id=10) -> suaruamat_3_vyzhey
    (14, 17, TRUE),  -- Gel RM Cosrx - 0.5% BHA (product_id=11) -> suaruamat_4_d3tud0
    (15, 18, TRUE),  -- SRM La Roche-Posay - Da dầu (product_id=12) -> suaruamat_5_fnugul
    (16, 20, TRUE),  -- Gel RM Eucerin - Da nhờn mụn (product_id=13) -> suaruamat_6_lu4q4u

    -- Kem nền (category_id=9, product_id=14)
    (17, 6, TRUE),   -- Kem nền Maybelline - 110 (product_id=14) -> kemnen_1_hx31s3
    (18, 7, FALSE),  -- Kem nền Maybelline - 115 (product_id=14) -> kemnen_2_cqauno
    (19,8, FALSE),  -- Kem nền Maybelline - 125 (product_id=14) -> kemnen_3_dixgtf

    -- Mặt nạ (category_id=7, product_id=15)
    (20, 9, TRUE),  -- Mặt nạ Colorkey - Dưỡng ẩm sáng (product_id=15) -> matna_6_ksq1v8
    (21, 10, FALSE), -- Mặt nạ Colorkey - Dưỡng ẩm căng bóng (product_id=15) -> matna_7_a8xpoa
    (22, 11, FALSE), -- Mặt nạ Colorkey - Dưỡng ẩm dịu da (product_id=15) -> matna_8_ppxwv6
    (23, 12, FALSE), -- Mặt nạ Colorkey - Dưỡng ẩm ngừa mụn (product_id=15) -> matna_8_ppxwv6

    -- Kem chống nắng (category_id=4, product_id=16,17)
    (24, 2, TRUE),   -- KCN Centella - SPF 50+ (product_id=16) -> kemchongnang_1_bp0nn2
    (25, 3, TRUE),   -- KCN Pekah - Bảo vệ tia UV (product_id=17) -> kemchongnang_3_hokixh

    -- Bông tẩy trang (category_id=5, product_id=18)
    (26, 1, TRUE),   -- BTT Kokimi - Túi vuông (product_id=18) -> bongtaytrang_2_lfnt20

    -- Kem dưỡng (category_id=6, product_id=19,20)
    (27, 4, TRUE),   -- Kem dưỡng La Roche-Posay - Giảm thâm nám (product_id=19) -> kemduong_2_ihc8k9
    (28, 5, TRUE);   -- Kem dưỡng La Roche-Posay - Phục hồi da (product_id=20) -> kemduong_3_fsad8v

SELECT p.id AS product_id, pv.id AS variant_id, pi.id AS image_id, pi.main_image
FROM product p
         LEFT JOIN productvariant pv ON p.id = pv.product_id
         LEFT JOIN productimage pi ON pv.id = pi.product_variant_id
WHERE pi.main_image = TRUE;