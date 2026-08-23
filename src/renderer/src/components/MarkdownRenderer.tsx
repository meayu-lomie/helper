import { useState, type ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeHighlight from 'rehype-highlight'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/vs2015.css'

/**
 * AI 常用 \(...\) / \[...\] 作为公式分隔符，remark-math 只认 $ / $$，
 * 这里做归一。代码围栏内的内容原样保留，避免误伤代码里的反斜杠括号。
 */
function normalizeMathDelimiters(markdown: string): string {
  return markdown
    .split('```')
    .map((part, index) => {
      if (index % 2 === 1) return part
      // replace 的替换串里 $$ 表示字面 $，因此输出两个 $ 需要写四个
      return part.replace(/\\\(/g, '$').replace(/\\\)/g, '$').replace(/\\\[/g, '$$$$').replace(/\\\]/g, '$$$$')
    })
    .join('```')
}

/** 递归提取 React 子节点的纯文本（高亮后的代码是多层 span 结构） */
function nodeToText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(nodeToText).join('')
  if (typeof node === 'object' && 'props' in node) {
    return nodeToText((node.props as { children?: ReactNode }).children)
  }
  return ''
}

function CopyCodeButton({ getText }: { getText: () => string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getText())
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (error) {
      console.error('Failed to copy code:', error)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="absolute top-1.5 right-1.5 z-10 h-6 px-2 rounded-md border border-[#3e3e42] bg-[#2d2d30] text-xs text-[#9a9a9a] hover:text-[#d4d4d4] transition-colors cursor-pointer select-none"
    >
      {copied ? '已复制' : '复制'}
    </button>
  )
}

// Ref https://github.com/tailwindlabs/tailwindcss-typography to fine-tune the markdown style
export default function MarkdownRenderer({
  children,
  highlight = true
}: {
  children: string
  /** 流式期间关闭代码高亮：代码块未完整时高亮无意义，且高亮是渲染的最大开销 */
  highlight?: boolean
}) {
  return (
    <div className="prose prose-sm prose-invert max-w-none prose-pre:p-0 prose-code:text-xs">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          [rehypeKatex, { throwOnError: false, strict: false }],
          ...(highlight ? [rehypeHighlight] : [])
        ]}
        components={{
          pre({ children }) {
            return (
              <div className="relative group">
                <CopyCodeButton getText={() => nodeToText(children)} />
                <pre>{children}</pre>
              </div>
            )
          }
        }}
      >
        {normalizeMathDelimiters(children)}
      </ReactMarkdown>
    </div>
  )
}
