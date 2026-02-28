# Vuga Platform

[![CircleCI](https://circleci.com/gh/Bahatisteven/vuga/tree/main.svg?style=svg)](https://circleci.com/gh/Bahatisteven/vuga/tree/main)
[![Coverage Status](https://img.shields.io/coveralls/github/Bahatisteven/vuga/main?style=flat)](https://coveralls.io/github/Bahatisteven/vuga?branch=main)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Bahatisteven_vuga&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Bahatisteven_vuga)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=Bahatisteven_vuga&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=Bahatisteven_vuga)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=Bahatisteven_vuga&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=Bahatisteven_vuga)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=Bahatisteven_vuga&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=Bahatisteven_vuga)

A scalable backend platform for real-time voice translation and multilingual communication. Built with NestJS, TypeScript, and PostgreSQL, Vuga enables seamless conversations between people speaking different languages.

## Table of Contents

- [Vuga Platform](#vuga-platform)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Architecture](#architecture)
  - [Technologies](#technologies)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [API Documentation](#api-documentation)
    - [Main Endpoints](#main-endpoints)
  - [Development](#development)
    - [Available Scripts](#available-scripts)
    - [Project Structure](#project-structure)
  - [Testing](#testing)
  - [Deployment](#deployment)
    - [Production Build](#production-build)
    - [Environment Configuration](#environment-configuration)
    - [Deployment Platforms](#deployment-platforms)
    - [Database and Cache](#database-and-cache)
  - [Security](#security)
  - [Supported Languages](#supported-languages)
  - [Contributing](#contributing)
    - [Code Standards](#code-standards)
  - [License](#license)
  - [Acknowledgments](#acknowledgments)
  - [Contact](#contact)

## Features

- **Secure Authentication** - JWT-based authentication with Passport.js
- **User Management** - Complete user profile and preference management
- **Call Management** - Track call history, duration, and participant information
- **Speech Processing** - Web Speech API integration for speech recognition and synthesis
- **Real-time Translation** - Powered by MyMemory Translation API with intelligent caching
- **High Performance** - Redis caching layer for optimized response times
- **Comprehensive Logging** - Detailed call logs and analytics
- **Data Security** - Password hashing with bcrypt and secure token management
- **API Documentation** - Interactive Swagger documentation

## Architecture

Vuga follows a modular monolithic architecture designed for clarity and scalability:

```
src/
├── auth/           Authentication and authorization
├── user/           User management and profiles
├── call/           Call lifecycle and history
├── speech/         Speech-to-text and text-to-speech
├── translation/    Language translation service
├── config/         Application configuration
└── common/         Shared utilities and filters
```

## Technologies

**Core Stack**
- NestJS 11.x - Progressive Node.js framework
- TypeScript 5.x - Typed JavaScript
- PostgreSQL - Primary database with TypeORM
- Redis - Caching and session storage via ioredis

**Authentication & Security**
- JWT (JSON Web Tokens)
- Passport.js
- bcrypt for password hashing
- class-validator for input validation

**API & Documentation**
- Swagger/OpenAPI for API documentation
- RESTful API design

**Testing & Quality**
- Jest for unit and integration testing
- ESLint and Prettier for code quality
- CircleCI for continuous integration
- SonarCloud for code analysis
- Coveralls for coverage reporting

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- PostgreSQL 12 or higher
- Redis 6 or higher

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Bahatisteven/vuga.git
cd vuga
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Application
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=vuga_db

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRETE=your_secure_random_string
JWT_EXPIRATION=7d
```

4. Set up the database:
```bash
createdb vuga_db
```

TypeORM will automatically sync tables in development mode.

5. Start the development server:
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000/v1/api/`

## API Documentation

Interactive API documentation is available at:
```
http://localhost:3000/api/docs
```

### Main Endpoints

**Authentication**
```
POST   /v1/api/auth/register      Register new user
POST   /v1/api/auth/login         Login and receive JWT token
```

**User Management**
```
GET    /v1/api/users/me           Get current user profile
PATCH  /v1/api/users/me           Update user profile
```

**Call Management**
```
POST   /v1/api/calls              Initiate a new call
GET    /v1/api/calls              Retrieve call history
GET    /v1/api/calls/:id          Get specific call details
PATCH  /v1/api/calls/:id/end      End an active call
```

**Translation**
```
POST   /v1/api/translation                Translate text between languages
GET    /v1/api/translation/languages      Get supported languages
```

**Speech**
```
GET    /v1/api/speech/config              Get speech configuration
GET    /v1/api/speech/languages           Get supported speech languages
```

## Development

### Available Scripts

```bash
# Development
npm run start              Start the application
npm run start:dev          Start with hot-reload (watch mode)
npm run start:debug        Start in debug mode

# Building
npm run build              Build for production

# Testing
npm run test               Run unit tests
npm run test:watch         Run tests in watch mode
npm run test:cov           Run tests with coverage
npm run test:e2e           Run end-to-end tests

# Code Quality
npm run lint               Lint and auto-fix code
npm run format             Format code with Prettier
```

### Project Structure

```
vuga/
├── src/
│   ├── auth/              Authentication module
│   ├── user/              User management module
│   ├── call/              Call management module
│   ├── speech/            Speech processing module
│   ├── translation/       Translation module
│   ├── config/            Configuration files
│   ├── common/            Shared utilities
│   ├── app.module.ts      Root application module
│   └── main.ts            Application entry point
├── test/                  End-to-end tests
├── .env.example           Environment variables template
├── nest-cli.json          NestJS CLI configuration
├── tsconfig.json          TypeScript configuration
└── package.json           Dependencies and scripts
```

## Testing

Run the test suite:

```bash
# Unit tests
npm test

# Test coverage
npm run test:cov

# Watch mode for development
npm run test:watch

# End-to-end tests
npm run test:e2e
```

Tests are written using Jest and follow the AAA (Arrange-Act-Assert) pattern.

## Deployment

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

### Environment Configuration

For production deployments, configure these environment variables:

```env
NODE_ENV=production
PORT=3000
DB_HOST=your_production_db_host
DB_SSL=true
REDIS_URL=your_production_redis_url
JWT_SECRETE=strong_random_secret
CORS_ORIGIN=https://your-frontend-domain.com
```

### Deployment Platforms

The application can be deployed to various platforms:
- Render.com
- Railway
- Fly.io
- AWS (Elastic Beanstalk, ECS)
- Google Cloud Platform
- Heroku

### Database and Cache

- **Database**: Render PostgreSQL, Supabase, AWS RDS, or any PostgreSQL provider
- **Cache**: Upstash Redis, Redis Labs, AWS ElastiCache

## Security

Security measures implemented:

- Password hashing using bcrypt with salt rounds
- JWT tokens for stateless authentication
- Environment variables for sensitive configuration
- Input validation using class-validator
- SQL injection prevention through TypeORM parameterized queries
- CORS configuration for controlled access
- Helmet middleware for HTTP headers security

## Supported Languages

The platform supports multiple languages including:

- English (en-US, en-GB)
- French (fr-FR)
- Spanish (es-ES)
- Kinyarwanda (rw-RW)
- German (de-DE)
- Italian (it-IT)
- Portuguese (pt-BR)
- Arabic (ar-SA)
- Chinese (zh-CN)
- Japanese (ja-JP)

Additional languages are supported through the Web Speech API and translation services.

## Contributing

Contributions are welcome. Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

### Code Standards

- Follow the existing code style
- Run `npm run lint` before committing
- Ensure all tests pass with `npm test`
- Add tests for new features
- Update documentation as needed

## License

MIT License.

## Acknowledgments

- Built with [NestJS](https://nestjs.com/)
- Translation powered by [MyMemory API](https://mymemory.translated.net/)
- Speech services via [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

## Contact

For questions, issues, or contributions, please open an issue on GitHub.

---

**Version:** 0.0.1  
**Status:** Active Development
