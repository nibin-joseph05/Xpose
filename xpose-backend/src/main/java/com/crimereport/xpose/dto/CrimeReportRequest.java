package com.crimereport.xpose.dto;

import java.util.List;

public class CrimeReportRequest {
    private int categoryId;
    private String categoryName;
    private String crimeType;
    private Integer crimeTypeId;
    private String description;
    private String translatedDescription;
    private String place;
    private String state;
    private String district;
    private String policeStation;
    private List<String> files;
    private Double latitude;
    private Double longitude;

    public CrimeReportRequest() {}

    public CrimeReportRequest(int categoryId, String categoryName, String crimeType,
                              String description, String translatedDescription, String place, String state,
                              String district, String policeStation, List<String> files) {
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.crimeType = crimeType;
        this.description = description;
        this.translatedDescription = translatedDescription;
        this.place = place;
        this.state = state;
        this.district = district;
        this.policeStation = policeStation;
        this.files = files;
    }

    public int getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(int categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getCrimeType() {
        return crimeType;
    }

    public void setCrimeType(String crimeType) {
        this.crimeType = crimeType;
    }

    public Integer getCrimeTypeId() {
        return crimeTypeId;
    }
    public void setCrimeTypeId(Integer crimeTypeId) {
        this.crimeTypeId = crimeTypeId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTranslatedDescription() { return translatedDescription; }
    public void setTranslatedDescription(String translatedDescription) {
        this.translatedDescription = translatedDescription;
    }

    public String getPlace() {
        return place;
    }

    public void setPlace(String place) {
        this.place = place;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getPoliceStation() {
        return policeStation;
    }

    public void setPoliceStation(String policeStation) {
        this.policeStation = policeStation;
    }

    public List<String> getFiles() {
        return files;
    }

    public void setFiles(List<String> files) {
        this.files = files;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    @Override
    public String toString() {
        return "CrimeReportRequest{" +
                "categoryId=" + categoryId +
                ", categoryName='" + categoryName + '\'' +
                ", crimeType='" + crimeType + '\'' +
                ", description='" + description + '\'' +
                ", place='" + place + '\'' +
                ", state='" + state + '\'' +
                ", district='" + district + '\'' +
                ", policeStation='" + policeStation + '\'' +
                ", files=" + files +
                '}';
    }
}