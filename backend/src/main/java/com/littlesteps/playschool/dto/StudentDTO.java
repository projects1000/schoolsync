package com.littlesteps.playschool.dto;

public class StudentDTO {
    private String id;
    private String admissionNo;
    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.READ_ONLY)
    private Integer rollNo;
    private String name;
    private Integer age;
    private String className;
    private String classId;
    private String sectionId;
    private String guardian;
    private String guardianPhone;
    private String guardianEmail;
    private String address;
    private String status;

    // Profile fields
    private String dateOfBirth;
    private String gender;
    private String bloodGroup;
    private Boolean newToEducation;
    private String previousSchool;
    private String previousClass;
    private String previousPercentage;
    private String medicalConditions;
    private String transportMode;
    private Boolean profileCompleted;

    // Constructors
    public StudentDTO() {
    }

    public StudentDTO(String id, String admissionNo, Integer rollNo, String name, Integer age,
            String className, String guardian, String guardianPhone,
            String guardianEmail, String address, String status) {
        this.id = id;
        this.admissionNo = admissionNo;
        this.rollNo = rollNo;
        this.name = name;
        this.age = age;
        this.className = className;
        this.guardian = guardian;
        this.guardianPhone = guardianPhone;
        this.guardianEmail = guardianEmail;
        this.address = address;
        this.status = status;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getAdmissionNo() {
        return admissionNo;
    }

    public void setAdmissionNo(String admissionNo) {
        this.admissionNo = admissionNo;
    }

    public Integer getRollNo() {
        return rollNo;
    }

    public void setRollNo(Integer rollNo) {
        this.rollNo = rollNo;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public String getClassId() {
        return classId;
    }

    public void setClassId(String classId) {
        this.classId = classId;
    }

    public String getSectionId() {
        return sectionId;
    }

    public void setSectionId(String sectionId) {
        this.sectionId = sectionId;
    }

    public String getGuardian() {
        return guardian;
    }

    public void setGuardian(String guardian) {
        this.guardian = guardian;
    }

    public String getGuardianPhone() {
        return guardianPhone;
    }

    public void setGuardianPhone(String guardianPhone) {
        this.guardianPhone = guardianPhone;
    }

    public String getGuardianEmail() {
        return guardianEmail;
    }

    public void setGuardianEmail(String guardianEmail) {
        this.guardianEmail = guardianEmail;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(String dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getBloodGroup() {
        return bloodGroup;
    }

    public void setBloodGroup(String bloodGroup) {
        this.bloodGroup = bloodGroup;
    }

    public Boolean getNewToEducation() {
        return newToEducation;
    }

    public void setNewToEducation(Boolean newToEducation) {
        this.newToEducation = newToEducation;
    }

    public String getPreviousSchool() {
        return previousSchool;
    }

    public void setPreviousSchool(String previousSchool) {
        this.previousSchool = previousSchool;
    }

    public String getPreviousClass() {
        return previousClass;
    }

    public void setPreviousClass(String previousClass) {
        this.previousClass = previousClass;
    }

    public String getPreviousPercentage() {
        return previousPercentage;
    }

    public void setPreviousPercentage(String previousPercentage) {
        this.previousPercentage = previousPercentage;
    }

    public String getMedicalConditions() {
        return medicalConditions;
    }

    public void setMedicalConditions(String medicalConditions) {
        this.medicalConditions = medicalConditions;
    }

    public String getTransportMode() {
        return transportMode;
    }

    public void setTransportMode(String transportMode) {
        this.transportMode = transportMode;
    }

    public Boolean getProfileCompleted() {
        return profileCompleted;
    }

    public void setProfileCompleted(Boolean profileCompleted) {
        this.profileCompleted = profileCompleted;
    }
}