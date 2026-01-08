package org.example.backend.user.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "review")
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "commenter_name", length = 30)
    private String commenterName;

    @Column(name = "phonenumber_commenter", length = 15)
    private String phonenumberCommenter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(name = "rating", nullable = false)
    private Integer rating;

    @Lob
    @Column(name = "comment", nullable = false)
    private String comment;

    @Column(name = "date_created")
    private Instant dateCreated;

    @Column(name = "date_reply")
    private Instant dateReply;

    @Lob
    @Column(name = "response")
    private String response;

    @Column(name = "is_accept")
    private Boolean isAccept;

    @OneToMany(mappedBy = "review", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ReviewImage> images = new ArrayList<>();
}