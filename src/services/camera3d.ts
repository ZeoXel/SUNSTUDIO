/**
 * 3D 相机运镜服务
 *
 * 将相机参数转换为自然语言提示词，用于图像模型理解视角变化
 *
 * 坐标系说明：
 * - azimuth (方位角): 相机绕Y轴旋转，0°=正前方，顺时针增加
 *   - 0° = 相机在正前方，看到主体正面
 *   - 90° = 相机在右侧，看到主体左侧面
 *   - 180° = 相机在后方，看到主体背面
 *   - 270° = 相机在左侧，看到主体右侧面
 * - elevation (俯仰角): -30°=仰视，0°=平视，60°=俯视
 * - distance (距离): 0.6=近景，1.0=中景，1.5=远景
 */

import type { CameraParams } from '@/types';

// ==================== 提示词策略 ====================

export type PromptStyle = 'command' | 'qwen';

/**
 * 生成用于显示的简短视角描述
 */
export function generateCameraPrompt(params: CameraParams): string {
  const az = ((params.azimuth % 360) + 360) % 360;
  const el = params.elevation;
  const dist = params.distance;

  // 水平方位
  let horizontal: string;
  if (az <= 15 || az > 345) horizontal = 'front';
  else if (az <= 60) horizontal = 'front-left';
  else if (az <= 120) horizontal = 'left';
  else if (az <= 165) horizontal = 'back-left';
  else if (az <= 195) horizontal = 'back';
  else if (az <= 240) horizontal = 'back-right';
  else if (az <= 300) horizontal = 'right';
  else horizontal = 'front-right';

  // 垂直角度
  let vertical: string;
  if (el > 40) vertical = 'top-down';
  else if (el > 20) vertical = 'high angle';
  else if (el > 5) vertical = 'slightly above';
  else if (el >= -5) vertical = 'eye level';
  else if (el >= -20) vertical = 'low angle';
  else vertical = 'worm eye';

  // 景别
  let framing: string;
  if (dist < 0.75) framing = 'ECU';
  else if (dist < 0.9) framing = 'CU';
  else if (dist <= 1.1) framing = 'MS';
  else if (dist <= 1.3) framing = 'MWS';
  else framing = 'WS';

  return `${horizontal} · ${vertical} · ${framing}`;
}

/**
 * 生成指令式提示词（用于通用图像模型）
 * 参考 Qwen-Edit LoRA 的简洁指令风格
 */
export function generateFullPrompt(params: CameraParams, customPrompt?: string): string {
  const az = ((params.azimuth % 360) + 360) % 360;
  const el = params.elevation;
  const dist = params.distance;

  const commands: string[] = [];

  // 1. 水平旋转指令 - 使用精确角度
  if (az > 15 && az <= 345) {
    if (az <= 180) {
      // 相机向右移动 = 看到主体左侧
      commands.push(`Rotate the camera ${Math.round(az)}° to the right to show the subject's left side`);
    } else {
      // 相机向左移动 = 看到主体右侧
      const leftAngle = 360 - az;
      commands.push(`Rotate the camera ${Math.round(leftAngle)}° to the left to show the subject's right side`);
    }
  }

  // 2. 垂直俯仰指令
  if (el > 10) {
    if (el > 50) {
      commands.push('Move the camera to a top-down bird\'s eye view');
    } else if (el > 30) {
      commands.push(`Tilt the camera down ${Math.round(el)}° for a high angle shot`);
    } else {
      commands.push(`Tilt the camera down ${Math.round(el)}° for a slightly elevated view`);
    }
  } else if (el < -10) {
    if (el < -25) {
      commands.push('Move the camera to a dramatic low angle worm\'s eye view');
    } else {
      commands.push(`Tilt the camera up ${Math.round(Math.abs(el))}° for a low angle shot`);
    }
  }

  // 3. 距离/景别指令
  if (dist < 0.8) {
    commands.push('Move the camera forward for an extreme close-up');
  } else if (dist < 0.95) {
    commands.push('Move the camera closer for a close-up shot');
  } else if (dist > 1.25) {
    commands.push('Move the camera back for a wide shot');
  }

  // 如果没有任何变化，保持原样
  if (commands.length === 0) {
    commands.push('Keep the current frontal eye-level view');
  }

  // 组合指令
  const cameraInstructions = commands.join('. ');

  // 构建完整提示词
  const basePrompt = `${cameraInstructions}. Maintain the subject's identity, appearance, and all visual details while changing only the viewing angle.`;

  if (customPrompt && customPrompt.trim()) {
    return `${basePrompt} ${customPrompt.trim()}`;
  }

  return basePrompt;
}

