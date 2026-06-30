import { AppMockup } from "@/components/cross-app/AppMockup";
import type { AppSource } from "@/types";

export function WeChatMockup({ source }: { source: AppSource }) {
  return (
    <AppMockup label={source.label} subtitle={source.subtitle}>
      <div className="flex flex-1 flex-col gap-3 bg-[#f5f6f7] p-4">
        {source.messages.map((message) => {
          const fromUser = message.role === "user";
          return (
            <div key={message.id} className={`flex ${fromUser ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[82%] ${fromUser ? "text-right" : "text-left"}`}>
                {message.timestamp ? (
                  <p className="mb-1 text-center text-[11px] font-medium text-slate-400">{message.timestamp}</p>
                ) : null}
                <div
                  className={`rounded-2xl px-3.5 py-2.5 text-sm leading-6 shadow-sm ${
                    fromUser
                      ? "rounded-tr-md bg-indigo-600 text-white"
                      : "rounded-tl-md border border-slate-200 bg-white text-slate-800"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AppMockup>
  );
}
