package com.littlesteps.playschool.dto;

public class SchoolUpdateDTO {
    private String timings;
    private String phone;
    private String email;
    private String logo;
    private String address;
    private String city;
    private String state;
    private String pincode;

    public SchoolUpdateDTO() {
    }

    public SchoolUpdateDTO(String timings, String phone, String email, String logo, String address, String city,
            String state, String pincode) {
        this.timings = timings;
        this.phone = phone;
        this.email = email;
        this.logo = logo;
        this.address = address;
        this.city = city;
        this.state = state;
        this.pincode = pincode;
    }

    public String getTimings() {
        return timings;
    }

    public void setTimings(String timings) {
        this.timings = timings;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getLogo() {
        return logo;
    }

    public void setLogo(String logo) {
        this.logo = logo;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }
}
