package com.diancan.controller;

import com.diancan.entity.Order;
import com.diancan.entity.OrderDetail;
import com.alibaba.fastjson.JSON;  // 添加这行
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

import java.math.BigDecimal;  // 添加这个导入

@RestController
@RequestMapping("/order")
@CrossOrigin  // 添加跨域注解
public class OrderController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostMapping("/create")
    @Transactional
    public Map<String, Object> create(@RequestBody Map<String, Object> orderInfo) {
        Map<String, Object> result = new HashMap<>();
        
        // 创建订单
        String orderSql = "INSERT INTO orders (user_id, total_price) VALUES (?, ?)";
        jdbcTemplate.update(orderSql, 
            orderInfo.get("userId"), 
            orderInfo.get("totalPrice")
        );
        
        // 获取订单ID
        Integer orderId = jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Integer.class);
        
        // 创建订单详情
        String detailSql = "INSERT INTO order_detail (order_id, dish_id, quantity, price) VALUES (?, ?, ?, ?)";
        List<Map<String, Object>> items = (List<Map<String, Object>>) orderInfo.get("items");
        for (Map<String, Object> item : items) {
            jdbcTemplate.update(detailSql,
                orderId,
                item.get("dishId"),
                item.get("quantity"),
                item.get("price")
            );
        }
        
        result.put("code", 200);
        result.put("msg", "下单成功");
        result.put("orderId", orderId);
        return result;
    }

    @GetMapping("/list")
    public Map<String, Object> list(@RequestParam Integer userId) {
        Map<String, Object> result = new HashMap<>();
        String sql = "SELECT * FROM orders WHERE user_id = ? ORDER BY create_time DESC";
        List<Map<String, Object>> orders = jdbcTemplate.queryForList(sql, userId);
        result.put("code", 200);
        result.put("data", orders);
        return result;
    }

    @GetMapping("/detail")
        public Map<String, Object> getOrderDetail(@RequestParam Integer orderId) {
            Map<String, Object> result = new HashMap<>();
            
            String sql = "SELECT od.*, d.name as dish_name FROM order_detail od " +
                        "LEFT JOIN dish d ON od.dish_id = d.id " +
                        "WHERE od.order_id = ?";
            List<Map<String, Object>> details = jdbcTemplate.queryForList(sql, orderId);
            
            result.put("code", 200);
            result.put("data", details);
            return result;
        }

    @DeleteMapping("/delete")
        @Transactional
        public Map<String, Object> deleteOrder(@RequestParam Integer orderId) {
            Map<String, Object> result = new HashMap<>();
            
            // 删除订单详情
            String deleteDetailSql = "DELETE FROM order_detail WHERE order_id = ?";
            jdbcTemplate.update(deleteDetailSql, orderId);
            
            // 删除订单
            String deleteOrderSql = "DELETE FROM orders WHERE id = ?";
            jdbcTemplate.update(deleteOrderSql, orderId);
            
            result.put("code", 200);
            result.put("msg", "删除成功");
            return result;
        }

    @PostMapping("/addDishes")
        @Transactional
        public Map<String, Object> addDishes(@RequestBody Map<String, Object> orderInfo) {
            Map<String, Object> result = new HashMap<>();
            
            try {
                // 修正类型转换
                Integer orderId = Integer.parseInt(orderInfo.get("orderId").toString());
                BigDecimal additionalPrice = new BigDecimal(orderInfo.get("totalPrice").toString());
                
                // 更新订单总价
                String updateOrderSql = "UPDATE orders SET total_price = total_price + ? WHERE id = ?";
                jdbcTemplate.update(updateOrderSql, additionalPrice, orderId);
                
                // 添加新的订单详情
                String detailSql = "INSERT INTO order_detail (order_id, dish_id, quantity, price) VALUES (?, ?, ?, ?)";
                List<Map<String, Object>> items = (List<Map<String, Object>>) orderInfo.get("items");
                for (Map<String, Object> item : items) {
                    jdbcTemplate.update(detailSql,
                        orderId,
                        Integer.parseInt(item.get("dishId").toString()),
                        Integer.parseInt(item.get("quantity").toString()),
                        new BigDecimal(item.get("price").toString())
                    );
                }
                
                result.put("code", 200);
                result.put("msg", "加菜成功");
            } catch (Exception e) {
                e.printStackTrace();  // 添加错误日志
                result.put("code", 500);
                result.put("msg", "加菜失败：" + e.getMessage());
            }
            
            return result;
        }

    @DeleteMapping("/dish/delete")  // 修改路径
    @Transactional
    public Map<String, Object> deleteDish(@RequestParam Integer orderDetailId, @RequestParam Integer orderId) {
        Map<String, Object> result = new HashMap<>();
        try {
            // 获取要删除的菜品价格
            String getPriceSql = "SELECT price * quantity as total FROM order_detail WHERE id = ?";
            BigDecimal dishTotal = jdbcTemplate.queryForObject(getPriceSql, BigDecimal.class, orderDetailId);
            
            // 更新订单总价
            String updateOrderSql = "UPDATE orders SET total_price = total_price - ? WHERE id = ?";
            jdbcTemplate.update(updateOrderSql, dishTotal, orderId);
            
            // 删除菜品
            String deleteSql = "DELETE FROM order_detail WHERE id = ?";
            jdbcTemplate.update(deleteSql, orderDetailId);
            
            result.put("code", 200);
            result.put("msg", "删除成功");
        } catch (Exception e) {
            e.printStackTrace();
            result.put("code", 500);
            result.put("msg", "删除失败：" + e.getMessage());
        }
        return result;
    }

    @PostMapping("/pay")
    public Map<String, Object> pay(@RequestBody Map<String, Object> payInfo) {
        Map<String, Object> result = new HashMap<>();
        try {
            // 更新订单状态
            String updateOrderSql = "UPDATE orders SET status = 1 WHERE id = ?";
            jdbcTemplate.update(updateOrderSql, payInfo.get("orderId"));
    
            // 获取订单详情
            String orderSql = "SELECT o.*, od.* FROM orders o " +
                             "LEFT JOIN order_detail od ON o.id = od.order_id " +
                             "WHERE o.id = ?";
            Map<String, Object> order = jdbcTemplate.queryForMap(orderSql, payInfo.get("orderId"));
    
            // 保存到历史订单表
            String historySql = "INSERT INTO order_history (order_id, user_id, total_price, items) " +
                               "VALUES (?, ?, ?, ?)";
            jdbcTemplate.update(historySql,
                order.get("id"),
                order.get("user_id"),
                order.get("total_price"),
                JSON.toJSONString(order)  // 将订单详情转为JSON字符串存储
            );
    
            result.put("code", 200);
            result.put("msg", "支付成功");
        } catch (Exception e) {
            result.put("code", 500);
            result.put("msg", "支付失败：" + e.getMessage());
        }
        return result;
    }

    // 添加获取历史订单的接口
    @GetMapping("/history")
    public Map<String, Object> getHistoryOrders(@RequestParam Integer userId) {
        Map<String, Object> result = new HashMap<>();
        try {
            String sql = "SELECT o.*, " +
                        "GROUP_CONCAT(CONCAT(d.name, ':', od.quantity, ':', od.price) SEPARATOR ',') as items " +
                        "FROM orders o " +
                        "LEFT JOIN order_detail od ON o.id = od.order_id " +
                        "LEFT JOIN dish d ON od.dish_id = d.id " +
                        "WHERE o.user_id = ? AND o.status = 1 " +
                        "GROUP BY o.id " +
                        "ORDER BY o.create_time DESC";
            
            List<Map<String, Object>> orders = jdbcTemplate.queryForList(sql, userId);
            result.put("code", 200);
            result.put("data", orders);
        } catch (Exception e) {
            result.put("code", 500);
            result.put("msg", "获取历史订单失败：" + e.getMessage());
        }
        return result;
    }
}