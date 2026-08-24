import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChevronsUpDown, Check, Plus, X } from 'lucide-react'
import { useSettingsStore } from '@/lib/store/settings'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'

const defaultModels = [
  { value: 'Qwen/Qwen3-VL-32B-Instruct', label: 'Qwen/Qwen3-VL-32B-Instruct' },
  { value: 'Qwen/Qwen3-VL-8B-Thinking', label: 'Qwen/Qwen3-VL-8B-Thinking' },
  { value: 'zai-org/GLM-4.5V', label: 'zai-org/GLM-4.5V' },
  { value: 'gpt-5-mini', label: 'gpt-5-mini' },
  { value: 'gpt-5.5', label: 'gpt-5.5' }
]

interface ModelItem {
  value: string
  label: string
  isCustom?: boolean
  group: 'server' | 'preset'
}

export function SelectModel({
  value,
  onChange,
  disabled,
  className
}: {
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const { customModels, serverModels, updateSetting } = useSettingsStore()

  const models = useMemo(() => {
    // 去重：服务端模型优先，其后是手动添加的自定义模型和预设列表
    const items: ModelItem[] = [
      ...serverModels.map((m) => ({ value: m, label: m, group: 'server' as const })),
      ...customModels.map((m) => ({
        value: m,
        label: m,
        isCustom: true,
        group: 'preset' as const
      })),
      ...defaultModels.map((m) => ({ ...m, isCustom: false, group: 'preset' as const }))
    ]
    const seen = new Set<string>()
    return items.filter((m) => (seen.has(m.value) ? false : (seen.add(m.value), true)))
  }, [customModels, serverModels])

  const addCustomModel = (newModel: string) => {
    const newValue = newModel.trim()
    if (!newValue) return
    const exists = models.some((m) => m.value === newValue)
    if (exists) {
      onChange?.(newValue)
      setOpen(false)
      setSearchValue('')
      return
    }
    updateSetting('customModels', [...customModels, newValue])
    onChange?.(newValue)
    setSearchValue('')
    setOpen(false)
  }

  const deleteCustomModel = (val: string) => {
    updateSetting(
      'customModels',
      customModels.filter((m) => m !== val)
    )
    if (value === val) {
      onChange?.('')
    }
  }

  const filtered = models.filter((m) => m.label.toLowerCase().includes(searchValue.toLowerCase()))
  const serverItems = filtered.filter((m) => m.group === 'server')
  const presetItems = filtered.filter((m) => m.group === 'preset')
  const showCreate =
    searchValue && !filtered.some((m) => m.label.toLowerCase() === searchValue.toLowerCase())

  const renderItem = (m: ModelItem) => (
    <div key={m.value} className="group flex">
      <CommandItem
        value={m.value}
        onSelect={(current) => {
          onChange?.(current === value ? '' : current)
          setSearchValue('')
          setOpen(false)
        }}
        className="flex-1"
      >
        {m.label}
        <Check
          className={cn('ml-auto', value === m.value ? 'opacity-100' : 'opacity-0')}
        />
      </CommandItem>
      {m.isCustom && (
        <div className="hidden group-hover:flex">
          <button
            className="text-muted-foreground hover:text-red-500 cursor-pointer"
            onClick={() => deleteCustomModel(m.value)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn('w-60 justify-between', className)}
        >
          {value ? (models.find((m) => m.value === value)?.label ?? value) : '选择模型...'}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-0">
        <Command>
          <CommandInput
            placeholder="输入以搜索或创建..."
            className="h-9"
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>未找到结果</CommandEmpty>
            {serverItems.length > 0 && (
              <CommandGroup heading="服务端模型（测试连接获取）">
                {serverItems.map(renderItem)}
              </CommandGroup>
            )}
            <CommandGroup>
              {presetItems.map(renderItem)}
              {showCreate && (
                <CommandItem
                  value={`create-${searchValue}`}
                  onSelect={() => addCustomModel(searchValue)}
                  className="!text-primary"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  创建 “{searchValue}”
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
