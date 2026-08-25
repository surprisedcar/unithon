package com.automedi.domain;

public class Student {
    private final String id;
    private final String studentNumber;
    private final String name;
    private final String university;
    private final String department;
    private final int grade;
    private boolean automaticTransferConsent;
    private boolean pushNotificationEnabled;

    public Student(String id, String studentNumber, String name, String university, String department, int grade) {
        this.id = id;
        this.studentNumber = studentNumber;
        this.name = name;
        this.university = university;
        this.department = department;
        this.grade = grade;
        this.automaticTransferConsent = true;
        this.pushNotificationEnabled = true;
    }

    public String id() { return id; }
    public String studentNumber() { return studentNumber; }
    public String name() { return name; }
    public String university() { return university; }
    public String department() { return department; }
    public int grade() { return grade; }
    public boolean automaticTransferConsent() { return automaticTransferConsent; }
    public boolean pushNotificationEnabled() { return pushNotificationEnabled; }

    public void updatePreferences(boolean automaticTransferConsent, boolean pushNotificationEnabled) {
        this.automaticTransferConsent = automaticTransferConsent;
        this.pushNotificationEnabled = pushNotificationEnabled;
    }
}

