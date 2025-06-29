"use client";
import { useState } from "react";
import { AiTutorInput } from "@/components/AiTutorInput";
import { AiTutorOutput } from "@/components/AiTutorOutput";
import { AiTutorProgress } from "@/components/AiTutorProgress";

// Import AiTutorOutputData type from the shared component
import type { AiTutorOutputData } from "@/components/AiTutorOutput";

export default function AiTutorMain() {
    const [userInput, setUserInput] = useState("");
    const [outputData, setOutputData] = useState<AiTutorOutputData | undefined>(undefined);
    const [progress, setProgress] = useState<{ correct: number; total: number } | null>(null);

    return (
        <div className="flex flex-col gap-8 md:flex-row">
            <section className="w-full md:w-2/3">
                <AiTutorInput
                    userInput={userInput}
                    setUserInput={setUserInput}
                    setOutputData={setOutputData}
                />
                <AiTutorOutput outputData={outputData} onProgress={setProgress} />
            </section>
            <aside className="w-full md:w-1/3">
                <AiTutorProgress progress={progress} />
            </aside>
        </div>
    );
}
