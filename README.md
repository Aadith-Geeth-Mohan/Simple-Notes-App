# Simple Notes App

> A lightweight notes application built with vanilla HTML, CSS, and JavaScript. Inspired by Google Keep.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

## Features

| Feature | Description |
|---------|-------------|
| **Add Notes** | Create notes with title, content, and optional tags |
| **Edit Notes** | Modify existing notes |
| **Delete Notes** | Remove notes with confirmation |
| **Pin Notes** | Pin important notes to top |
| **Search** | Filter notes by title or content |
| **Tags** | Categorize notes with colored labels |
| **Persistence** | Notes saved to localStorage |

## Quick Start

```bash
# Just open index.html in your browser
open index.html
```

No build tools, no dependencies, no server required.

## Project Structure

```
├── index.html         # Main HTML structure
├── styles.css         # All CSS styling
├── script.js          # JavaScript logic
├── documentation.html # Project documentation
└── SPEC.md            # This file
```

## Data Model

```javascript
{
  id: Number,        // Unix timestamp
  title: String,     // Note title (required)
  content: String,   // Note body (required)
  tags: String[],    // Array of tag strings
  pinned: Boolean,   // Whether note is pinned
  createdAt: Number  // Unix timestamp
}
```

## Constraints

- Maximum **20 notes** per app
- Title and content **cannot be empty**
- Tags are **comma-separated** (e.g., `work, important, ideas`)
- Pinned notes always appear at the **top**

## Design

- **Google Keep-inspired** card-based layout
- **Yellow accent** for pinned notes indicator
- **Responsive grid** adapts to screen size
- **Sticky header** with search bar

