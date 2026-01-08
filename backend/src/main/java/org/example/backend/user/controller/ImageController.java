package org.example.backend.user.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.user.dto.ImageUploadResponse;
import org.example.backend.user.service.CloudinaryService;
import org.json.JSONObject;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/images")
public class ImageController {
    private final CloudinaryService cloudinaryService;

    @PostMapping("/upload")
    public ResponseEntity<ImageUploadResponse> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            String uploadResult = cloudinaryService.upLoadImage(file);
            JSONObject jsonResult = new JSONObject(uploadResult);
            return ResponseEntity.ok(new ImageUploadResponse(
                    jsonResult.getString("imageUrl"),
                    jsonResult.getString("publicId"),
                    "Image uploaded successfully"
            ));
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(new ImageUploadResponse(
                    null,
                    null,
                    "Failed to upload image: " + e.getMessage()
            ));
        }
    }
}