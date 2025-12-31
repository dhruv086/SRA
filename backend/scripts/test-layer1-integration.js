import { analyzeText } from '../src/services/aiService.js';

async function testLayer1() {
    console.log("--- TESTING LAYER 1 INTEGRATION (Unified Monolithic Input) ---");

    // Unified Input (mimicking Single-Field Intake)
    const srsData = {
        details: {
            projectName: { content: "OneField Pro" },
            fullDescription: {
                content: `
                Purpose: This project is a unified dashboard for managing multiple social media accounts.
                Scope: Users can post to Twitter and LinkedIn simultaneously.
                Users: Marketing managers and social media influencers.
                Features:
                1. Post Scheduling: Schedule posts for future dates.
                2. Analytics Dashboard: View engagement metrics.
                Constraints: Must use official APIs.
                Security: OAuth2 authentication required.
                `
            }
        }
    };

    const textInput = JSON.stringify(srsData, null, 2);

    try {
        console.log("Sending Payload...");
        const result = await analyzeText(textInput, {
            modelName: 'gemini-2.5-flash-lite',
            profile: 'default'
        });

        if (result.success === false) {
            console.error("AI FAILED:", result.error);
            return;
        }

        console.log("--- RESULT RECEIVED ---");

        const checks = {
            "Introduction Exists": !!result.introduction,
            "Purpose Extracted": result.introduction?.purpose?.toLowerCase().includes("social media") || false,
            "Features Extracted": (result.systemFeatures?.length || 0) >= 2,
            "Specific Feature Found": result.systemFeatures?.some(f => f.name.includes("Scheduling")) || false,
            "NFR Extracted": result.securityRequirements?.length > 0 || result.nonFunctionalRequirements?.securityRequirements?.length > 0
        };

        console.table(checks);

        if (checks["Purpose Extracted"] && checks["Specific Feature Found"]) {
            console.log("Layer 1 Verification: PASSED - Monolithic input successfully unbundled.");
            process.exit(0);
        } else {
            console.error("Layer 1 Verification: FAILED - AI failed to distribute content.");
            console.log("Full Result Intro:", result.introduction);
            console.log("Full Result Features:", result.systemFeatures);
            process.exit(1);
        }

    } catch (e) {
        console.error("Layer 1 Error:", e);
        process.exit(1);
    }
}

testLayer1();
