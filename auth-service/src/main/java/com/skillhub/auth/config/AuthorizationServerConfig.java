package com.skillhub.auth.config;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import com.skillhub.auth.model.User;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.oidc.OidcScopes;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.authorization.client.InMemoryRegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configuration.OAuth2AuthorizationServerConfiguration;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configurers.OAuth2AuthorizationServerConfigurer;
import org.springframework.security.oauth2.server.authorization.settings.AuthorizationServerSettings;
import org.springframework.security.oauth2.server.authorization.settings.ClientSettings;
import org.springframework.security.oauth2.server.authorization.settings.TokenSettings;
import org.springframework.security.oauth2.server.authorization.token.JwtEncodingContext;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenCustomizer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;

import org.springframework.beans.factory.annotation.Value;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.time.Duration;
import java.util.UUID;

@Configuration
public class AuthorizationServerConfig {

    /**
     * Primary filter chain for the Authorization Server endpoints:
     * /oauth2/authorize, /oauth2/token, /oauth2/jwks, /.well-known/openid-configuration
     */
    @Bean
    @Order(1)
    public SecurityFilterChain authorizationServerSecurityFilterChain(HttpSecurity http) throws Exception {
        OAuth2AuthorizationServerConfiguration.applyDefaultSecurity(http);

        http
            .getConfigurer(OAuth2AuthorizationServerConfigurer.class)
            .oidc(oidc -> {}); // Enable OIDC (id_token support)

        http
            .cors(cors -> {})
            // Redirect to /login when unauthenticated at /oauth2/authorize
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(new LoginUrlAuthenticationEntryPoint("/login"))
            );

        return http.build();
    }



    /**
     * Registers the SkillHub React SPA as an OAuth2 client.
     * Uses Authorization Code grant with PKCE (no client_secret needed — public client).
     */
    @Bean
    public RegisteredClientRepository registeredClientRepository() {
        RegisteredClient skillhubReact = RegisteredClient.withId(UUID.randomUUID().toString())
            .clientId("skillhub-react")
            .clientAuthenticationMethod(ClientAuthenticationMethod.NONE) // Public client — PKCE only
            .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
            .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
            .redirectUri("http://localhost:5173/callback")
            .redirectUri("http://localhost:8080/callback")
            .redirectUri("https://skillhub-app.onrender.com/callback")
            .postLogoutRedirectUri("http://localhost:5173")
            .postLogoutRedirectUri("http://localhost:8080")
            .postLogoutRedirectUri("https://skillhub-app.onrender.com")
            .scope(OidcScopes.OPENID)
            .scope(OidcScopes.PROFILE)
            .scope("read")
            .scope("write")
            .clientSettings(ClientSettings.builder()
                .requireAuthorizationConsent(false) // Skip consent screen for internal app
                .requireProofKey(true)              // PKCE required
                .build())
            .tokenSettings(TokenSettings.builder()
                .accessTokenTimeToLive(Duration.ofMinutes(30))
                .refreshTokenTimeToLive(Duration.ofDays(7))
                .reuseRefreshTokens(false)
                .build())
            .build();

        return new InMemoryRegisteredClientRepository(skillhubReact);
    }

    /**
     * Customizes the JWT to include user-specific claims: userId, role, fullName.
     * These are read by the React app to determine which dashboard to render,
     * and by the monolith to extract the user's role for @PreAuthorize checks.
     */
    @Bean
    public OAuth2TokenCustomizer<JwtEncodingContext> tokenCustomizer() {
        return context -> {
            if (context.getPrincipal().getPrincipal() instanceof User user) {
                context.getClaims()
                    .claim("userId", user.getId())
                    .claim("role", user.getRole().name())
                    .claim("fullName", user.getFullName());
            }
        };
    }

    /**
     * Generates an RSA key pair at startup (in-memory).
     * In production this should be loaded from a keystore / secrets manager.
     */
    @Bean
    public JWKSource<SecurityContext> jwkSource() {
        KeyPair keyPair = generateRsaKey();
        RSAPublicKey publicKey = (RSAPublicKey) keyPair.getPublic();
        RSAPrivateKey privateKey = (RSAPrivateKey) keyPair.getPrivate();

        RSAKey rsaKey = new RSAKey.Builder(publicKey)
            .privateKey(privateKey)
            .keyID(UUID.randomUUID().toString())
            .build();

        return new ImmutableJWKSet<>(new JWKSet(rsaKey));
    }

    private static KeyPair generateRsaKey() {
        try {
            KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
            generator.initialize(2048);
            return generator.generateKeyPair();
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to generate RSA key pair", ex);
        }
    }

    @Bean
    public JwtDecoder jwtDecoder(JWKSource<SecurityContext> jwkSource) {
        return OAuth2AuthorizationServerConfiguration.jwtDecoder(jwkSource);
    }

    /**
     * Configures the Authorization Server issuer URI.
     * Must match the jwk-set-uri base URL configured in the monolith's application.yml.
     */
    @Bean
    public AuthorizationServerSettings authorizationServerSettings(
            @Value("${AUTH_SERVER_ISSUER:http://localhost:9000}") String issuer) {
        return AuthorizationServerSettings.builder()
            .issuer(issuer)
            .build();
    }
}
