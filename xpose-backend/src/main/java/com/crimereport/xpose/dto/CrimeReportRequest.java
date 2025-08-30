package com.crimereport.xpose.dto;

import java.util.List;

public class CrimeReportRequest {
    private int categoryId;
    private String categoryName;
    private String crimeType;
    private String description;
    private String place;
    private String state;
    private String district;
    private String policeStation;
    private List<String> files;

    public CrimeReportRequest() {}

    public CrimeReportRequest(int categoryId, String categoryName, String crimeType,
                              String description, String place, String state,
                              String district, String policeStation, List<String> files) {
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.crimeType = crimeType;
        this.description = description;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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