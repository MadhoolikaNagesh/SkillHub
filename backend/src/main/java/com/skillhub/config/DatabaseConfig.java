package com.skillhub.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DatabaseConfig {

    @Value("${SPRING_DATASOURCE_URL:${DATABASE_URL:jdbc:postgresql://localhost:5432/skillhub}}")
    private String databaseUrl;

    @Value("${SPRING_DATASOURCE_USERNAME:${DATABASE_USERNAME:postgres}}")
    private String username;

    @Value("${SPRING_DATASOURCE_PASSWORD:${DATABASE_PASSWORD:password}}")
    private String password;

    @Bean
    @Primary
    public DataSource dataSource() {
        String formattedUrl = databaseUrl;
        String dbUser = username;
        String dbPassword = password;

        if (formattedUrl != null && (formattedUrl.startsWith("postgresql://") || formattedUrl.startsWith("postgres://"))) {
            try {
                URI uri = new URI(formattedUrl);
                if (uri.getUserInfo() != null) {
                    String[] userInfo = uri.getUserInfo().split(":");
                    dbUser = userInfo[0];
                    if (userInfo.length > 1) {
                        dbPassword = userInfo[1];
                    }
                }
                int port = uri.getPort() > 0 ? uri.getPort() : 5432;
                formattedUrl = "jdbc:postgresql://" + uri.getHost() + ":" + port + uri.getPath();
            } catch (Exception ex) {
                if (!formattedUrl.startsWith("jdbc:")) {
                    formattedUrl = "jdbc:" + formattedUrl;
                }
            }
        }

        return DataSourceBuilder.create()
                .driverClassName("org.postgresql.Driver")
                .url(formattedUrl)
                .username(dbUser)
                .password(dbPassword)
                .build();
    }
}
