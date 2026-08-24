import vscodeDarkHljs from 'highlight.js/styles/vs2015.css?inline'
import githubDarkHljs from 'highlight.js/styles/github-dark.css?inline'
import oneDarkHljs from 'highlight.js/styles/atom-one-dark.css?inline'
import vsLightHljs from 'highlight.js/styles/vs.css?inline'
import githubLightHljs from 'highlight.js/styles/github.css?inline'

/** 一套主题需要的全部 CSS 变量（key 为驼峰，写入时映射为 --kebab-case） */
export interface ThemeColors {
  background: string
  foreground: string
  card: string
  popover: string
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  muted: string
  mutedForeground: string
  accent: string
  accentForeground: string
  destructive: string
  destructiveForeground: string
  border: string
  input: string
  ring: string
  /** 标题栏与悬浮工具条 */
  headerBg: string
  headerFg: string
  /** 代码块 */
  codeBg: string
  codeBorder: string
  scrollbarThumb: string
  scrollbarThumbHover: string
}

export interface ThemeDefinition {
  id: string
  name: string
  appearance: 'dark' | 'light'
  /** 该主题配套的 highlight.js 样式 id */
  hljsStyle: string
  colors: ThemeColors
}

const THEME_VARS: Record<keyof ThemeColors, string> = {
  background: '--background',
  foreground: '--foreground',
  card: '--card',
  popover: '--popover',
  primary: '--primary',
  primaryForeground: '--primary-foreground',
  secondary: '--secondary',
  secondaryForeground: '--secondary-foreground',
  muted: '--muted',
  mutedForeground: '--muted-foreground',
  accent: '--accent',
  accentForeground: '--accent-foreground',
  destructive: '--destructive',
  destructiveForeground: '--destructive-foreground',
  border: '--border',
  input: '--input',
  ring: '--ring',
  headerBg: '--header-bg',
  headerFg: '--header-fg',
  codeBg: '--code-bg',
  codeBorder: '--code-border',
  scrollbarThumb: '--scrollbar-thumb',
  scrollbarThumbHover: '--scrollbar-thumb-hover'
}

const HLJS_STYLES: Record<string, string> = {
  vs2015: vscodeDarkHljs,
  'github-dark': githubDarkHljs,
  'atom-one-dark': oneDarkHljs,
  vs: vsLightHljs,
  github: githubLightHljs
}

function makeColors(
  partials: Partial<ThemeColors> & Pick<ThemeColors, 'background' | 'foreground'>
): ThemeColors {
  return {
    card: partials.background,
    popover: partials.background,
    primary: '#007acc',
    primaryForeground: '#ffffff',
    secondary: partials.card ?? partials.background,
    secondaryForeground: partials.foreground,
    muted: partials.card ?? partials.background,
    mutedForeground: partials.foreground,
    accent: partials.card ?? partials.background,
    accentForeground: partials.foreground,
    destructive: '#f14c4c',
    destructiveForeground: '#ffffff',
    border: partials.border ?? '#3e3e42',
    input: partials.border ?? '#3e3e42',
    ring: partials.primary ?? '#007acc',
    headerBg: partials.headerBg ?? partials.card ?? partials.background,
    headerFg: partials.headerFg ?? partials.foreground,
    codeBg: partials.codeBg ?? partials.card ?? partials.background,
    codeBorder: partials.codeBorder ?? partials.border ?? '#3e3e42',
    scrollbarThumb: partials.scrollbarThumb ?? partials.border ?? '#3e3e42',
    scrollbarThumbHover: partials.scrollbarThumbHover ?? partials.mutedForeground ?? '#4f4f52',
    ...partials
  } as ThemeColors
}

export const THEMES: ThemeDefinition[] = [
  {
    id: 'vscode-dark',
    name: 'VS Code Dark+',
    appearance: 'dark',
    hljsStyle: 'vs2015',
    colors: makeColors({
      background: '#1e1e1e',
      foreground: '#d4d4d4',
      card: '#252526',
      border: '#3e3e42',
      primary: '#007acc',
      mutedForeground: '#9a9a9a',
      headerBg: '#3c3c3c',
      headerFg: '#ffffff',
      codeBg: '#252526',
      codeBorder: '#3e3e42',
      scrollbarThumb: '#3e3e42',
      scrollbarThumbHover: '#4f4f52'
    })
  },
  {
    id: 'github-dark',
    name: 'GitHub Dark',
    appearance: 'dark',
    hljsStyle: 'github-dark',
    colors: makeColors({
      background: '#0d1117',
      foreground: '#e6edf3',
      card: '#161b22',
      border: '#30363d',
      primary: '#1f6feb',
      mutedForeground: '#8b949e',
      headerBg: '#010409',
      headerFg: '#f0f6fc',
      codeBg: '#161b22',
      codeBorder: '#30363d',
      scrollbarThumb: '#30363d',
      scrollbarThumbHover: '#484f58'
    })
  },
  {
    id: 'one-dark',
    name: 'One Dark Pro',
    appearance: 'dark',
    hljsStyle: 'atom-one-dark',
    colors: makeColors({
      background: '#282c34',
      foreground: '#abb2bf',
      card: '#21252b',
      border: '#3e4451',
      primary: '#61afef',
      mutedForeground: '#7f848e',
      headerBg: '#21252b',
      headerFg: '#abb2bf',
      codeBg: '#21252b',
      codeBorder: '#3e4451',
      scrollbarThumb: '#3e4451',
      scrollbarThumbHover: '#4d5566'
    })
  },
  {
    id: 'vscode-light',
    name: 'VS Code Light',
    appearance: 'light',
    hljsStyle: 'vs',
    colors: makeColors({
      background: '#ffffff',
      foreground: '#3b3b3b',
      card: '#f3f3f3',
      border: '#d4d4d4',
      primary: '#005fb8',
      mutedForeground: '#616161',
      headerBg: '#dddddd',
      headerFg: '#3b3b3b',
      codeBg: '#f3f3f3',
      codeBorder: '#d4d4d4',
      scrollbarThumb: '#c1c1c1',
      scrollbarThumbHover: '#a8a8a8'
    })
  },
  {
    id: 'github-light',
    name: 'GitHub Light',
    appearance: 'light',
    hljsStyle: 'github',
    colors: makeColors({
      background: '#ffffff',
      foreground: '#1f2328',
      card: '#f6f8fa',
      border: '#d1d9e0',
      primary: '#0969da',
      mutedForeground: '#59636e',
      headerBg: '#f6f8fa',
      headerFg: '#1f2328',
      codeBg: '#f6f8fa',
      codeBorder: '#d1d9e0',
      scrollbarThumb: '#d1d9e0',
      scrollbarThumbHover: '#afb8c1'
    })
  }
]

export const DEFAULT_THEME_ID = 'vscode-dark'

const HLJS_STYLE_ELEMENT_ID = 'hljs-theme-style'

/** 把主题变量写到根元素并注入配套的 highlight.js 配色 */
export function applyTheme(themeId: string, customColors?: Partial<ThemeColors>): void {
  const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[0]
  const colors: ThemeColors = { ...theme.colors, ...customColors }

  const root = document.documentElement
  for (const [key, cssVar] of Object.entries(THEME_VARS)) {
    root.style.setProperty(cssVar, colors[key as keyof ThemeColors])
  }
  root.dataset.themeAppearance = theme.appearance

  let styleEl = document.getElementById(HLJS_STYLE_ELEMENT_ID)
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = HLJS_STYLE_ELEMENT_ID
    document.head.appendChild(styleEl)
  }
  styleEl.textContent = HLJS_STYLES[theme.hljsStyle] ?? ''
}
