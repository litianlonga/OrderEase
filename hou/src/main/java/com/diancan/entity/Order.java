package com.diancan.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class Order {
    private Integer id;
    private Integer userId;
    private BigDecimal totalPrice;
    private Integer status;
    private LocalDateTime createTime;
}