/**
 * 界面主题：预设 + 自定义。所有颜色经 CSS 变量注入 documentElement，
 * main.css 与组件只消费变量，切换主题无需改动任何样式规则。
 */
export interface ThemeColors {
  /** 内容区背景 */
  background: string
  /** 卡片 / 代码块背景 */
  card: string
  /** 边框 */
  border: string
  /** 标题栏与悬浮工具条 */
  headerBar: string
  /** 强调色（按钮、链接、焦点环） */
  accent: string
}

export interface ThemePreset {
  id: string
  name: string
  colors: ThemeColors
  /** 联动的 highlight.js 主题名（styles 目录下的文件名，不含扩展名） */
  hljsTheme: string
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'vscode',
    name: 'VS Code',
    colors: {
      background: '#1e1e1e',
      card: '#252526',
      border: '#3e3e42',
      headerBar: '#3c3c3c',
      accent: '#007acc'
    },
    hljsTheme: 'vs2015'
  },
  {
    id: 'github',
    name: 'GitHub Dark',
    colors: {
      background: '#0d1117',
      card: '#161b22',
      border: '#30363d',
      headerBar: '#161b22',
      accent: '#2f81f7'
    },
    hljsTheme: 'github-dark'
  },
  {
    id: 'onedark',
    name: 'One Dark',
    colors: {
      background: '#282c34',
      card: '#21252b',
      border: '#3e4451',
      headerBar: '#21252b',
      accent: '#61afef'
    },
    hljsTheme: 'atom-one-dark'
  },
  {
    id: 'dracula',
    name: 'Dracula',
    colors: {
      background: '#282a36',
      card: '#21222c',
      border: '#44475a',
      headerBar: '#21222c',
      accent: '#bd93f9'
    },
    hljsTheme: 'dracula'
  }
]

/** 自定义主题的 id，settings.themeId 取该值时使用 customTheme 配色 */
export const CUSTOM_THEME_ID = 'custom'

export function resolveThemeColors(
  themeId: string,
  customTheme: ThemeColors
): { colors: ThemeColors; hljsTheme: string } {
  const preset = THEME_PRESETS.find((p) => p.id === themeId)
  if (!preset) {
    if (themeId === CUSTOM_THEME_ID) {
      return { colors: customTheme, hljsTheme: 'vs2015' }
    }
    return { colors: THEME_PRESETS[0].colors, hljsTheme: THEME_PRESETS[0].hljsTheme }
  }
  return { colors: preset.colors, hljsTheme: preset.hljsTheme }
}

/** 把主题颜色写入根元素 CSS 变量，同时同步 shadcn 语义变量使组件跟随 */
export function applyThemeColors(colors: ThemeColors): void {
  const root = document.documentElement.style
  root.setProperty('--app-background', colors.background)
  root.setProperty('--app-card', colors.card)
  root.setProperty('--app-border', colors.border)
  root.setProperty('--app-header', colors.headerBar)
  root.setProperty('--app-accent', colors.accent)

  root.setProperty('--background', colors.background)
  root.setProperty('--foreground', pickReadableForeground(colors.background))
  root.setProperty('--card', colors.card)
  root.setProperty('--card-foreground', root.getPropertyValue('--foreground'))
  root.setProperty('--popover', colors.card)
  root.setProperty('--popover-foreground', root.getPropertyValue('--foreground'))
  root.setProperty('--border', colors.border)
  root.setProperty('--input', colors.border)
  root.setProperty('--primary', colors.accent)
  root.setProperty('--ring', colors.accent)
}

/** 依背景亮度选择可读的前景色（深底用浅字） */
function pickReadableForeground(background: string): string {
  const rgb = hexToRgb(background)
  if (!rgb) return '#d4d4d4'
  const luminance = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b
  return luminance > 150 ? '#1f2328' : '#d4d4d4'
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.replace('#', '')
  const full =
    normalized.length === 3
      ? normalized
          .split('')
          .map((ch) => ch + ch)
          .join('')
      : normalized
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16)
  }
}
