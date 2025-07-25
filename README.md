# SMBC Banking Portal - Case Study

This is a [Next.js](https://nextjs.org) project that demonstrates a banking portal for SMBC (Sumitomo Mitsui Banking Corporation) with AI-powered document analysis capabilities.

## Features

- **Client Portal**: Submit banking needs and get AI-powered team recommendations
- **Employee Dashboard**: Review submissions and analyze uploaded documents
- **AI Document Analysis**: Upload PDF documents and get automated risk analysis using OpenAI GPT-4o-mini
- **Risk Assessment**: Identifies regulatory/legal risks, investment risks, and potential downsides

## Getting Started

### Prerequisites

1. **OpenAI API Key**: You'll need an OpenAI API key for the document analysis feature
   - Get your API key from: https://platform.openai.com/api-keys
   - Create a `.env.local` file in the root directory and add:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

### Client View
- Submit brief descriptions of banking needs
- Get AI-powered team recommendations
- Upload PDF documents for analysis
- Provide detailed information about your requirements

### Employee View
- Review client submissions
- Analyze uploaded PDF documents using AI
- View risk assessments and recommendations
- Manage submission status and add notes

## AI Document Analysis

The system uses OpenAI GPT-4o-mini to analyze uploaded PDF documents and identify:
- **Regulatory & Legal Risks**: Compliance issues, regulatory violations, legal uncertainties
- **Investment Risks**: Financial risks, market risks, credit risks, liquidity issues
- **Potential Downsides**: Operational risks, reputational risks, business continuity issues

Each analysis includes:
- Severity levels (low, medium, high, critical)
- Relevant text excerpts from the document
- Actionable recommendations
- Overall risk assessment

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
