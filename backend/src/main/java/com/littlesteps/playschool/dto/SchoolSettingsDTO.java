package com.littlesteps.playschool.dto;

public class SchoolSettingsDTO {
    private Long id;
    private String schoolName;
    private String schoolAddress;
    private String schoolPhone;
    private String schoolEmail;
    private String schoolWebsite;
    private Boolean emailNotifications;
    private Boolean smsNotifications;
    private Boolean pushNotifications;
    private String theme;
    private String language;
    private String academicYear;
    private String currency;
    private String timezone;

    // Constructors
    public SchoolSettingsDTO() {}

    public SchoolSettingsDTO(Long id, String schoolName, String schoolAddress, 
                            String schoolPhone, String schoolEmail, String schoolWebsite,
                            Boolean emailNotifications, Boolean smsNotifications, 
                            Boolean pushNotifications, String theme, String language,
                            String academicYear, String currency, String timezone) {
        this.id = id;
        this.schoolName = schoolName;
        this.schoolAddress = schoolAddress;
        this.schoolPhone = schoolPhone;
        this.schoolEmail = schoolEmail;
        this.schoolWebsite = schoolWebsite;
        this.emailNotifications = emailNotifications;
        this.smsNotifications = smsNotifications;
        this.pushNotifications = pushNotifications;
        this.theme = theme;
        this.language = language;
        this.academicYear = academicYear;
        this.currency = currency;
        this.timezone = timezone;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSchoolName() { return schoolName; }
    public void setSchoolName(String schoolName) { this.schoolName = schoolName; }

    public String getSchoolAddress() { return schoolAddress; }
    public void setSchoolAddress(String schoolAddress) { this.schoolAddress = schoolAddress; }

    public String getSchoolPhone() { return schoolPhone; }
    public void setSchoolPhone(String schoolPhone) { this.schoolPhone = schoolPhone; }

    public String getSchoolEmail() { return schoolEmail; }
    public void setSchoolEmail(String schoolEmail) { this.schoolEmail = schoolEmail; }

    public String getSchoolWebsite() { return schoolWebsite; }
    public void setSchoolWebsite(String schoolWebsite) { this.schoolWebsite = schoolWebsite; }

    public Boolean getEmailNotifications() { return emailNotifications; }
    public void setEmailNotifications(Boolean emailNotifications) { this.emailNotifications = emailNotifications; }

    public Boolean getSmsNotifications() { return smsNotifications; }
    public void setSmsNotifications(Boolean smsNotifications) { this.smsNotifications = smsNotifications; }

    public Boolean getPushNotifications() { return pushNotifications; }
    public void setPushNotifications(Boolean pushNotifications) { this.pushNotifications = pushNotifications; }

    public String getTheme() { return theme; }
    public void setTheme(String theme) { this.theme = theme; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }
}