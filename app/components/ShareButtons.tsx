interface ShareButtonsProps {
  shareUrl: string;
  shareText: string;
  cardId: string;
  accentColor?: string;
}

export function ShareButtons({ shareUrl, shareText, cardId, accentColor = "#facc15" }: ShareButtonsProps) {
  const shareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
  };

  const shareTelegram = () => {
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      "_blank"
    );
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`, "_blank");
  };

  const shareViber = () => {
    window.open(`viber://forward?text=${encodeURIComponent(shareText + " " + shareUrl)}`, "_blank");
  };

  const nativeShare = async () => {
    const cardEl = document.getElementById(cardId);
    if (!cardEl) return;

    // Dynamic import html2canvas only on client
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(cardEl, {
      backgroundColor: "#0f0f1a",
      scale: 2,
      useCORS: true,
      logging: false,
    });

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], "dafuqbro-card.png", { type: "image/png" });
      const shareData = {
        files: [file],
        title: "DaFuqBro",
        text: shareText,
        url: shareUrl,
      };

      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
          return;
        } catch {}
      }

      // Desktop fallback
      const link = document.createElement("a");
      link.download = "dafuqbro-card.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    }, "image/png");
  };

  const btnClass =
    "flex flex-col items-center gap-1.5 py-3.5 px-2 rounded-xl border border-white/[0.06] bg-white/[0.03] text-[#a1a1aa] font-['Outfit'] text-[0.72rem] font-medium cursor-pointer transition-all hover:bg-white/[0.08] hover:border-white/[0.12] hover:-translate-y-0.5";

  return (
    <div className="w-full max-w-[480px] flex flex-col items-center gap-5">
      {/* Warning */}
      <div className="text-center">
        <div className="font-bold text-[1.05rem]" style={{ color: accentColor }}>
          ⚠️ Share it or lose it forever
        </div>
        <div className="font-['JetBrains_Mono'] text-[0.78rem] text-[#71717a]">
          we don't store any of your data
        </div>
      </div>

      {/* Share grid */}
      <div className="grid grid-cols-3 sm:grid-cols-3 gap-2.5 w-full">
        <button onClick={shareTwitter} className={btnClass}>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Twitter
        </button>
        <button onClick={shareFacebook} className={btnClass}>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Facebook
        </button>
        <button onClick={shareTelegram} className={btnClass}>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#26A5DE">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
          </svg>
          Telegram
        </button>
        <button onClick={shareWhatsApp} className={btnClass}>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#25D366">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
          </svg>
          WhatsApp
        </button>
        <button onClick={shareViber} className={btnClass}>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#7360F2">
            <path d="M11.4 0C9.473.028 5.333.344 3.02 2.467 1.302 4.187.541 6.783.46 9.934c-.081 3.15-.187 9.057 5.545 10.588h.005l-.003 2.416s-.037.975.607 1.173c.777.24 1.233-.5 1.976-1.3.407-.44.969-1.086 1.394-1.58 3.842.322 6.796-.416 7.132-.526.776-.254 5.164-.815 5.877-6.652.737-6.014-.354-9.81-2.35-11.527C18.706.888 15.41.01 11.4 0z" />
          </svg>
          Viber
        </button>
        <button onClick={nativeShare} className={btnClass}>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z" />
          </svg>
          Share...
        </button>
      </div>
    </div>
  );
}
