package com.crimereport.xpose.dto;

public class DistrictCoordinate {
    private String state;
    private String district;
    private double latitude;
    private double longitude;

    public DistrictCoordinate() {
    }

    public DistrictCoordinate(String state, String district, double latitude, double longitude) {
        this.state = state;
        this.district = district;
        this.latitude = latitude;
        this.longitude = longitude;
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

    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }
}
