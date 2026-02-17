"use client";

import { useChatWidget } from "../../hooks/use-chat-widget";
import { ChatWindow } from "./ChatWindow";

export function ChatWidget() {
  const {
    botOpened,
    onToggleBot,
    onSendMessage,
    chats,
    setChats,
    register,
    isAiTyping,
    messageWindowRef,
    botConfig,
    loading,
    errors,
    realTime,
    selectedLocation,
    locationPromptShown,
    onSelectLocation,
    showLocationPicker,
  } = useChatWidget();

  return (
    <div style={{ position: "fixed", bottom: 0, right: 0 }}>
      {botOpened && botConfig && (
        <div style={{ position: "fixed", top: 0, right: 45 }}>
          <ChatWindow
            ref={messageWindowRef}
            onClose={onToggleBot}
            domainName={botConfig.domainName}
            botIcon={botConfig.chatBot?.icon}
            headerText={botConfig.chatBot?.headerText}
            themeColor={botConfig.chatBot?.themeColor}
            chats={chats}
            setChats={setChats}
            helpDeskItems={botConfig.helpDeskItems}
            isAiTyping={isAiTyping}
            register={register}
            onSendMessage={onSendMessage}
            errors={errors}
            realtimeMode={realTime}
            locations={botConfig.locations}
            selectedLocation={selectedLocation}
            locationPromptShown={locationPromptShown}
            showLocationPicker={showLocationPicker}
            onSelectLocation={onSelectLocation}
          />
        </div>
      )}

      <div
        onClick={onToggleBot}
        style={{
          position: "absolute",
          bottom: 10,
          right: 10,
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: botConfig?.chatBot?.bubbleTransparent
            ? "transparent"
            : botConfig?.chatBot?.themeColor || "#14b8a6",
          display: loading ? "none" : "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: botConfig?.chatBot?.bubbleTransparent
            ? "none"
            : "0 4px 12px rgba(0,0,0,0.15)",
        }}
      >
        {botConfig?.chatBot?.icon ? (
          <img
            src={botConfig.chatBot.icon}
            alt="Chat"
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        ) : (
          <svg
            width="28"
            height="28"
            viewBox="0 0 47 47"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16.8297 20.6851H30.3231"
              stroke="white"
              strokeWidth="4.45582"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21.6488 35.9713L30.2267 41.6771C31.4989 42.5253 33.2145 41.6193 33.2145 40.0772V35.9713C38.9974 35.9713 42.8526 32.1161 42.8526 26.3332V14.7675C42.8526 8.98464 38.9974 5.12939 33.2145 5.12939H13.9383C8.15541 5.12939 4.30017 8.98464 4.30017 14.7675V26.3332C4.30017 32.1161 8.15541 35.9713 13.9383 35.9713H21.6488Z"
              stroke="white"
              strokeWidth="4.45582"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    </div>
  );
}
