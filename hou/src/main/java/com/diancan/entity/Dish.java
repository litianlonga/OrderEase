package com.diancan.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class Dish {
    private Integer id;
    private String name;
    private BigDecimal price;
    private String category;
    private String description;
    private LocalDateTime createTime;
}