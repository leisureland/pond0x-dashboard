# Sumguy's Pond0x Dashboard

An unofficial, beautiful mobile-first web application providing comprehensive analytics for the Pond0x ecosystem. Enter your Solana wallet address for instant access to mining data, swap statistics, Pro subscription status, achievement badges, and specialized blockchain transaction history.

## Features

### 🎯 Pond0x-Specific Analytics
- **Manifest Data**: Pro subscription status, SOL/BX swap counts, achievement badges, Twitter connectivity
- **Mining Health**: Real-time mining session details with authentic boost values from official APIs
- **Swap/Boost Calculator**: Interactive calculator with 615 boost cap enforcement and live data integration
- **Achievement Tracking**: Diamond, pork, chef, points, and swap badges with visual display

### 🗂️ Wallet Memory & Management
- **Automatic Address Saving**: Remembers up to 10 recently entered wallet addresses
- **Quick Selection**: Dropdown menu for instant wallet switching
- **Local Storage**: Privacy-first storage with no external tracking
- **Easy Management**: Remove or nickname saved addresses

### 🔍 Pond0x Scan Data Integration
- **Hash Boost History**: Mining boost transactions and rewards
- **Mining Claim History**: Claims from official mining contracts
- **Swap Reward History**: Rewards earned from swapping activities  
- **Pro Sub History**: PondPro subscription payment tracking
- **wPond In/Out History**: wPond token transfer movements
- **Direct Solscan URLs**: Matching Cary's exact scandata implementation with specific contract addresses

### 📊 Rich Visualizations
- **Transaction Timeline**: Enhanced parsing with 6000+ transaction signatures
- **Activity Charts**: Interactive visualizations using Chart.js
- **Mining Statistics**: Real-time peer counts, rewards, and session status
- **Boost Calculations**: Live boost multiplier tracking with authentic formulas

### 🔐 Privacy & Security
- **Complete Anonymity**: No personal information exposure or hardcoded addresses
- **Privacy Policy**: Comprehensive privacy protection framework
- **Terms of Use**: Legal compliance ready for public deployment
- **Read-Only Design**: No private keys or sensitive data required

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Radix UI + shadcn/ui components
- **Data Fetching**: TanStack Query with authentic API integration
- **Validation**: Zod + @solana/web3.js for Solana address validation
- **Charts**: Chart.js + React Chart.js 2
- **Animations**: Framer Motion for smooth interactions
- **Routing**: Wouter for lightweight client-side routing

## Data Sources

### Official APIs
- **pond0x.com/api**: Official mining session data and user profiles
- **Helius API**: Solana blockchain transaction data
- **Alchemy API**: Ethereum blockchain data (legacy support)

### Third-Party Integration
- **Cary0x APIs**: Manifest data aggregation (badges, swap counts, Pro status)
- **Solscan URLs**: Direct blockchain explorer links with Pond0x-specific filters

## Getting Started

### Prerequisites
- Node.js 20+
- npm package manager

### Installation

1. Clone or fork this Replit project
2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Access your app at the provided Replit URL

### Usage

1. **Enter Wallet Address**: Input your Solana wallet address on the home page
2. **View Analytics**: Explore manifest data, mining health, and swap statistics
3. **Calculate Boosts**: Use the interactive calculator with live Pro status integration
4. **Explore History**: Access specialized Solscan transaction filters
5. **Save Addresses**: Automatically remembers addresses for quick future access

## Architecture

### Frontend Structure
```
client/src/
├── components/          # Reusable UI components
│   ├── AddressForm.tsx  # Solana address input with validation
│   ├── Pond0xManifest.tsx # Manifest data display
│   ├── MiningSessionCard.tsx # Mining health metrics
│   ├── SwapBoostCalculator.tsx # Interactive boost calculator
│   ├── SolscanIntegration.tsx # Specialized transaction links
│   ├── SavedWallets.tsx # Wallet memory management
│   └── Timeline.tsx     # Transaction history timeline
├── pages/              # Main application pages
│   ├── Home.tsx        # Landing page with address input
│   ├── Results.tsx     # Complete analytics dashboard
│   ├── PrivacyPolicy.tsx # Privacy protection framework
│   └── TermsOfService.tsx # Legal compliance
├── lib/                # Utility functions
│   ├── solscanUrls.ts  # Pond0x-specific URL building
│   ├── walletMemory.ts # Local wallet storage
│   └── validation.ts   # Address validation
└── types/              # TypeScript type definitions
```

### Key Components

- **Pond0xManifest**: Displays Pro status, badges, and swap counts with color-coded cards
- **MiningSessionCard**: Shows real-time mining data with authentic boost values
- **SwapBoostCalculator**: Interactive calculator with 615 boost cap and live API integration
- **SolscanIntegration**: Five specialized transaction history links matching Cary's scandata
- **SavedWallets**: Wallet memory with dropdown selection and management features

### Data Flow

1. **Input**: User enters Solana wallet address with validation
2. **API Calls**: Parallel requests to Cary0x, pond0x.com, and Helius APIs
3. **Data Processing**: Authentication and parsing of manifest, mining, and transaction data
4. **Visualization**: Real-time display with interactive charts and timeline
5. **Memory**: Automatic wallet address saving for future quick access

## Privacy & Security

### Privacy-First Design
- **No Personal Data**: Only uses public blockchain and manifest information
- **Local Storage**: Wallet addresses saved locally with no external tracking
- **Anonymous Usage**: Complete anonymity protection for public deployment
- **Privacy Policy**: Comprehensive framework covering all data usage

### Security Features
- **Input Validation**: Strict Solana address validation and sanitization
- **API Security**: Controlled endpoint access with proper headers
- **CSP Protection**: Content Security Policy preventing XSS attacks
- **Read-Only Design**: No private keys, signatures, or sensitive operations

## Deployment

This is a **static site** that can be hosted on GitHub Pages, Vercel, Netlify, or any static hosting service.

### GitHub Pages (Free Hosting)
1. Export project to GitHub repository
2. Build static files: `npm run build`
3. Configure GitHub Pages to deploy from `/dist` folder
4. Available at: `https://username.github.io/repository-name/`

### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Build command: `npm run build`
3. Output directory: `dist`
4. Automatic deployments with custom domain support

### Netlify
1. Drag and drop `dist` folder to Netlify
2. Or connect GitHub for automatic deployments
3. Free hosting with custom domain options

### Build Process
```bash
npm install    # Install dependencies
npm run build  # Create static files in dist/
npm run preview # Preview built site locally
```

## Legal Compliance

- **Privacy Policy**: Complete privacy protection framework included
- **Terms of Use**: Comprehensive terms for public deployment
- **Disclaimer**: Clear unofficial status and risk warnings
- **Attribution**: Proper credits to data sources and inspirations

## Contributing

This is an independent, unofficial community project. Contributions welcome through:
1. Fork the repository
2. Create feature branch
3. Test thoroughly with authentic data
4. Submit pull request with clear description

## Acknowledgments

- **Pond0x Team**: For building the amazing ecosystem
- **@Cary0x2**: For data sources and scandata implementation inspiration
- **Community**: For feedback and testing support

## License

MIT License - see LICENSE file for details.

---

**Disclaimer**: This is an unofficial, independent project for informational purposes only. Not affiliated with or endorsed by Pond0x. Always verify data before making decisions. Use at your own risk.