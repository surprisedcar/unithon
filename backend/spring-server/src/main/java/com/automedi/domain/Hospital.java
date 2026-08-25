package com.automedi.domain;

public record Hospital(
    String id,
    String code,
    String name,
    String area,
    double latitude,
    double longitude,
    boolean active
) {}

