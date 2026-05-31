# 🤝 Contributing to Chat ID Finder Bot

First off, thank you for considering contributing to the Chat ID Finder Bot! People like you make the open-source community an amazing place to learn, inspire, and create. 

Following these guidelines helps us preserve codebase cleanliness, accelerate issue resolution, and make the contribution process smooth and enjoyable for everyone.

---

## 🗺️ How Can I Contribute?

### 1. Reporting Bugs
- Check the [Issues Tab](https://github.com/ImranVibes/Chat-ID-Finder-Bot/issues) to make sure the bug hasn't already been reported.
- If it's a new issue, open a new report and include:
  - A clear and descriptive title.
  - Steps to reproduce the bug.
  - Expected vs. actual behavior.
  - Screenshots or console logs if applicable (especially Telegram API error codes).

### 2. Suggesting Features
- We love new ideas! Check the existing issues/discussions to see if someone else has already proposed the feature.
- Open an issue detailing:
  - What the feature does.
  - Why it is useful for users or developers.
  - Mockups or UX flows showing how it would look in Telegram.

### 3. Submitting Pull Requests (PRs)
- Fork the repository and create your branch from `main`.
- Install dependencies (`npm install`) and write your code.
- Ensure your changes compile successfully with **no TypeScript warnings**:
  ```bash
  npm run build
  ```
- Push to your fork and submit a pull request to our `main` branch.
- Clearly describe your changes in the PR description, linking any related issues.

---

## 🛠️ Code Style & Guidelines

To maintain a premium standard of software development, we adhere to strict quality rules:

- **TypeScript Type-Safety:** Avoid using `any` wherever possible. Define explicit interfaces or types.
- **HTML Character Escaping:** Any time you output user-supplied data (such as names, messages, or titles), you **must** parse it through `escapeHTML()` to protect the Bot API from rendering crashes.
- **NodeNext Modules:** Remember that this project uses ESM (`"type": "module"`). All local imports in your code must explicitly include the `.js` extension (e.g. `import { config } from "./config.js"`).
- **Graceful Error Handling:** Wrap API requests (such as fetching profile pictures or sending buffers) inside `try-catch` blocks with robust fallback replies so the bot never crashes or halts mid-execution.

---

## 📜 Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free experience for everyone, regardless of background. Please treat all contributors with respect, kindness, and professional courtesy.

Thank you for helping us build a better tool for the developer community! 🚀
