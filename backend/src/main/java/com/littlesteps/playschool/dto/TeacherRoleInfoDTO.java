package com.littlesteps.playschool.dto;

import java.util.List;

public class TeacherRoleInfoDTO {
    private boolean classTeacher;
    private String classTeacherOfClassId;
    private String classTeacherOfClassName;
    private List<SubjectAssignment> subjectAssignments;

    public static class SubjectAssignment {
        private String classId;
        private String className;
        private String subjectId;
        private String subjectName;

        public SubjectAssignment() {
        }

        public SubjectAssignment(String classId, String className, String subjectId, String subjectName) {
            this.classId = classId;
            this.className = className;
            this.subjectId = subjectId;
            this.subjectName = subjectName;
        }

        public String getClassId() {
            return classId;
        }

        public void setClassId(String classId) {
            this.classId = classId;
        }

        public String getClassName() {
            return className;
        }

        public void setClassName(String className) {
            this.className = className;
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
    }

    public TeacherRoleInfoDTO() {
    }

    public boolean isClassTeacher() {
        return classTeacher;
    }

    public void setClassTeacher(boolean classTeacher) {
        this.classTeacher = classTeacher;
    }

    public String getClassTeacherOfClassId() {
        return classTeacherOfClassId;
    }

    public void setClassTeacherOfClassId(String classTeacherOfClassId) {
        this.classTeacherOfClassId = classTeacherOfClassId;
    }

    public String getClassTeacherOfClassName() {
        return classTeacherOfClassName;
    }

    public void setClassTeacherOfClassName(String classTeacherOfClassName) {
        this.classTeacherOfClassName = classTeacherOfClassName;
    }

    public List<SubjectAssignment> getSubjectAssignments() {
        return subjectAssignments;
    }

    public void setSubjectAssignments(List<SubjectAssignment> subjectAssignments) {
        this.subjectAssignments = subjectAssignments;
    }
}
