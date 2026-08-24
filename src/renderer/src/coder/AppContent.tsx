import { useEffect, useRef, useState } from 'react'
import { useSolutionStore } from '@/lib/store/solution'
import MarkdownRenderer from '@/components/MarkdownRenderer'

const SCROLL_OFFSET = 120
/** 距底部小于该值视为"贴底"，流式输出时自动跟随 */
const PINNED_THRESHOLD = 40

export function AppContent() {
  const {
    isLoading,
    screenshotData,
    solutionChunks,
    errorMessage,
    setScreenshotData,
    setIsLoading,
    addSolutionChunk,
    setErrorMessage,
    clearSolution
  } = useSolutionStore()

  const [recentScreenshots, setRecentScreenshots] = useState<string[]>([])

  // 流式期间渲染 Markdown（节流合并、暂不高亮），结束后再做一次完整解析高亮
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState('')

  const contentRef = useRef<HTMLDivElement>(null)
  /** 用户是否停留在底部；一旦手动上滚查看就暂停自动跟随 */
  const isPinnedRef = useRef(true)

  useEffect(() => {
    // Listen for screenshot events (latest)
    window.api.onScreenshotTaken((data: string) => {
      setScreenshotData(data)
    })

    // Listen for screenshots-updated events (gallery)
    window.api.onScreenshotsUpdated((screenshots: string[]) => {
      setRecentScreenshots(screenshots)
    })

    // New session clear (pictures + answers)
    window.api.onSolutionClear(() => {
      clearSolution()
      setRecentScreenshots([])
      setScreenshotData(null)
      setErrorMessage(null)
      setIsStreaming(false)
      setStreamingText('')
    })

    // Listen for solution chunks
    window.api.onSolutionChunk((chunk: string) => {
      addSolutionChunk(chunk)
    })

    // AI loading
    window.api.onAiLoadingStart(() => {
      setIsLoading(true)
      setErrorMessage(null) // Clear error when new request starts
      setIsStreaming(true)
      setStreamingText(useSolutionStore.getState().solutionChunks.join(''))
    })
    window.api.onAiLoadingEnd(() => {
      setIsLoading(false)
    })

    // Cleanup listeners on unmount
    return () => {
      window.api.removeScreenshotListener()
      window.api.removeScreenshotsUpdatedListener()
      window.api.removeSolutionChunkListener()
      window.api.removeAiLoadingStartListener()
      window.api.removeAiLoadingEndListener()
      window.api.removeSolutionClearListener()
    }
  }, [setScreenshotData, clearSolution, setIsLoading, addSolutionChunk, setErrorMessage])

  // 流式期间按固定间隔从 store 读取增量文本，节流轻量渲染
  useEffect(() => {
    if (!isStreaming) return
    const id = setInterval(() => {
      setStreamingText(useSolutionStore.getState().solutionChunks.join(''))
    }, 100)
    return () => clearInterval(id)
  }, [isStreaming])

  // 追踪用户是否贴底，流式期间贴底则自动跟随滚动
  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    const onScroll = () => {
      const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight
      isPinnedRef.current = distanceToBottom < PINNED_THRESHOLD
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!isStreaming || !isPinnedRef.current) return
    const el = contentRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [isStreaming, streamingText])

  useEffect(() => {
    const finishStreaming = () => {
      setIsLoading(false)
      setIsStreaming(false)
      // 结束前同步一次完整文本，保证与 store 内容一致后切回完整 Markdown 渲染
      setStreamingText(useSolutionStore.getState().solutionChunks.join(''))
    }
    window.api.onSolutionComplete(() => {
      finishStreaming()
    })
    window.api.onSolutionStopped(() => {
      finishStreaming()
    })
    window.api.onSolutionError((message: string) => {
      finishStreaming()
      setErrorMessage(message)
    })
    return () => {
      window.api.removeSolutionCompleteListener()
      window.api.removeSolutionStoppedListener()
      window.api.removeSolutionErrorListener()
    }
  }, [setIsLoading, setErrorMessage])

  useEffect(() => {
    window.api.onScrollPageUp(() => {
      const container = document.getElementById('app-content')
      if (!container) return
      container.scrollTo({
        top: container.scrollTop - window.innerHeight + SCROLL_OFFSET,
        behavior: 'smooth'
      })
    })
    return () => {
      window.api.removeScrollPageUpListener()
    }
  }, [])

  useEffect(() => {
    window.api.onScrollPageDown(() => {
      const container = document.getElementById('app-content')
      if (!container) return
      container.scrollTo({
        top: container.scrollTop + window.innerHeight - SCROLL_OFFSET,
        behavior: 'smooth'
      })
    })
    return () => {
      window.api.removeScrollPageDownListener()
    }
  }, [])

  return (
    <div id="app-content" ref={contentRef} className="px-6 py-4">
      {/* 等待模型首 token：三点思考动画 */}
      {isLoading && !streamingText.trim() && (
        <div className="thinking-dots mb-4" role="status" aria-label="正在思考">
          <span />
          <span />
          <span />
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-3">
          <svg
            className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-red-400 font-medium text-sm">API 调用失败</p>
            <p className="text-red-300/80 text-sm mt-0.5 break-words">{errorMessage}</p>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-400/80 hover:text-red-300 flex-shrink-0"
            title="关闭"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {/*
       * Screenshot Gallery：不渲染真实截图内容，仅用字母占位标记数量，
       * 避免题目截图出现在助手窗口中
       */}
      {recentScreenshots.length > 0 ? (
        <div className="mb-4 flex gap-2">
          {recentScreenshots.map((_, index) => (
            <span
              key={index}
              title={`第 ${index + 1} 张截图`}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card text-xs text-muted-foreground select-none"
            >
              {String.fromCharCode(97 + (index % 26))}
            </span>
          ))}
        </div>
      ) : screenshotData ? (
        <div className="mb-4">
          <span
            title="已截取 1 张截图"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card text-xs text-muted-foreground select-none"
          >
            a
          </span>
        </div>
      ) : null}

      {/* Solution Display: 流式期间节流渲染 Markdown（暂不高亮），结束后完整渲染 + 高亮 */}
      {isStreaming ? (
        <MarkdownRenderer highlight={false}>{streamingText}</MarkdownRenderer>
      ) : (
        <MarkdownRenderer>{solutionChunks.join('')}</MarkdownRenderer>
      )}
    </div>
  )
}
