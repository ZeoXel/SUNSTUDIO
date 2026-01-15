/**
 * 主体服务 - 提供主体相关工具函数
 */

/**
 * 生成缩略图 - 压缩图片用于预览
 * @param imageBase64 原始图片 Base64
 * @param maxSize 最大尺寸（默认 200px）
 * @returns 压缩后的图片 Base64
 */
export const generateThumbnail = (imageBase64: string, maxSize: number = 200): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('无法创建 Canvas'));
        return;
      }

      // 计算缩放比例
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      // 绘制缩略图
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // 转换为 Base64
      const thumbnail = canvas.toDataURL('image/png');
      resolve(thumbnail);
    };
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = imageBase64;
  });
};

/**
 * 生成唯一的主体 ID
 * @param prefix 前缀（默认 'subj'）
 * @returns 唯一 ID
 */
export const generateSubjectId = (prefix: string = 'subj'): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `${prefix}_${timestamp}_${random}`;
};

/**
 * 生成唯一的主体图片 ID
 * @returns 唯一 ID
 */
export const generateSubjectImageId = (): string => {
  return generateSubjectId('simg');
};
