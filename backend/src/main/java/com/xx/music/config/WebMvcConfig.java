package com.xx.music.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 管理平台静态资源
        registry.addResourceHandler("/admin/**")
                .addResourceLocations("classpath:/static/admin/");
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // 管理平台 SPA 路由转发
        registry.addViewController("/admin")
                .setViewName("forward:/admin/index.html");
        registry.addViewController("/admin/{path:[^.]*}")
                .setViewName("forward:/admin/index.html");
    }
}
