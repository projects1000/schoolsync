package com.littlesteps.playschool.dto;

public class ClassDTO {
    private String id;
    private String grade;
    private String section;
    private Integer capacity;
    private Boolean locked;
    private String room;

    public ClassDTO() {
    }

    public ClassDTO(String grade, String section, Integer capacity, String room) {
        this.grade = grade;
        this.section = section;
        this.capacity = capacity;
        this.room = room;
    }

    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public Boolean getLocked() {
        return locked;
    }

    public void setLocked(Boolean locked) {
        this.locked = locked;
    }

    public String getRoom() {
        return room;
    }

    public void setRoom(String room) {
        this.room = room;
    }

    private String classTeacherId;

    public String getClassTeacherId() {
        return classTeacherId;
    }

    public void setClassTeacherId(String classTeacherId) {
        this.classTeacherId = classTeacherId;
    }
}
