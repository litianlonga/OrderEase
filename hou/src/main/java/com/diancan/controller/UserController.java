package com.diancan.controller;

import org.springframework.web.multipart.MultipartFile;
import java.io.File;

import com.diancan.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;  // 修改这行，添加 * 导入所有注解
import org.springframework.web.bind.annotation.CrossOrigin;  // 添加这行

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/user")
public class UserController {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> loginInfo) {
        Map<String, Object> result = new HashMap<>();
        
        String sql;
        if (loginInfo.containsKey("phone")) {
            sql = "SELECT * FROM user WHERE phone = ? AND password = ?";
        } else {
            sql = "SELECT * FROM user WHERE email = ? AND password = ?";
        }
        
        List<Map<String, Object>> users = jdbcTemplate.queryForList(sql, 
            loginInfo.values().iterator().next(), 
            loginInfo.get("password")
        );
        
        if (users.size() > 0) {
            result.put("code", 200);
            result.put("msg", "登录成功");
            result.put("data", users.get(0));
        } else {
            result.put("code", 400);
            result.put("msg", "账号或密码错误");
        }
        
        return result;
    }

    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody Map<String, String> userInfo) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 检查用户名是否已存在
            String checkSql = "SELECT COUNT(*) FROM user WHERE username = ?";
            int count = jdbcTemplate.queryForObject(checkSql, Integer.class, userInfo.get("username"));
            
            if (count > 0) {
                result.put("code", 400);
                result.put("msg", "用户名已存在");
                return result;
            }
            
            // 创建新用户
            String sql = "INSERT INTO user (username, password, phone, email) VALUES (?, ?, ?, ?)";
            jdbcTemplate.update(sql,
                userInfo.get("username"),
                userInfo.get("password"),
                userInfo.get("phone"),
                userInfo.get("email")
            );
            
            result.put("code", 200);
            result.put("msg", "注册成功");
        } catch (Exception e) {
            e.printStackTrace();
            result.put("code", 500);
            result.put("msg", "注册失败：" + e.getMessage());
        }
        
        return result;
    }

    @PostMapping("/upload/avatar")
    public Map<String, Object> uploadAvatar(@RequestParam("file") MultipartFile file, 
                                          @RequestParam("userId") Integer userId) {
        Map<String, Object> result = new HashMap<>();
        try {
            // 获取用户名
            String sql = "SELECT username FROM user WHERE id = ?";
            String username = jdbcTemplate.queryForObject(sql, String.class, userId);
            
            String uploadPath = "D:/miniapp/mini/diancan/qian/images/avatar/";
            String fileName = username + ".jpg";
            File dest = new File(uploadPath + fileName);
            
            if (!dest.getParentFile().exists()) {
                dest.getParentFile().mkdirs();
            }
            
            file.transferTo(dest);
            
            String avatarUrl = "/images/avatar/" + fileName;
            sql = "UPDATE user SET avatar = ? WHERE id = ?";
            jdbcTemplate.update(sql, avatarUrl, userId);
            
            result.put("code", 200);
            result.put("msg", "上传成功");
            result.put("data", avatarUrl);
        } catch (Exception e) {
            e.printStackTrace();
            result.put("code", 500);
            result.put("msg", "上传失败：" + e.getMessage());
        }
        return result;
    }
}