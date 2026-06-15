package com.xx.music.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class SmsService {

    private final StringRedisTemplate stringRedisTemplate;

    private static final String CODE_KEY_PREFIX = "sms:code:";
    private static final String LIMIT_KEY_PREFIX = "sms:limit:";
    private static final String DAILY_KEY_PREFIX = "sms:daily:";

    private static final int CODE_TTL_SECONDS = 300;     // 5分钟
    private static final int LIMIT_TTL_SECONDS = 60;      // 1分钟间隔
    private static final int DAILY_LIMIT = 10;             // 每天上限
    private static final int DAILY_TTL_SECONDS = 86400;    // 24小时

    /**
     * 发送验证码（开发模式：返回验证码到响应中）
     */
    public String sendCode(String phone) {
        // 检查发送频率限制
        String limitKey = LIMIT_KEY_PREFIX + phone;
        if (Boolean.TRUE.equals(stringRedisTemplate.hasKey(limitKey))) {
            throw new IllegalStateException("发送过于频繁，请60秒后重试");
        }

        // 检查每日发送上限
        String dailyKey = DAILY_KEY_PREFIX + phone;
        String dailyCountStr = stringRedisTemplate.opsForValue().get(dailyKey);
        int dailyCount = dailyCountStr != null ? Integer.parseInt(dailyCountStr) : 0;
        if (dailyCount >= DAILY_LIMIT) {
            throw new IllegalStateException("今日发送次数已达上限");
        }

        // 生成6位验证码
        String code = String.valueOf(100000 + ThreadLocalRandom.current().nextInt(900000));

        // 存储验证码到 Redis
        String codeKey = CODE_KEY_PREFIX + phone;
        stringRedisTemplate.opsForValue().set(codeKey, code, CODE_TTL_SECONDS, TimeUnit.SECONDS);

        // 设置发送频率限制
        stringRedisTemplate.opsForValue().set(limitKey, "1", LIMIT_TTL_SECONDS, TimeUnit.SECONDS);

        // 更新每日发送计数
        if (dailyCount == 0) {
            stringRedisTemplate.opsForValue().set(dailyKey, "1", DAILY_TTL_SECONDS, TimeUnit.SECONDS);
        } else {
            stringRedisTemplate.opsForValue().increment(dailyKey);
        }

        // 开发模式：控制台输出验证码
        log.info("【验证码】手机号: {}, 验证码: {}", phone, code);

        return code; // 开发模式返回验证码，生产环境应返回 null
    }

    /**
     * 校验验证码
     */
    public void verifyCode(String phone, String inputCode) {
        String codeKey = CODE_KEY_PREFIX + phone;
        String storedCode = stringRedisTemplate.opsForValue().get(codeKey);

        if (storedCode == null) {
            throw new IllegalArgumentException("验证码已过期，请重新获取");
        }

        if (!storedCode.equals(inputCode)) {
            throw new IllegalArgumentException("验证码错误");
        }

        // 验证成功，删除验证码
        stringRedisTemplate.delete(codeKey);
    }
}
