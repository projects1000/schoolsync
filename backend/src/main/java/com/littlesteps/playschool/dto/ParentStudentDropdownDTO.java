package com.littlesteps.playschool.dto;

public class ParentStudentDropdownDTO {
    private String parentUserId;
    private String studentId;
    private String label; // "Student Name (Parent Name)"

    public ParentStudentDropdownDTO(String parentUserId, String studentId, String label) {
        this.parentUserId = parentUserId;
        this.studentId = studentId;
        this.label = label;
    }

    public String getParentUserId() {
        return parentUserId;
    }

    public void setParentUserId(String parentUserId) {
        this.parentUserId = parentUserId;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }
}
