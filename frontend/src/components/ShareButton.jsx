import React, { useState } from 'react';

const ShareButton = ({ product }) => {
  const [showShareOptions, setShowShareOptions] = useState(false);

  const shareUrl = `${window.location.origin}/product/${product._id}`;
  const shareText = `Check out ${product.name} from KrishiSetu - Fresh ${product.category} at ₹${product.price}/${product.unit}`;

  const shareMethods = {
    whatsapp: () => {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
    },
    facebook: () => {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    },
    twitter: () => {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    },
    copy: async () => {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Link copied to clipboard!');
      }
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowShareOptions(!showShareOptions)}
        className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
        title="Share product"
      >
        📤
      </button>

      {showShareOptions && (
        <div className="absolute right-0 top-10 bg-white rounded-lg shadow-lg p-3 z-10 min-w-48">
          <div className="space-y-2">
            <button
              onClick={() => { shareMethods.whatsapp(); setShowShareOptions(false); }}
              className="w-full text-left px-3 py-2 hover:bg-green-50 rounded flex items-center space-x-2"
            >
              <span>💚</span>
              <span>WhatsApp</span>
            </button>
            <button
              onClick={() => { shareMethods.facebook(); setShowShareOptions(false); }}
              className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded flex items-center space-x-2"
            >
              <span>📘</span>
              <span>Facebook</span>
            </button>
            <button
              onClick={() => { shareMethods.twitter(); setShowShareOptions(false); }}
              className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded flex items-center space-x-2"
            >
              <span>🐦</span>
              <span>Twitter</span>
            </button>
            <button
              onClick={() => { shareMethods.copy(); setShowShareOptions(false); }}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded flex items-center space-x-2"
            >
              <span>📋</span>
              <span>Copy Link</span>
            </button>
          </div>
        </div>
      )}

      {/* Close when clicking outside */}
      {showShareOptions && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowShareOptions(false)}
        />
      )}
    </div>
  );
};

export default ShareButton;