package com.littlesteps.playschool.security;

public class SchoolContext {
    private static final ThreadLocal<String> currentSchoolId = new ThreadLocal<>();

    public static void setSchoolId(String schoolId) {
        currentSchoolId.set(schoolId);
    }

    public static String getSchoolId() {
        return currentSchoolId.get();
    }

    public static void clear() {
        currentSchoolId.remove();
    }
}
