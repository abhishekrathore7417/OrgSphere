package com.orgsphere;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// All modules share the com.orgsphere base package — default scan covers everything.
@SpringBootApplication
public class OrgsphereBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(OrgsphereBackendApplication.class, args);
    }

}
