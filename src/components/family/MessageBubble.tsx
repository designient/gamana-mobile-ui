import type { FamilyMessage } from '../../types';
import { AlertTriangle } from 'lucide-react';
import LocationPingCard from './LocationPingCard';

interface MessageBubbleProps {
  message: FamilyMessage;
  isOutgoing: boolean;
  showSender: boolean;
  showTimestamp: boolean;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function MessageBubble({ message, isOutgoing, showSender, showTimestamp }: MessageBubbleProps) {
  const isSOS = message.type === 'alert' && message.text.startsWith('SOS');

  if (message.type === 'system' || message.type === 'alert') {
    return (
      <div className="flex flex-col items-center my-3 gap-1.5">
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full max-w-[85%] ${
            isSOS ? 'bg-red-100 dark:bg-red-900/30' : 'bg-surface-muted'
          }`}
        >
          {message.type === 'alert' && (
            <AlertTriangle size={12} className={`flex-shrink-0 ${isSOS ? 'text-red-500' : 'text-amber-500'}`} />
          )}
          <span className={`text-[11px] text-center font-medium ${isSOS ? 'text-red-600' : 'text-secondary'}`}>
            {message.text}
          </span>
        </div>
        {isSOS && message.location && (
          <LocationPingCard
            senderName={message.senderName}
            lat={message.location.lat}
            lng={message.location.lng}
            isOutgoing={false}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'} mb-1`}>
      <div className={`flex gap-2 max-w-[80%] ${isOutgoing ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar for incoming */}
        {!isOutgoing && showSender && (
          <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mt-auto">
            {message.senderAvatarUrl ? (
              <img src={message.senderAvatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-white text-[9px] font-bold"
                style={{ backgroundColor: message.senderColor }}
              >
                {message.senderInitials}
              </div>
            )}
          </div>
        )}
        {!isOutgoing && !showSender && <div className="w-7 flex-shrink-0" />}

        <div className={`flex flex-col ${isOutgoing ? 'items-end' : 'items-start'}`}>
          {/* Sender name */}
          {!isOutgoing && showSender && (
            <span className="text-[10px] font-medium text-secondary mb-0.5 ml-1">
              {message.senderName}
            </span>
          )}

          {/* Location ping */}
          {message.type === 'location_ping' && message.location ? (
            <LocationPingCard
              senderName={message.senderName}
              lat={message.location.lat}
              lng={message.location.lng}
              isOutgoing={isOutgoing}
            />
          ) : (
            <div
              className={`px-3.5 py-2 rounded-2xl ${
                isOutgoing
                  ? 'bg-gamana-500 text-white rounded-br-md'
                  : 'bg-surface-muted text-gray-900 rounded-bl-md'
              }`}
            >
              <p className="text-[13px] leading-relaxed whitespace-pre-wrap break-words">
                {message.text}
              </p>
            </div>
          )}

          {/* Timestamp */}
          {showTimestamp && (
            <span className={`text-[9px] text-muted mt-0.5 ${isOutgoing ? 'mr-1' : 'ml-1'}`}>
              {formatTime(message.createdAt)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
