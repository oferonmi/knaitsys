import type { Message } from "ai/react";

export function ChatMessageBubble(props: {
  message: Message;
  aiEmoji?: string;
  sources?: any[];
}) {
  const bubbleColorHexArr = [
    "bg-[#cba3e0]",
    "bg-[#d2ccf2]",
    "bg-[#c8a8d5]",
    "bg-[#e4a8b9]",
    "bg-[#db96b9]",
    "bg-[#afd1e2]",
    "bg-[#feff9c]",
    "bg-[#96b7a5]",
  ];

  // let bubbleColorHex =
  //   bubbleColorHexArr[Math.floor(Math.random() * bubbleColorHexArr.length)];

  let bubbleColorHex = bubbleColorHexArr[7]; //"bg-[#96b7a5] 

  const colorClassName =
    props.message.role === "user"
      ? "bg-slate-300"
      : bubbleColorHex + " text-black";
  const alignmentClassName =
    props.message.role === "user" ? "ml-auto" : "mr-auto";
  const prefix = props.message.role === "user" ? "🤔" : props.aiEmoji;
  const borderRadiusClassName =
    props.message.role === "user" ? "rounded-br-none " : "rounded-bl-none";

  return (
    <div
      className={`${alignmentClassName} ${colorClassName} ${borderRadiusClassName} rounded-lg px-4 py-2 max-w-[80%] mb-8 flex`}
    >
      <div className="mr-2">{prefix}</div>
      <div className="whitespace-pre-wrap flex flex-col">
        <span>{props.message.content}</span>
        {props.sources && props.sources.length ? (
          <>
            <code className="mt-4 mr-auto bg-slate-300 px-2 py-1 rounded">
              <h2>🔍 Sources:</h2>
            </code>
            <code className="mt-1 mr-2 bg-slate-300 px-2 py-1 rounded text-xs">
              {props.sources?.map((source, i) => (
                <div className="mt-2" key={"source:" + i}>
                  {i + 1}. &quot;{source.pageContent}&quot;
                  {source.metadata?.loc?.lines !== undefined ? (
                    <div>
                      <br />
                      Lines {source.metadata?.loc?.lines?.from} to{" "}
                      {source.metadata?.loc?.lines?.to}
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              ))}
            </code>
          </>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
