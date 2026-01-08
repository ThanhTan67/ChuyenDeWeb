package org.example.backend.user.dto;

public class ForgotPasswordRequest {
    private String email;
    private String frontendUrl;

    public ForgotPasswordRequest() {}

    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }

    public String getFrontendUrl() {
        return frontendUrl;
    }
    public void setFrontendUrl(String frontendUrl) {
        this.frontendUrl = frontendUrl;
    }
}
