package org.example.backend;

<<<<<<< HEAD
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
=======
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

//@SpringBootApplication
//public class BackendApplication {
//    public static void main(String[] args) {
//        // Load file .env từ thư mục backend
//        Dotenv dotenv = Dotenv.configure()
//                .directory("backend")
//                .load();
//
//        // Đưa tất cả biến từ .env vào System properties để Spring Boot đọc được
//        dotenv.entries().forEach(entry ->
//                System.setProperty(entry.getKey(), entry.getValue())
//        );
//
//        SpringApplication.run(BackendApplication.class, args);
//    }
//}
@SpringBootApplication
public class BackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }
}
>>>>>>> 68ea31269c997b6a0ebcf59ee12b0c1134d0dc15
