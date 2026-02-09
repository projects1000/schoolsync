package com.littlesteps.playschool.dto;

import java.util.List;

public class ParentAcademicInfoDTO {
    private String childId;
    private String childName;
    private String className;
    private String section;
    private String classTeacherName;
    private List<SubjectTeacherInfo> subjects;

    public static class SubjectTeacherInfo {
        private String subjectId;
        private String subjectName;
        private String teacherId;
        private String teacherName;

        public SubjectTeacherInfo() {
        }

        public SubjectTeacherInfo(String subjectId, String subjectName, String teacherId, String teacherName) {
            this.subjectId = subjectId;
            this.subjectName = subjectName;
            this.teacherId = teacherId;
            this.teacherName = teacherName;
        }

        public String getSubjectId() {
            return subjectId;
        }

        public void setSubjectId(String subjectId) {
            this.subjectId = subjectId;
        }

        public String getSubjectName() {
            return subjectName;
        }

        public void setSubjectName(String subjectName) {
            this.subjectName = subjectName;
        }

        public String getTeacherId() {
            return teacherId;
        }

        public void setTeacherId(String teacherId) {
            this.teacherId = teacherId;
        }

        public String getTeacherName() {
            return teacherName;
        }

        public void setTeacherName(String teacherName) {
            this.teacherName = teacherName;
        }
    }

    public ParentAcademicInfoDTO() {
    }

    public String getChildId() {
        return childId;
    }

    public void setChildId(String childId) {
        this.childId = childId;
    }

    public String getChildName() {
        return childName;
    }

    public void setChildName(String childName) {
        this.childName = childName;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public String getClassTeacherName() {
        return classTeacherName;
    }

    public void setClassTeacherName(String classTeacherName) {
        this.classTeacherName = classTeacherName;
    }

    public List<SubjectTeacherInfo> getSubjects() {
        return subjects;
    }

    public void setSubjects(List<SubjectTeacherInfo> subjects) {
        this.subjects = subjects;
    }
}
