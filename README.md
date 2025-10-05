# SpaceBio Explorer

SpaceBio Explorer is an AI-powered dashboard designed to help researchers, managers, and mission architects at NASA explore, analyze, and discover insights from a vast library of bioscience publications. The application leverages Generative AI to perform complex analysis, identify knowledge gaps, and propose new research directions based on the existing corpus of scientific literature.

![SpaceBio Explorer Dashboard Screenshots]([(https://drive.google.com/file/d/1IW3kcTjTkz0rbQQmrXzH9VPvB9Tb-M2d/view?usp=sharing)])

## Key Features

- **Interactive Knowledge Graph**: A dynamic, 3D visualization of key concepts from publications, allowing users to discover connections and trends in research data.
- **Advanced Filtering & Search**: Users can precisely filter the publication list by search terms, publication year, and up to three simultaneous key concepts.
- **Multiple View Modes**: Toggle between a visual "grid" view for browsing and a dense, sortable "list" view for detailed analysis.
- **Role-Based Dashboards**: The UI adapts to the selected user role (Scientist, Manager, or Mission Architect), providing the most relevant tools and data visualizations for their needs.
- **AI-Powered Analysis Suite**:
    - **Strategic Briefing**: Get a high-level overview of dominant themes, emerging trends, and areas of debate across the entire filtered dataset.
    - **Gap Analysis**: Identify potential knowledge gaps and conflicting findings based on a selection of publications.
    - **Publication Comparison**: Manually select and compare a specific set of publications to find points of consensus and contradiction.
    - **Individual Publication Analysis**: Perform a deep-dive analysis on a single publication to understand its scientific novelty, methodologies, and potential impact.
    - **Exploratory Research Assistant**: Propose a new research idea and have the AI analyze its novelty and relationship to the existing literature.

## Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Generative AI**: [Google's Gemini models](https://deepmind.google/technologies/gemini/) via [Genkit](https://firebase.google.com/docs/genkit)
- **Charts & Visualizations**: [Recharts](https://recharts.org/) & a custom canvas-based force-directed graph.
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## Getting Started

This project is built to run in a cloud development environment like Firebase Studio or Google Cloud Workstations.

### Prerequisites

- Node.js (v18 or higher)
- An environment variable `GEMINI_API_KEY` with a valid API key for the Gemini models.

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/spacebio-explorer.git
    cd spacebio-explorer
    ```

2.  Install the dependencies:
    ```bash
    npm install
    ```

### Running the Development Server

To run the application in development mode, you will need two separate terminal sessions.

1.  **Start the Genkit AI flows:**
    This command starts the Genkit server, which makes the AI flows available for the Next.js application to call.

    ```bash
    npm run genkit:watch
    ```

2.  **Start the Next.js application:**
    In a separate terminal, run the following command to start the front-end application.

    ```bash
    npm run dev
    ```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

    
