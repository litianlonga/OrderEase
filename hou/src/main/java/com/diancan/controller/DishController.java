package com.diancan.controller;

import com.diancan.entity.Dish;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/dish")
public class DishController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/list")
    public Map<String, Object> list() {
        Map<String, Object> result = new HashMap<>();
        String sql = "SELECT * FROM dish ORDER BY category, id";
        List<Map<String, Object>> dishes = jdbcTemplate.queryForList(sql);
        result.put("code", 200);
        result.put("data", dishes);
        return result;
    }

    @GetMapping("/search")
    public Map<String, Object> search(@RequestParam String keyword) {
        Map<String, Object> result = new HashMap<>();
        String sql = "SELECT * FROM dish WHERE name LIKE ? OR category LIKE ?";
        String likeKeyword = "%" + keyword + "%";
        List<Map<String, Object>> dishes = jdbcTemplate.queryForList(sql, likeKeyword, likeKeyword);
        result.put("code", 200);
        result.put("data", dishes);
        return result;
    }

    @GetMapping("/category")
    public Map<String, Object> listByCategory(@RequestParam String category) {
        Map<String, Object> result = new HashMap<>();
        String sql = "SELECT * FROM dish WHERE category = ?";
        List<Map<String, Object>> dishes = jdbcTemplate.queryForList(sql, category);
        result.put("code", 200);
        result.put("data", dishes);
        return result;
    }

    // 删除重复的 listByCategory 方法
}