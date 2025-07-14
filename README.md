# ThaiTune - Traditional Thai Music Platform

ThaiTune is a web platform dedicated to preserving, sharing, and exploring traditional Thai music. This application allows users to create, edit, and share musical scores, while connecting with a community of enthusiasts.

![ThaiTune Preview](public/images/thaitune-logo.png)

## Features

- **User Authentication**: Secure login with email/password and two-factor authentication
- **Personal Dashboard**: Create and manage your music scores
- **Score Editor**: Intuitive interface for composing traditional Thai music
- **Community**: Share your compositions and discover others' work
- **Multi-language Support**: Available in English and Thai
- **AI Assistant**: Get help with music theory and composition through the integrated chat

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore, Cloud Functions)
- **State Management**: React Context API, useState/useEffect
- **Internationalization**: i18next
- **UI Components**: Radix UI, shadcn/ui
- **AI Integration**: OpenAI API

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or pnpm
- Firebase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/thaitune.git
   cd thaitune
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env.local` file with the following variables:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   OPENAI_API_KEY=your_openai_api_key
   ```

   📋 **For detailed setup instructions, see [SETUP.md](SETUP.md)**

4. Start the development server:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Firebase Configuration

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Deploy Cloud Functions (located in the `functions` directory):
   ```bash
   firebase deploy --only functions
   ```

## Project Structure

The project follows a modular architecture for better maintainability. See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for detailed information about the codebase organization.

```
├── app/                    # Next.js App Router
│   ├── components/         # React components
│   │   ├── auth/           # Authentication components
│   │   ├── common/         # Common/shared components
│   │   ├── layout/         # Layout components
│   │   └── ui/             # UI components (buttons, inputs, etc.)
│   ├── providers/          # React context providers
│   └── [route folders]/    # Page routes
├── functions/              # Firebase Cloud Functions
├── lib/                    # Utility libraries and functions
├── public/                 # Static assets
└── styles/                 # Global styles
```

## Development

### Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run linting

### Firebase Deployment

Deploy the entire application to Firebase:

```bash
npm run build
firebase deploy
```

## Troubleshooting

If you encounter build timeout issues, try increasing the timeout limit:

```bash
NEXT_DEBUG=true npm run build
```

## License

This project is licensed under the MIT License.

## Acknowledgments

- Thai traditional music community
- All open-source libraries and frameworks used in this project 