/**
 * 生成 Qwen-Edit 专用提示词
 * 使用 Qwen-Edit LoRA 理解的简洁指令格式
 */
export function generateQwenPrompt(params: CameraParams, customPrompt?: string): string {
  const az = ((params.azimuth % 360) + 360) % 360;
  const el = params.elevation;
  const dist = params.distance;

  const commands: string[] = [];

  // Qwen-Edit 风格的简洁指令

  // 1. 水平旋转
  if (az > 20 && az <= 340) {
    if (az <= 180) {
      if (az <= 60) {
        commands.push(`将镜头向右旋转${Math.round(az)}度`);
      } else if (az <= 120) {
        commands.push('将镜头移到左侧');
      } else {
        commands.push('将镜头移到后方');
      }
    } else {
      const leftAngle = 360 - az;
      if (leftAngle <= 60) {
        commands.push(`将镜头向左旋转${Math.round(leftAngle)}度`);
      } else if (leftAngle <= 120) {
        commands.push('将镜头移到右侧');
      } else {
        commands.push('将镜头移到后方');
      }
    }
  }

  // 2. 垂直俯仰
  if (el > 40) {
    commands.push('将镜头转为俯视');
  } else if (el > 15) {
    commands.push('将镜头向下倾斜');
  } else if (el < -15) {
    commands.push('将镜头向上倾斜');
  }

  // 3. 距离
  if (dist < 0.8) {
    commands.push('将镜头转为特写镜头');
  } else if (dist > 1.25) {
    commands.push('将镜头转为广角镜头');
  }

  // 默认保持
  if (commands.length === 0) {
    return customPrompt?.trim() || '保持当前视角';
  }

  const instruction = commands.join('，');

  if (customPrompt && customPrompt.trim()) {
    return `${instruction}。${customPrompt.trim()}`;
  }

  return instruction;
}

// ==================== 默认参数 ====================

export const DEFAULT_CAMERA_PARAMS: CameraParams = {
  azimuth: 0,      // 正前方
  elevation: 0,    // 眼平线
  distance: 1.0,   // 标准焦距
};

// ==================== 参数约束 ====================

export const CAMERA_PARAMS_LIMITS = {
  azimuth: { min: 0, max: 360 },
  elevation: { min: -30, max: 60 },
  distance: { min: 0.6, max: 1.5 },
};

/**
 * 约束相机参数到有效范围
 */
export function clampCameraParams(params: Partial<CameraParams>): Partial<CameraParams> {
  const result: Partial<CameraParams> = {};

  if (params.azimuth !== undefined) {
    let az = params.azimuth % 360;
    if (az < 0) az += 360;
    result.azimuth = az;
  }

  if (params.elevation !== undefined) {
    result.elevation = Math.max(
      CAMERA_PARAMS_LIMITS.elevation.min,
      Math.min(CAMERA_PARAMS_LIMITS.elevation.max, params.elevation)
    );
  }

  if (params.distance !== undefined) {
    result.distance = Math.max(
      CAMERA_PARAMS_LIMITS.distance.min,
      Math.min(CAMERA_PARAMS_LIMITS.distance.max, params.distance)
    );
  }

  return result;
}
