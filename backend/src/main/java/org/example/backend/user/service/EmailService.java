package org.example.backend.user.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.example.backend.user.entity.Order;
import org.example.backend.user.entity.OrderDetail;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.from}")
    private String fromEmail;

    @Async("emailExecutor")
    public void sendSimpleMessage(String to, String subject, String text) {
        try {
            var message = new org.springframework.mail.SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            logger.info("Sent simple email to: {}", to);
        } catch (Exception e) {
            logger.error("Failed to send simple email to {}: {}", to, e.getMessage(), e);
        }
    }

    @Async("emailExecutor")
    public void sendMimeMessage(String to, String subject, String htmlContent) throws MessagingException {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true = isHtml
            mailSender.send(message);
            logger.info("Sent MIME email to: {}", to);
        } catch (MessagingException e) {
            logger.error("Failed to send MIME email to {}: {}", to, e.getMessage(), e);
            throw e;
        }
    }

    @Async("emailExecutor")
    public void sendBatchMessages(List<EmailMessage> messages) {
        try {
            var mailMessages = messages.stream()
                    .map(email -> {
                        var message = new org.springframework.mail.SimpleMailMessage();
                        message.setFrom(fromEmail);
                        message.setTo(email.getTo());
                        message.setSubject(email.getSubject());
                        message.setText(email.getText());
                        return message;
                    })
                    .toArray(org.springframework.mail.SimpleMailMessage[]::new);

            mailSender.send(mailMessages);
            logger.info("Sent batch emails to: {}", messages.stream().map(EmailMessage::getTo).toList());
        } catch (Exception e) {
            logger.error("Failed to send batch emails: {}", e.getMessage(), e);
        }
    }

    @Async("emailExecutor")
    public void sendOrderConfirmationEmail(Order order) throws MessagingException {
        try {
            if (order.getUser() == null || order.getUser().getEmail() == null) {
                logger.error("Cannot send email for order #{}: User or email is null", order.getId());
                throw new MessagingException("User or email is null");
            }

            String to = order.getUser().getEmail();
            String subject = "Xác nhận đơn hàng #" + order.getId();

            // Force load lazy relations nếu cần
            if (order.getOrderDetails() != null) {
                order.getOrderDetails().forEach(detail -> {
                    if (detail.getVariant() != null) {
                        detail.getVariant().getVariant(); // trigger load
                        if (detail.getVariant().getProduct() != null) {
                            detail.getVariant().getProduct().getName(); // trigger load
                        }
                    }
                });
            }

            String htmlContent = buildOrderConfirmationHtml(order);
            sendMimeMessage(to, subject, htmlContent);
            logger.info("Sent order confirmation email for order #{}", order.getId());
        } catch (Exception e) {
            logger.error("Failed to send order confirmation email for order #{}: {}", order.getId(), e.getMessage(), e);
            throw e instanceof MessagingException ? (MessagingException) e : new MessagingException("Failed to send order confirmation email", e);
        }
    }

    private String buildOrderConfirmationHtml(Order order) {
        NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

        StringBuilder itemsHtml = new StringBuilder();
        List<OrderDetail> orderDetails = order.getOrderDetails();

        if (orderDetails == null || orderDetails.isEmpty()) {
            logger.warn("Order #{} has no order details", order.getId());
            itemsHtml.append("<tr><td colspan='3'>Không có chi tiết đơn hàng</td></tr>");
        } else {
            for (OrderDetail detail : orderDetails) {
                String productName = (detail.getVariant() != null && detail.getVariant().getProduct() != null)
                        ? detail.getVariant().getProduct().getName() : "Sản phẩm không xác định";

                String attribute = (detail.getVariant() != null && detail.getVariant().getProductAttribute() != null)
                        ? detail.getVariant().getProductAttribute() : "";

                String variant = (detail.getVariant() != null && detail.getVariant().getVariant() != null)
                        ? detail.getVariant().getVariant() : "Biến thể không xác định";

                BigDecimal price = detail.getProductPrice() != null ? detail.getProductPrice() : BigDecimal.ZERO;

                itemsHtml.append(String.format(
                        "<tr>" +
                                "<td style='padding: 8px; border: 1px solid #ddd;'>%s - %s (%s)</td>" +
                                "<td style='padding: 8px; border: 1px solid #ddd; text-align: center;'>%d</td>" +
                                "<td style='padding: 8px; border: 1px solid #ddd; text-align: right;'>%s</td>" +
                                "</tr>",
                        productName, variant, attribute, detail.getQuantity(), currencyFormat.format(price)
                ));
            }
        }

        String username = order.getUser() != null && order.getUser().getUsername() != null
                ? order.getUser().getUsername() : "Khách hàng";

        String bookingDate = order.getBookingDate() != null
                ? LocalDateTime.ofInstant(order.getBookingDate(), ZoneId.systemDefault()).format(dateFormatter)
                : "Không xác định";

        String paymentMethod = order.getPayment() != null && order.getPayment().getMethodName() != null
                ? order.getPayment().getMethodName() : "Không xác định";

        BigDecimal ship = order.getShip() != null ? order.getShip() : BigDecimal.ZERO;
        BigDecimal discount = order.getDiscountValue() != null ? order.getDiscountValue() : BigDecimal.ZERO;
        BigDecimal total = order.getTotalMoney() != null ? order.getTotalMoney() : BigDecimal.ZERO;

        String consigneeName = order.getConsigneeName() != null ? order.getConsigneeName() : "Không xác định";
        String consigneePhone = order.getConsigneePhone() != null ? order.getConsigneePhone() : "Không xác định";
        String address = order.getAddress() != null ? order.getAddress() : "Không xác định";

        return String.format(
                "<html>" +
                        "<body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>" +
                        "<h2 style='color: #2c3e50;'>Xác nhận đơn hàng</h2>" +
                        "<p>Xin chào %s,</p>" +
                        "<p>Cảm ơn quý khách đã đặt hàng! Dưới đây là thông tin chi tiết đơn hàng:</p>" +
                        "<h3>Thông tin đơn hàng</h3>" +
                        "<p><strong>Mã đơn hàng:</strong> #%d</p>" +
                        "<p><strong>Ngày đặt hàng:</strong> %s</p>" +
                        "<p><strong>Phương thức thanh toán:</strong> %s</p>" +
                        "<h3>Chi tiết sản phẩm</h3>" +
                        "<table style='width: 100%%; border-collapse: collapse;'>" +
                        "<thead>" +
                        "<tr style='background-color: #f2f2f2;'>" +
                        "<th style='padding: 8px; border: 1px solid #ddd; text-align: left;'>Sản phẩm</th>" +
                        "<th style='padding: 8px; border: 1px solid #ddd;'>Số lượng</th>" +
                        "<th style='padding: 8px; border: 1px solid #ddd;'>Giá</th>" +
                        "</tr>" +
                        "</thead>" +
                        "<tbody>%s</tbody>" +
                        "</table>" +
                        "<h3>Tổng cộng</h3>" +
                        "<p><strong>Phí vận chuyển:</strong> %s</p>" +
                        "<p><strong>Giảm giá:</strong> %s</p>" +
                        "<p><strong>Tổng tiền:</strong> %s</p>" +
                        "<h3>Thông tin giao hàng</h3>" +
                        "<p><strong>Người nhận:</strong> %s</p>" +
                        "<p><strong>Số điện thoại:</strong> %s</p>" +
                        "<p><strong>Địa chỉ:</strong> %s</p>" +
                        "<p>Chúng tôi sẽ cập nhật trạng thái đơn hàng qua email. Nếu có thắc mắc, vui lòng liên hệ support.</p>" +
                        "<p>Trân trọng,<br>Đội ngũ cửa hàng</p>" +
                        "</body>" +
                        "</html>",
                username, order.getId(), bookingDate, paymentMethod,
                itemsHtml.toString(),
                currencyFormat.format(ship),
                currencyFormat.format(discount),
                currencyFormat.format(total),
                consigneeName, consigneePhone, address
        );
    }

    public static class EmailMessage {
        private String to;
        private String subject;
        private String text;

        public EmailMessage(String to, String subject, String text) {
            this.to = to;
            this.subject = subject;
            this.text = text;
        }

        public String getTo() { return to; }
        public String getSubject() { return subject; }
        public String getText() { return text; }
    }
}