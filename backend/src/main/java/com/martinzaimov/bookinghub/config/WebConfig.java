package com.martinzaimov.bookinghub.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String dir = StringUtils.cleanPath(uploadDir);
        Path abs = Path.of(dir).toAbsolutePath();

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(abs.toUri().toString());
    }
}