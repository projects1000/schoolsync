package com.littlesteps.playschool.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminSummary {
    private String id;
    private String name;
    private String email;
}
