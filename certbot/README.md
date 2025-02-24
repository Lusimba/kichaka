# Certbot Configuration

This directory contains SSL/TLS certificate data managed by Certbot:

- `conf/`: Contains Certbot configuration and certificates

  - Will be populated with Let's Encrypt certificates
  - Contains SSL parameters and Diffie-Hellman parameters
  - Stores renewal configuration

- `www/`: Contains the webroot for ACME challenges
  - Used by Certbot for domain validation
  - Should remain empty in version control
  - Will be automatically populated during certificate issuance/renewal

Do not commit any contents of these directories except .gitkeep files.

## Initial Setup

1. Make sure both directories exist and are empty except for .gitkeep files
2. Run the init-letsencrypt.sh script to initialize certificates
3. Certificates will auto-renew every 12 hours (if needed)

## Directory Structure

```
certbot/
├── conf/
│   └── .gitkeep
└── www/
    └── .gitkeep
```
