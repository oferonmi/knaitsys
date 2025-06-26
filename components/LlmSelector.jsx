import "react-toastify/dist/ReactToastify.css";
import '@/node_modules/bootstrap-icons/font/bootstrap-icons.css';

/**
 * @typedef {Object} LlmRoute
 * @property {string} value
 * @property {string} label
 * @property {boolean} [isMultimodal]
 */

/** @type {LlmRoute[]} */
const LLM_OPTIONS = [
    { value: "chat/remote_chat/openai", label: "GPT-3.5" },
    { value: "multimodal/remote_chat/openai", label: "GPT-4o-mini", isMultimodal: true },
    { value: "chat/remote_chat/fireworks/llama3_fireworks", label: "Llama-3-Fwks" },
    { value: "chat/remote_chat/fireworks/qwen2_fireworks", label: "Qwen-2-Fwks" },
    { value: "chat/remote_chat/fireworks/qwen3_fireworks", label: "Qwen-3-Fwks" },
    { value: "chat/remote_chat/fireworks/qwq_fireworks", label: "QWQ-Fwks" },
    {
        value: "multimodal/remote_chat/groq/llama3_groq",
        label: "Llama-3.2-Groq",
        isMultimodal: true,
    },
    { value: "chat/remote_chat/anthropic", label: "Claude-3.5-Haiku" },
    {
        value: "chat/remote_chat/fireworks/mixtral_MoE8x7B_Instruct_fireworks",
        label: "Mixtral-MoE-Fwks",
    },
    { value: "chat/remote_chat/xai", label: "Grok-2" },
    {
        value: "chat/remote_chat/gemini",
        label: "Gemini-1.5-Flash",
        isMultimodal: true,
    },
    // { value: "chat/local_chat/deepseek", label: "Deepseek-r1" },
    { value: "chat/remote_chat/fireworks/deepseek_fireworks/r1", label: "Deepseek-r1-Fwks" },
    { value: "chat/remote_chat/fireworks/deepseek_fireworks/v3", label: "Deepseek-v3-Fwks" },
    // { value: "chat/local_chat/qwen2", label: "Qwen-2.5" },
    // { value: "multimodal/local_chat/llava", label: "Llava", isMultimodal: true },
    // { value: "multimodal/local_chat/phi3", label: "Phi3" },
];

const LlmSelector = ({ llmApiRoute, handleLlmApiChange }) => {
    return (
        <>
            <select
                onChange={handleLlmApiChange}
                value={llmApiRoute.replace("/api/", "")}
                className="inline-flex items-center gap-2 px-1 py-1 text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-gray-900 rounded-md border-0"
                id="llm-selector"
                required
            >
                <option value="">--Select LLM--</option>
                {LLM_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>
                    {label}
                    </option>
                ))}
            </select>
        </>
    );
}

export default LlmSelector;