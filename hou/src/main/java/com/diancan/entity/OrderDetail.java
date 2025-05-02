package com.diancan.entity;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class OrderDetail {
    private Integer id;
    private Integer orderId;
    private Integer dishId;
    private Integer quantity;
    private BigDecimal price;
}