# Sumguy's Pond0x Dashboard

## Overview
Sumguy's Pond0x Dashboard is a beautiful, mobile-first web application providing comprehensive, authentic analytics for the Pond0x ecosystem. It allows users to input Solana (SOL) wallet addresses to access specific Pond0x data including swap counts, mining session details, PondPro subscription status, boost multipliers, and network statistics. The project integrates with verified APIs like Cary0x manifest data and official pond0x.com mining APIs, focusing on data accuracy, user experience, and real-time Pond0x ecosystem insights. The application is Solana-focused since Pond0x operates exclusively on the Solana blockchain.

### Recent Enhancements (January 2025)
- **Wallet Memory Functionality**: Automatically remembers previously entered wallet addresses with quick selection dropdown for easy wallet switching
- **Pond0x Scan Data Integration**: Five specialized Solscan transaction history links (Hash Boost, Mining Claim, Swap Reward, Pro Sub, wPond In/Out) with Cary's exact URL parameters and contract addresses
- **Privacy & Legal Framework**: Complete Privacy Policy and Terms of Use pages ready for public deployment
- **Enhanced User Experience**: Streamlined interface with cleaned-up messaging and optimized section positioning
- **Static Site Conversion**: Configured for GitHub Pages, Vercel, and Netlify deployment with automated build pipeline and deployment guides

### Data Architecture Clarification
- **Mining Health Data**: Real-time mining performance metrics including transaction counts, portfolio values, rewards estimates, and health statistics for monitoring mining activity
- **Manifest Data**: Authentic Pond0x ecosystem metrics from verified APIs including SOL swaps, BX swaps, achievement badges, Pro subscription status, and Twitter connectivity (follows Cary0x website structure)
- **Transaction History**: Rich transaction event data with enhanced parsing that identifies swaps, transfers, and program interactions with descriptive emojis and detailed information including block numbers, timestamps, token amounts, and transaction types. Fallback parsing provides comprehensive data even when enhanced APIs fail.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The application uses a modern React architecture with TypeScript and Vite. It employs a component-based approach, React hooks for local state, and TanStack Query for server state management. Wouter handles client-side routing, and Tailwind CSS, combined with Radix UI primitives and shadcn/ui components, provides styling, accessibility, and mobile-first responsive design.

### Data Layer
The system is designed for multi-chain support (Ethereum and Solana), with robust validation using ethers.js and @solana/web3.js. It integrates directly with authentic Pond0x APIs for mining session details and manifest data, and uses Alchemy API for Ethereum and Helius API for Solana for general blockchain transaction data when Pond0x-specific data is unavailable. Enhanced historical search capability now finds 6000+ transaction signatures versus the previous 1000 limit for deeper transaction history analysis.

### Charts and Visualization
Interactive data visualization is achieved using Chart.js with React Chart.js 2, providing line charts for activity trends, doughnut charts for activity distribution, and a calendar heatmap for activity density.

### Utility Features
Includes features like ICS calendar export for reminders, wallet address copying, comprehensive date and number formatting, subtle Framer Motion animations, wallet address memory with local storage, and specialized Pond0x Solscan URL building with five distinct transaction history filters matching Cary's scandata implementation.

### Backend Architecture
Originally designed with Express.js server for development, but converted to a static site architecture. All functionality runs client-side with direct API calls to external services. Includes deployment configurations for GitHub Pages, Vercel, and Netlify hosting with automated build pipelines.

### Security Considerations
Security features include enhanced Content Security Policy (CSP), strict multi-chain address validation, privacy-first handling of social data with fallbacks, prevention of dangerous HTML, and controlled loading of external resources. The design is read-only, avoiding handling of private keys or sensitive user data.

### UI/UX Decisions
The design emphasizes visual clarity and balance with optimized chart heights, proper light/dark mode styling, improved Timeline component, and consistent styling. All major sections now use consistent `bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/90 dark:to-slate-900/90` backgrounds with `shadow-lg` for visual harmony. The Manifest Data cards feature color-coded backgrounds that match their content colors (cyan for Sol Swaps, emerald for BX Swaps, indigo for Badges, amber for PondPro) with removed colored icon squares for better legibility. Twitter/X connection is displayed as a subtle badge in the title area. The navigation features a circular pond icon logo before the title for brand recognition.

## External Dependencies

### Core Framework Dependencies
- **React 18**: Frontend framework
- **Vite**: Build tool and development server
- **Express.js**: Backend server framework
- **TanStack Query**: Data fetching and caching

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Headless, accessible UI component primitives
- **shadcn/ui**: Components built on Radix UI
- **Framer Motion**: Animation library
- **Lucide React**: Icon library

### Data Visualization
- **Chart.js**: Charting library
- **React Chart.js 2**: React wrapper for Chart.js

### Blockchain & External Data
- **ethers**: Ethereum utility library for address validation and Web3 interactions
- **@solana/web3.js**: Solana utility library for address validation and PublicKey handling
- **Alchemy API**: Ethereum blockchain data
- **Helius API**: Solana blockchain data
- **Cary0x manifest API**: Pond0x manifest data
- **pond0x.com mining APIs**: Official Pond0x mining session data

### Database and Storage
- **Drizzle ORM**: Type-safe ORM
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **PostgreSQL**: Primary database

### Validation and Utilities
- **Zod**: Runtime type validation
- **date-fns**: Date manipulation and formatting

### Development Tools
- **TypeScript**: Static type checking
- **ESBuild**: JavaScript bundler
- **Wouter**: Lightweight client-side routing library