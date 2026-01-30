package com.littlesteps.playschool.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Document(collection = "fee_structure")
public class FeeStructure {

    @Id
    private String id;

    private String className;

    private BigDecimal monthlyFee;

    private BigDecimal admissionFee;

    private BigDecimal activityFee;

    private BigDecimal transportFee;

    private BigDecimal mealFee;

    private Boolean active = true;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    // Constructors
    public FeeStructure() {
    }

    public FeeStructure(String className, BigDecimal monthlyFee, BigDecimal admissionFee,
            BigDecimal activityFee, BigDecimal transportFee, BigDecimal mealFee) {
        this.className = className;
        this.monthlyFee = monthlyFee;
        this.admissionFee = admissionFee;
        this.activityFee = activityFee;
        this.transportFee = transportFee;
        this.mealFee = mealFee;
        this.active = true;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public BigDecimal getMonthlyFee() {
        return monthlyFee;
    }

    public void setMonthlyFee(BigDecimal monthlyFee) {
        this.monthlyFee = monthlyFee;
    }

    public BigDecimal getAdmissionFee() {
        return admissionFee;
    }

    public void setAdmissionFee(BigDecimal admissionFee) {
        this.admissionFee = admissionFee;
    }

    public BigDecimal getActivityFee() {
        return activityFee;
    }

    public void setActivityFee(BigDecimal activityFee) {
        this.activityFee = activityFee;
    }

    public BigDecimal getTransportFee() {
        return transportFee;
    }

    public void setTransportFee(BigDecimal transportFee) {
        this.transportFee = transportFee;
    }

    public BigDecimal getMealFee() {
        return mealFee;
    }

    public void setMealFee(BigDecimal mealFee) {
        this.mealFee = mealFee;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}