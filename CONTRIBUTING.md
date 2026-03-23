# Contributing to Music Website

Thank you for your interest in contributing! We welcome contributions from the community.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/music-website.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes locally
6. Commit your changes: `git commit -m "Add your descriptive commit message"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Open a Pull Request

## Development Guidelines

### Code Style

- Follow the existing code style
- Use TypeScript for all new files
- Run `npm run lint` before committing
- Use meaningful variable and function names
- Add comments for complex logic

### Commit Messages

- Use clear and descriptive commit messages
- Start with a verb in present tense (e.g., "Add", "Fix", "Update")
- Keep the first line under 72 characters
- Add more details in the body if needed

### Pull Requests

- Provide a clear description of the changes
- Reference any related issues
- Ensure all tests pass
- Update documentation if needed
- Keep PRs focused on a single feature or fix

## Project Structure

```
src/
├── app/              # Next.js app router pages and API routes
│   ├── api/         # API endpoints
│   ├── auth/        # Authentication pages
│   └── ...          # Other pages
├── components/       # React components
├── hooks/           # Custom React hooks
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
    ├── db/          # Database utilities
    ├── s3/          # S3 utilities
    └── supabase/    # Supabase utilities
```

## Testing

Before submitting a PR:

1. Test your changes locally
2. Ensure the app builds: `npm run build`
3. Run the linter: `npm run lint`
4. Test on different screen sizes if UI changes are involved

## Areas for Contribution

We welcome contributions in the following areas:

- Bug fixes
- New features
- Performance improvements
- Documentation improvements
- UI/UX enhancements
- Tests
- Accessibility improvements

## Questions?

If you have questions or need help, feel free to:

- Open an issue for discussion
- Check existing issues and discussions
- Review the README for setup instructions

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

Thank you for contributing!
