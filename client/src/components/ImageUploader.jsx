import { useState } from 'react';

// Настройки Cloudinary (можно захардкодить здесь или вынести в .env)
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dimdhcp2w';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'xyz123';

export default function ImageUploader({ imageUrl, onUploadSuccess, addLog }) {
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    if (addLog) addLog('⏳ Загружаем фото в облако Cloudinary...', 'info');
    
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', UPLOAD_PRESET);
    data.append('cloud_name', CLOUD_NAME);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: data
      });
      const uploadedImage = await res.json();
      
      if (uploadedImage.secure_url) {
        onUploadSuccess(uploadedImage.secure_url);
        if (addLog) addLog('✅ Фото успешно загружено!', 'success');
      } else {
        if (addLog) addLog('❌ Cloudinary не вернул ссылку. Проверь настройки пресета.', 'error');
      }
    } catch (err) {
      if (addLog) addLog('❌ Ошибка сети при загрузке фото', 'error');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ background: '#21262d', padding: '12px', borderRadius: '6px', marginBottom: '12px', border: '1px solid #30363d' }}>
      <label style={{ display: 'block', fontSize: '12px', marginBottom: '8px', color: '#8b949e', fontWeight: 'bold' }}>Фотография заведения:</label>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ background: '#30363d', color: '#c9d1d9', padding: '10px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap', transition: '0.2s', border: '1px solid #484f58' }}>
          {isUploading ? '⏳ Грузим...' : '📁 Выбрать с устройства'}
          <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={isUploading} />
        </label>
        <span style={{ color: '#8b949e', fontSize: '12px' }}>или URL:</span>
        <input 
          type="text"
          className="input-field" 
          placeholder="Вставь URL картинки..." 
          value={imageUrl} 
          onChange={e => onUploadSuccess(e.target.value)} 
          style={{ marginBottom: 0, flex: 1, minWidth: '150px', width: 'auto' }} 
        />
      </div>
      {imageUrl && (
        <div style={{ marginTop: '10px', position: 'relative', width: 'fit-content' }}>
          <img src={imageUrl} alt="preview" style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #30363d' }} />
        </div>
      )}
    </div>
  );
}