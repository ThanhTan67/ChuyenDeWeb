package org.example.backend.user.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;

@Getter
@Setter
@Data
@Entity
@Table(name = "user")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "username", nullable = false, length = 32)
    private String username;

    @Column(name = "password", nullable = false, length = 300)
    private String password;

    @Column(name = "email")
    private String email;

    @Column(name = "phone", length = 15)
    private String phone;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @ColumnDefault("0")
    @Column(name = "failed", nullable = false)
    private Integer failed = 0; // Khởi tạo giá trị mặc định trong code

    @ColumnDefault("false")
    @Column(name = "locked", nullable = false)
    private Boolean locked = false; // Khởi tạo giá trị mặc định trong code

    @Column(name = "lock_time")
    private Instant lockTime;

    @Column(length = 512)
    private String tokenVersion;
}