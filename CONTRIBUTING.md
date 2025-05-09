# Contributing to Wordmark

Thank you for considering contributing to Wordmark! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Contributing to Wordmark](#contributing-to-wordmark)
  - [Table of Contents](#table-of-contents)
  - [Code of Conduct](#code-of-conduct)
  - [Development Setup](#development-setup)
  - [Development Workflow](#development-workflow)
  - [Pull Request Process](#pull-request-process)
  - [Coding Standards](#coding-standards)
  - [Commit Guidelines](#commit-guidelines)
  - [Feature Requests and Bug Reports](#feature-requests-and-bug-reports)

## Code of Conduct

We expect all contributors to follow our Code of Conduct. Please be respectful and considerate of others when contributing to this project.

## Development Setup

1. Fork the repository
2. Clone your fork:

   ```bash
   git clone https://github.com/your-username/wordmark.git
   cd wordmark
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) to see the application

## Development Workflow

1. Create a new branch for your feature or bug fix:

   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-number
   ```

2. Make your changes, ensuring you follow the [coding standards](#coding-standards)

3. Test your changes thoroughly:

   ```bash
   npm run lint
   npm run test
   ```

4. Commit your changes using [conventional commit messages](#commit-guidelines)

5. Push your changes to your forked repository:

   ```bash
   git push origin feature/your-feature-name
   ```

6. Create a pull request against the main repository

## Pull Request Process

1. Ensure your PR title follows the [commit guidelines](#commit-guidelines)
2. Fill out the PR template with all required information
3. Link any related issues
4. Wait for a maintainer to review your PR
5. Address any requested changes
6. Once approved, your PR will be merged

## Coding Standards

- Follow TypeScript best practices
- Format your code using Prettier
- Use meaningful variable names
- Write comments for complex logic
- Follow the existing project structure
- Use React hooks and functional components

## Commit Guidelines

We use the [Conventional Commits](https://www.conventionalcommits.org/) format for commit messages. Each commit message should have a structured format:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

Types include:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools

Example commit messages:

```
feat(fonts): add support for Font Squirrel

    - Add support for Font Squirrel
    - Add support for Adobe Fonts
    - Add support for Google Fonts
    - Add support for Font Source
    - Add support for Open Foundry

fix(download): fix download issues

    - Fix JPEG export quality
    - Fix PNG export quality
    - Fix SVG export quality
    - Fix PDF export quality
    - Fix JPG export quality
```

## Feature Requests and Bug Reports

If you'd like to request a feature or report a bug, please use the GitHub issue tracker. Be sure to check existing issues before creating a new one.

---

Thank you for contributing to Wordmark! We appreciate your help in making this project better.
