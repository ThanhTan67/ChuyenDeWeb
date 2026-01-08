package org.example.backend.user.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Getter
@Setter
@ToString
@Entity
@Table(name = "log")
public class Log {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "timestamp", updatable = false)
    @CreationTimestamp
    private Instant timestamp;

    @Column(name = "log_level", length = 30)
    private String logLevel;

    @Column(name = "module", length = 50)
    private String module;

    @Column(name = "action_type", length = 50)
    private String actionType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "log_content", length = 300)
    private String logContent;

    @Column(name = "source_ip", length = 45)
    private String sourceIp;

    @Column(name = "user_agent")
    private String userAgent;

    @Column(name = "affected_table", length = 50)
    private String affectedTable;

    @Lob
    @Column(name = "before_data")
    private String beforeData;

    @Lob
    @Column(name = "after_data")
    private String afterData;

    @Lob
    @Column(name = "nationality")
    private String nationality;
}
