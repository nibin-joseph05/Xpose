package com.crimereport.xpose.dto;

public class CrimeTypeDTO {
    private Long id;
    private String name;
    private String description;
    private String priority;
    private boolean requiresImmediateAttention;
    private String createdAt;
    private Long categoryId;
    private String categoryName;


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public boolean isRequiresImmediateAttention() {
        return requiresImmediateAttention;
    }

    public void setRequiresImmediateAttention(boolean requiresImmediateAttention) {
        this.requiresImmediateAttention = requiresImmediateAttention;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }
}
