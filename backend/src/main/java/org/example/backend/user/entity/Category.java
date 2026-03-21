<<<<<<< HEAD
package org.example.backend.user.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

@Table(name = "category")
public class Category {
    @Id
    private Long id;
    private String name;

}
=======
package org.example.backend.user.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

@Table(name = "category")
public class Category {
    @Id
    private Long id;
    private String name;

}
>>>>>>> 68ea31269c997b6a0ebcf59ee12b0c1134d0dc15
