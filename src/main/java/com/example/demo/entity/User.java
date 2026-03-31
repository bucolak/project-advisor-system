package com.example.demo.entity;

import com.example.demo.enums.Role;
import com.example.demo.enums.UserStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, nullable = false)
    private String email;
    @Column(nullable = false)
    private String passwordHash;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;
    private String firstName;
    private String lastName;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status = UserStatus.ACTIVE;
    @Column(nullable = false)
    private Boolean isDeleted = false;
    private LocalDateTime createdAt = LocalDateTime.now();

    public User() {}

    public static UserBuilder builder() { return new UserBuilder(); }

    public static class UserBuilder {
        private String email, passwordHash, firstName, lastName;
        private Role role;
        private UserStatus status = UserStatus.ACTIVE;
        private Boolean isDeleted = false;
        public UserBuilder email(String v) { this.email = v; return this; }
        public UserBuilder passwordHash(String v) { this.passwordHash = v; return this; }
        public UserBuilder firstName(String v) { this.firstName = v; return this; }
        public UserBuilder lastName(String v) { this.lastName = v; return this; }
        public UserBuilder role(Role v) { this.role = v; return this; }
        public UserBuilder status(UserStatus v) { this.status = v; return this; }
        public UserBuilder isDeleted(Boolean v) { this.isDeleted = v; return this; }
        public User build() {
            User u = new User();
            u.email = this.email; u.passwordHash = this.passwordHash;
            u.firstName = this.firstName; u.lastName = this.lastName;
            u.role = this.role; u.status = this.status; u.isDeleted = this.isDeleted;
            return u;
        }
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public Role getRole() { return role; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public UserStatus getStatus() { return status; }
    public Boolean getIsDeleted() { return isDeleted; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setStatus(UserStatus v) { this.status = v; }
    public void setIsDeleted(Boolean v) { this.isDeleted = v; }
    public void setEmail(String v) { this.email = v; }
    public void setPasswordHash(String v) { this.passwordHash = v; }
    public void setRole(Role v) { this.role = v; }
    public void setFirstName(String v) { this.firstName = v; }
    public void setLastName(String v) { this.lastName = v; }
}
