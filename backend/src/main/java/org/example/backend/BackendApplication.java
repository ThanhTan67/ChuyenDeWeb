package org.example.backend;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {
    public static void main(String[] args) {
        // Load file .env từ thư mục backend
        Dotenv dotenv = Dotenv.configure()
                .directory("backend")
                .load();

        // Đưa tất cả biến từ .env vào System properties để Spring Boot đọc được
        dotenv.entries().forEach(entry ->
                System.setProperty(entry.getKey(), entry.getValue())
        );

        SpringApplication.run(BackendApplication.class, args);
    }
}
//@SpringBootApplication
//public class BackendApplication {
//    public static void main(String[] args) {
//        SpringApplication.run(BackendApplication.class, args);
//    }
//}